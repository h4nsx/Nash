using System.Text.Json;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Services;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class MatchEngineService : IMatchEngineService
{
    private readonly AppDbContext _context;

    public MatchEngineService(AppDbContext context)
    {
        _context = context;
    }

    private sealed class RankedMatchCandidate : IMatchRankingCandidate
    {
        public required Match Match { get; init; }
        public required User Freelancer { get; init; }
        public required List<string> ReasonCodes { get; init; }
        public required List<string> Reasons { get; init; }
        public Guid FreelancerId => Freelancer.Id;
        public decimal Score => Match.Score;
        public int MandatoryCoveredCount { get; init; }
        public int VerifiedCoveredCount { get; init; }
        public bool IsAvailable { get; init; }
    }

    private sealed class StoredReasonsPayload
    {
        public List<string> Codes { get; set; } = new();
        public List<string> Reasons { get; set; } = new();
    }

    public async Task<(bool Success, List<MatchDto> Matches, string[] Errors)> GenerateMatchesAsync(Guid projectId, string clientId)
    {
        var project = await _context.Projects
            .Include(p => p.SkillRequirements)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));

        if (project == null)
            return (false, new List<MatchDto>(), new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });

        if (project.Status != ProjectStatus.Published)
            return (false, new List<MatchDto>(), new[] { "Chỉ có thể tìm kiếm ứng viên cho dự án đã xuất bản." });

        var freelancers = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
            .Include(u => u.VerifiedSkills)
                .ThenInclude(vs => vs.Skill)
            .Where(u => u.Role == Role.Freelancer && u.FreelancerProfile != null)
            .ToListAsync();

        var candidates = new List<RankedMatchCandidate>();
        var matchVersion = "match-v1";

        foreach (var freelancer in freelancers)
        {
            var profile = freelancer.FreelancerProfile!;
            if (!profile.IsAvailable) continue;

            var mandatoryReqs = project.SkillRequirements.Where(r => r.IsMandatory).ToList();
            bool eligible = true;
            foreach (var req in mandatoryReqs)
            {
                if (!freelancer.VerifiedSkills.Any(vs => vs.SkillId == req.SkillId && vs.Status == VerifiedSkillStatus.Verified))
                {
                    eligible = false;
                    break;
                }
            }
            if (!eligible) continue;

            decimal score = 0;
            var reasons = new List<string>();
            var reasonCodes = new List<string>();
            int mandatoryCovered = 0;
            int verifiedMatches = 0;

            if (project.SkillRequirements.Any())
            {
                int matchedSkills = 0;
                foreach (var req in project.SkillRequirements)
                {
                    bool isVerified = freelancer.VerifiedSkills.Any(vs => vs.SkillId == req.SkillId && vs.Status == VerifiedSkillStatus.Verified);
                    if (isVerified)
                    {
                        matchedSkills++;
                        verifiedMatches++;
                        if (req.IsMandatory) mandatoryCovered++;
                    }
                }

                decimal skillRatio = (decimal)matchedSkills / project.SkillRequirements.Count;
                score += skillRatio * 40m;

                decimal verifiedRatio = (decimal)verifiedMatches / project.SkillRequirements.Count;
                score += verifiedRatio * 25m;

                if (matchedSkills > 0)
                {
                    reasonCodes.Add("required_skill");
                    reasons.Add($"Đáp ứng {matchedSkills}/{project.SkillRequirements.Count} kỹ năng yêu cầu.");
                }
                if (verifiedMatches > 0)
                {
                    reasonCodes.Add("verified_skill");
                    reasons.Add($"Có {verifiedMatches} kỹ năng đã qua kiểm định xác thực.");
                }
            }
            else
            {
                score += 65m;
            }

            var maxExpReq = project.SkillRequirements.Any()
                ? (project.SkillRequirements.Max(r => r.MinimumExperienceYears) ?? 0)
                : 0;
            int levelExpReq = project.ExperienceLevel switch
            {
                ExperienceLevel.Expert => 5,
                ExperienceLevel.Intermediate => 3,
                _ => 1
            };
            int effectiveExpReq = Math.Max(maxExpReq, levelExpReq);

            if (profile.YearsOfExperience.HasValue && profile.YearsOfExperience.Value >= effectiveExpReq)
            {
                score += 15m;
                reasonCodes.Add("experience");
                reasons.Add($"Kinh nghiệm ({profile.YearsOfExperience} năm) đạt yêu cầu dự án ({project.ExperienceLevel}).");
            }
            else if (!profile.YearsOfExperience.HasValue && effectiveExpReq <= 1)
            {
                score += 10m;
            }

            if (project.PricingType == PricingType.Hourly && project.HourlyRateMax.HasValue && profile.HourlyRate.HasValue)
            {
                if (profile.HourlyRate.Value <= project.HourlyRateMax.Value)
                {
                    score += 10m;
                    reasonCodes.Add("budget_fit");
                    reasons.Add("Mức thù lao theo giờ phù hợp ngân sách.");
                }
            }
            else if (project.BudgetMax.HasValue && profile.HourlyRate.HasValue)
            {
                if (profile.HourlyRate.Value * 40 <= project.BudgetMax.Value)
                {
                    score += 10m;
                    reasonCodes.Add("budget_fit");
                    reasons.Add("Ngân sách phù hợp với mức thù lao đề xuất.");
                }
            }
            else
            {
                score += 10m;
                reasonCodes.Add("budget_fit");
                reasons.Add("Phù hợp khung ngân sách dự án.");
            }

            if (profile.IsAvailable)
            {
                score += 10m;
                reasonCodes.Add("availability");
                reasons.Add("Sẵn sàng bắt đầu ngay.");
            }

            var payload = new StoredReasonsPayload
            {
                Codes = reasonCodes,
                Reasons = reasons
            };

            var match = new Match
            {
                ProjectId = projectId,
                FreelancerId = freelancer.Id,
                Score = score,
                MatchVersion = matchVersion,
                ReasonsJson = JsonSerializer.Serialize(payload),
                Status = MatchStatus.Generated,
                CreatedAt = DateTime.UtcNow
            };

            candidates.Add(new RankedMatchCandidate
            {
                Match = match,
                Freelancer = freelancer,
                ReasonCodes = reasonCodes,
                Reasons = reasons,
                MandatoryCoveredCount = mandatoryCovered,
                VerifiedCoveredCount = verifiedMatches,
                IsAvailable = profile.IsAvailable
            });
        }

        // Expire previous Generated / Recommended snapshots safely without touching Viewed or Dismissed records
        var priorActiveMatches = await _context.Matches
            .Where(m => m.ProjectId == projectId &&
                        (m.Status == MatchStatus.Generated || m.Status == MatchStatus.Recommended))
            .ToListAsync();

        foreach (var oldMatch in priorActiveMatches)
        {
            oldMatch.Status = MatchStatus.Expired;
        }

        var top3 = MatchRanker.RankTop(candidates, 3);
        foreach (var item in top3)
        {
            item.Match.Status = MatchStatus.Recommended;
        }

        _context.Matches.AddRange(top3.Select(x => x.Match));
        await _context.SaveChangesAsync();

        var dtos = top3.Select(x => MapToDto(x.Match, x.Freelancer, x.ReasonCodes, x.Reasons)).ToList();
        return (true, dtos, Array.Empty<string>());
    }

    public async Task<List<MatchDto>> GetMatchesForProjectAsync(Guid projectId, string clientId)
    {
        var matches = await _context.Matches
            .Include(m => m.Freelancer)
                .ThenInclude(f => f.FreelancerProfile)
            .Include(m => m.Freelancer)
                .ThenInclude(f => f.VerifiedSkills)
                    .ThenInclude(vs => vs.Skill)
            .Where(m => m.ProjectId == projectId &&
                        m.Project.ClientId == Guid.Parse(clientId) &&
                        m.Status != MatchStatus.Expired)
            .OrderByDescending(m => m.Score)
            .ThenBy(m => m.FreelancerId)
            .ToListAsync();

        return matches.Select(m =>
        {
            var (codes, reasons) = ParseReasonsJson(m.ReasonsJson);
            return MapToDto(m, m.Freelancer, codes, reasons);
        }).ToList();
    }

    public async Task<(bool Success, string[] Errors)> UpdateMatchStatusAsync(Guid matchId, MatchStatus status, string clientId)
    {
        var match = await _context.Matches
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == matchId && m.Project.ClientId == Guid.Parse(clientId));

        if (match == null) return (false, new[] { "Không tìm thấy kết quả phù hợp." });

        match.Status = status;
        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    private static MatchDto MapToDto(Match m, User freelancer, List<string> codes, List<string> reasons)
    {
        var profile = freelancer.FreelancerProfile;
        return new MatchDto
        {
            Id = m.Id,
            ProjectId = m.ProjectId,
            FreelancerId = m.FreelancerId,
            FreelancerName = $"{freelancer.FirstName} {freelancer.LastName}".Trim(),
            Headline = profile?.Headline ?? string.Empty,
            HourlyRate = profile?.HourlyRate,
            YearsOfExperience = profile?.YearsOfExperience,
            JobSuccessScore = profile?.JobSuccessScore ?? 100m,
            VerifiedSkills = freelancer.VerifiedSkills
                .Where(vs => vs.Status == VerifiedSkillStatus.Verified && vs.Skill != null)
                .Select(vs => vs.Skill.Name)
                .Distinct()
                .ToList(),
            Score = m.Score,
            MatchVersion = m.MatchVersion,
            ReasonCodes = codes,
            Reasons = reasons,
            Status = m.Status
        };
    }

    private static (List<string> Codes, List<string> Reasons) ParseReasonsJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return (new List<string>(), new List<string>());

        try
        {
            var trimmed = json.TrimStart();
            if (trimmed.StartsWith("["))
            {
                var list = JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
                return (new List<string>(), list);
            }

            var payload = JsonSerializer.Deserialize<StoredReasonsPayload>(json);
            return (payload?.Codes ?? new List<string>(), payload?.Reasons ?? new List<string>());
        }
        catch
        {
            return (new List<string>(), new List<string>());
        }
    }
}

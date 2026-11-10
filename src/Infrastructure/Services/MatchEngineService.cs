using System.Text.Json;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
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

    public async Task<(bool Success, List<MatchDto> Matches, string[] Errors)> GenerateMatchesAsync(Guid projectId, string clientId)
    {
        var project = await _context.Projects
            .Include(p => p.SkillRequirements)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));

        if (project == null)
            return (false, new List<MatchDto>(), new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });

        if (project.Status != ProjectStatus.Published)
            return (false, new List<MatchDto>(), new[] { "Chỉ có thể tìm kiếm ứng viên cho dự án đã xuất bản." });

        // Retrieve all freelancers with a profile
        var freelancers = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
            .Include(u => u.VerifiedSkills)
            .Where(u => u.Role == Role.Freelancer && u.FreelancerProfile != null)
            .ToListAsync();

        var matchesToSave = new List<Match>();
        var matchVersion = "match-v1";

        foreach (var freelancer in freelancers)
        {
            var profile = freelancer.FreelancerProfile!;
            var reasons = new List<string>();

            // --- 1. Eligibility (Hard Filter) ---
            if (!profile.IsAvailable) continue; // Must be available

            bool eligible = true;
            foreach (var req in project.SkillRequirements.Where(r => r.IsMandatory))
            {
                // To be strictly eligible, they must have this skill verified (for MVP strictness)
                // or at least we could check if they have it. We will mandate it must be a VerifiedSkill for strictness.
                if (!freelancer.VerifiedSkills.Any(vs => vs.SkillId == req.SkillId && vs.Status == VerifiedSkillStatus.Verified))
                {
                    eligible = false;
                    break;
                }
            }
            if (!eligible) continue;

            // --- 2. Scoring ---
            decimal score = 0;

            // Skill Match (40%) & Verified Skills (25%)
            if (project.SkillRequirements.Any())
            {
                int matchedSkills = 0;
                int verifiedMatches = 0;
                foreach (var req in project.SkillRequirements)
                {
                    bool isVerified = freelancer.VerifiedSkills.Any(vs => vs.SkillId == req.SkillId && vs.Status == VerifiedSkillStatus.Verified);
                    if (isVerified)
                    {
                        matchedSkills++;
                        verifiedMatches++;
                    }
                }

                decimal skillRatio = (decimal)matchedSkills / project.SkillRequirements.Count;
                score += skillRatio * 40m;

                decimal verifiedRatio = (decimal)verifiedMatches / project.SkillRequirements.Count;
                score += verifiedRatio * 25m;
                
                if (matchedSkills > 0) reasons.Add("Kỹ năng phù hợp với yêu cầu.");
                if (verifiedMatches > 0) reasons.Add("Có kỹ năng đã được xác thực (Verified).");
            }
            else
            {
                // If no skills required (edge case, though publish rules prevent it), give full points
                score += 65m; 
            }

            // Experience (15%)
            var maxExpReq = project.SkillRequirements.Max(r => r.MinimumExperienceYears) ?? 0;
            if (maxExpReq > 0)
            {
                if (profile.YearsOfExperience >= maxExpReq)
                {
                    score += 15m;
                    reasons.Add("Kinh nghiệm làm việc đáp ứng yêu cầu.");
                }
            }
            else
            {
                score += 15m; // No specific exp required
            }

            // Budget Fit (10%)
            if (project.BudgetMax.HasValue && profile.HourlyRate.HasValue)
            {
                // Simple heuristic: if hourly rate * 40 (approx 1 week) <= BudgetMax
                if (profile.HourlyRate.Value * 40 <= project.BudgetMax.Value)
                {
                    score += 10m;
                    reasons.Add("Ngân sách phù hợp (dựa trên mức lương theo giờ).");
                }
            }
            else
            {
                score += 10m;
            }

            // Availability (10%)
            if (profile.IsAvailable)
            {
                score += 10m;
                reasons.Add("Sẵn sàng làm việc ngay.");
            }

            var match = new Match
            {
                ProjectId = projectId,
                FreelancerId = freelancer.Id,
                Score = score,
                MatchVersion = matchVersion,
                ReasonsJson = JsonSerializer.Serialize(reasons),
                Status = MatchStatus.Generated,
                CreatedAt = DateTime.UtcNow
            };
            matchesToSave.Add(match);
        }

        // --- 3. Ranking & Top 3 ---
        var top3 = matchesToSave
            .OrderByDescending(m => m.Score)
            .Take(3)
            .ToList();

        foreach (var m in top3) m.Status = MatchStatus.Recommended;

        // Save to DB
        _context.Matches.AddRange(top3);
        await _context.SaveChangesAsync();

        var dtos = top3.Select(m => new MatchDto
        {
            Id = m.Id,
            ProjectId = m.ProjectId,
            FreelancerId = m.FreelancerId,
            FreelancerName = freelancers.First(f => f.Id == m.FreelancerId).FirstName + " " + freelancers.First(f => f.Id == m.FreelancerId).LastName,
            Score = m.Score,
            MatchVersion = m.MatchVersion,
            Reasons = JsonSerializer.Deserialize<List<string>>(m.ReasonsJson) ?? new List<string>(),
            Status = m.Status
        }).ToList();

        return (true, dtos, Array.Empty<string>());
    }

    public async Task<List<MatchDto>> GetMatchesForProjectAsync(Guid projectId, string clientId)
    {
        return await _context.Matches
            .Include(m => m.Freelancer)
            .Where(m => m.ProjectId == projectId && m.Project.ClientId == Guid.Parse(clientId))
            .OrderByDescending(m => m.Score)
            .Select(m => new MatchDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId,
                FreelancerId = m.FreelancerId,
                FreelancerName = m.Freelancer.FirstName + " " + m.Freelancer.LastName,
                Score = m.Score,
                MatchVersion = m.MatchVersion,
                Reasons = string.IsNullOrEmpty(m.ReasonsJson) ? new List<string>() : (JsonSerializer.Deserialize<List<string>>(m.ReasonsJson, (JsonSerializerOptions?)null) ?? new List<string>()),
                Status = m.Status
            })
            .ToListAsync();
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
}

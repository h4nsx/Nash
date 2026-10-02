using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

using Infrastructure.Persistence;

namespace Infrastructure.Services;

public class SkillService : ISkillService
{
    private readonly AppDbContext _context;

    public SkillService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SkillDto>> GetActiveSkillsAsync()
    {
        return await _context.Skills
            .Where(s => s.IsActive)
            .Select(s => new SkillDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description
            })
            .ToListAsync();
    }

    public async Task<(bool Success, SkillTestAttemptDto? Attempt, string[] Errors)> StartTestAttemptAsync(string userId, Guid skillId)
    {
        // 1. Get the latest active test for the skill
        var skillTest = await _context.SkillTests
            .Where(st => st.SkillId == skillId && st.Status == TestStatus.Active)
            .OrderByDescending(st => st.CreatedAt)
            .FirstOrDefaultAsync();

        if (skillTest == null)
        {
            return (false, null, new[] { "Không tìm thấy bài kiểm tra nào cho kỹ năng này." });
        }

        var userGuid = Guid.Parse(userId);

        // 2. Ensure user isn't already taking it (In Progress)
        var existingAttempt = await _context.SkillTestAttempts
            .FirstOrDefaultAsync(a => a.UserId == userGuid && a.SkillTestId == skillTest.Id && a.Status == AttemptStatus.InProgress);

        if (existingAttempt != null)
        {
            return (false, null, new[] { "Bạn đang có một bài kiểm tra chưa hoàn thành cho kỹ năng này." });
        }

        // 3. Create new attempt
        var attempt = new SkillTestAttempt
        {
            UserId = userGuid,
            SkillTestId = skillTest.Id,
            Status = AttemptStatus.InProgress,
            StartedAt = DateTime.UtcNow
        };

        _context.SkillTestAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        var dto = new SkillTestAttemptDto
        {
            AttemptId = attempt.Id,
            SkillTestId = skillTest.Id,
            Title = skillTest.Title,
            TimeLimitMinutes = skillTest.TimeLimitMinutes,
            TasksJson = skillTest.TasksJson,
            StartedAt = attempt.StartedAt.Value
        };

        return (true, dto, Array.Empty<string>());
    }

    public async Task<(bool Success, int Score, string[] Errors)> SubmitTestAttemptAsync(string userId, Guid attemptId, string userAnswersJson)
    {
        var attempt = await _context.SkillTestAttempts
            .Include(a => a.SkillTest)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == Guid.Parse(userId));

        if (attempt == null)
        {
            return (false, 0, new[] { "Không tìm thấy bài kiểm tra." });
        }

        if (attempt.Status != AttemptStatus.InProgress)
        {
            return (false, 0, new[] { "Bài kiểm tra này đã được nộp hoặc chưa bắt đầu." });
        }

        // Time validation (with 2 min buffer for network latency)
        var timeElapsed = DateTime.UtcNow - attempt.StartedAt!.Value;
        if (timeElapsed.TotalMinutes > attempt.SkillTest.TimeLimitMinutes + 2)
        {
            attempt.Status = AttemptStatus.Failed;
            attempt.SubmittedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return (false, 0, new[] { "Hết thời gian làm bài." });
        }

        // TODO: In a real app, parse userAnswersJson and score it against SkillTest.TasksJson
        // For MVP, we mock a random score between 0 and 100
        var score = new Random().Next(40, 100); 

        attempt.UserAnswersJson = userAnswersJson;
        attempt.SubmittedAt = DateTime.UtcNow;
        attempt.Score = score;
        
        var passed = score >= attempt.SkillTest.PassingScore;
        attempt.Status = passed ? AttemptStatus.Passed : AttemptStatus.Failed;

        if (passed)
        {
            var verifiedSkill = new VerifiedSkill
            {
                UserId = attempt.UserId,
                SkillId = attempt.SkillTest.SkillId,
                SkillTestAttemptId = attempt.Id,
                Status = VerifiedSkillStatus.Verified,
                VerifiedAt = DateTime.UtcNow
            };
            _context.VerifiedSkills.Add(verifiedSkill);
        }

        await _context.SaveChangesAsync();

        return (true, score, Array.Empty<string>());
    }

    public async Task<List<VerifiedSkillDto>> GetVerifiedSkillsAsync(string userId)
    {
        return await _context.VerifiedSkills
            .Include(vs => vs.Skill)
            .Where(vs => vs.UserId == Guid.Parse(userId) && vs.Status == VerifiedSkillStatus.Verified)
            .Select(vs => new VerifiedSkillDto
            {
                Id = vs.Id,
                SkillName = vs.Skill.Name,
                VerifiedAt = vs.VerifiedAt,
                ExpiredAt = vs.ExpiredAt
            })
            .ToListAsync();
    }
}

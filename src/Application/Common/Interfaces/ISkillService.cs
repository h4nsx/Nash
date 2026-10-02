using Application.Common.Models;

namespace Application.Common.Interfaces;

public interface ISkillService
{
    // Retrieve all active skills
    Task<List<SkillDto>> GetActiveSkillsAsync();

    // Start a new test attempt
    Task<(bool Success, SkillTestAttemptDto? Attempt, string[] Errors)> StartTestAttemptAsync(string userId, Guid skillId);

    // Submit an ongoing test attempt
    Task<(bool Success, int Score, string[] Errors)> SubmitTestAttemptAsync(string userId, Guid attemptId, string userAnswersJson);

    // Get verified skills for a user
    Task<List<VerifiedSkillDto>> GetVerifiedSkillsAsync(string userId);
}

public class SkillDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class SkillTestAttemptDto
{
    public Guid AttemptId { get; set; }
    public Guid SkillTestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int TimeLimitMinutes { get; set; }
    public string TasksJson { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
}

public class VerifiedSkillDto
{
    public Guid Id { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public DateTime VerifiedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
}

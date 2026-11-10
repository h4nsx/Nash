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

    // Admin: Get all skills (including inactive)
    Task<List<SkillDto>> GetAllSkillsAsync();

    // Admin: Create skill
    Task<(bool Success, Guid SkillId, string[] Errors)> CreateSkillAsync(CreateSkillDto request);

    // Admin: Update skill
    Task<(bool Success, string[] Errors)> UpdateSkillAsync(Guid skillId, UpdateSkillDto request);

    // Admin: Delete skill
    Task<(bool Success, string[] Errors)> DeleteSkillAsync(Guid skillId);

    // Categories overview with live statistics
    Task<List<SkillCategoryOverviewDto>> GetSkillCategoriesOverviewAsync();
}

public class SkillDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateSkillDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateSkillDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
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

public class SkillCategoryOverviewDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool HasTest { get; set; }
    public int VerifiedFreelancersCount { get; set; }
    public int ActiveProjectsCount { get; set; }
}

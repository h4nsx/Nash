using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IProjectService
{
    Task<(bool Success, Guid ProjectId, string[] Errors)> CreateProjectAsync(CreateProjectDto request, string clientId);
    Task<(bool Success, string[] Errors)> UpdateProjectAsync(Guid projectId, UpdateProjectDto request, string clientId);
    Task<(bool Success, string[] Errors)> AddOrUpdateSkillRequirementAsync(Guid projectId, SkillRequirementDto request, string clientId);
    Task<(bool Success, string[] Errors)> RemoveSkillRequirementAsync(Guid projectId, Guid requirementId, string clientId);
    Task<(bool Success, string[] Errors)> PublishProjectAsync(Guid projectId, string clientId);
    Task<List<ProjectDto>> GetClientProjectsAsync(string clientId);
    Task<List<ProjectDto>> GetPublishedProjectsAsync();
    Task<ProjectDto?> GetProjectByIdAsync(Guid projectId);
}

public class CreateProjectDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class UpdateProjectDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class SkillRequirementDto
{
    public Guid SkillId { get; set; }
    public bool IsMandatory { get; set; } = true;
    public int? MinimumExperienceYears { get; set; }
}

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<ProjectSkillRequirementDto> SkillRequirements { get; set; } = new();
}

public class ProjectSkillRequirementDto
{
    public Guid Id { get; set; }
    public Guid SkillId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public bool IsMandatory { get; set; }
    public int? MinimumExperienceYears { get; set; }
}

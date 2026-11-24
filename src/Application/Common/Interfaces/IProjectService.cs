using Domain.Entities;
using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IProjectService
{
    Task<(bool Success, Guid ProjectId, string[] Errors)> CreateProjectAsync(CreateProjectDto request, string clientId);
    Task<(bool Success, string[] Errors)> UpdateProjectAsync(Guid projectId, UpdateProjectDto request, string clientId);
    Task<(bool Success, string[] Errors)> AddOrUpdateSkillRequirementAsync(Guid projectId, SkillRequirementDto request, string clientId);
    Task<(bool Success, string[] Errors)> RemoveSkillRequirementAsync(Guid projectId, Guid skillId, string clientId);
    Task<(bool Success, string[] Errors)> PublishProjectAsync(Guid projectId, string clientId);
    Task<(bool Success, string[] Errors)> CloseProjectAsync(Guid projectId, string clientId);
    Task<ProjectDto?> GetProjectByIdAsync(Guid projectId);
    Task<List<ProjectDto>> GetClientProjectsAsync(string clientId);
    Task<List<ProjectDto>> GetPublishedProjectsAsync();
}

public class CreateProjectDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public PricingType PricingType { get; set; } = PricingType.FixedPrice;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? HourlyRateMin { get; set; }
    public decimal? HourlyRateMax { get; set; }
    public ProjectScope Scope { get; set; } = ProjectScope.Medium;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.Intermediate;
    public string LocationPreference { get; set; } = "Worldwide";
    public string PreferredLanguage { get; set; } = "Any";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> FileAttachments { get; set; } = new();
    public List<SkillRequirementDto> SkillRequirements { get; set; } = new();
}

public class UpdateProjectDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public PricingType PricingType { get; set; } = PricingType.FixedPrice;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? HourlyRateMin { get; set; }
    public decimal? HourlyRateMax { get; set; }
    public ProjectScope Scope { get; set; } = ProjectScope.Medium;
    public ExperienceLevel ExperienceLevel { get; set; } = ExperienceLevel.Intermediate;
    public string LocationPreference { get; set; } = "Worldwide";
    public string PreferredLanguage { get; set; } = "Any";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> FileAttachments { get; set; } = new();
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
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public PricingType PricingType { get; set; }
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public decimal? HourlyRateMin { get; set; }
    public decimal? HourlyRateMax { get; set; }
    public ProjectScope Scope { get; set; }
    public ExperienceLevel ExperienceLevel { get; set; }
    public string LocationPreference { get; set; } = string.Empty;
    public string PreferredLanguage { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> FileAttachments { get; set; } = new();
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

using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
    Task<(bool Success, string[] Errors)> UpdateUserAsync(Guid id, UpdateUserDto request);
    Task<(bool Success, string[] Errors)> DeleteUserAsync(Guid id);
    
    // Freelancer Profile & Unified Portfolio
    Task<FreelancerProfileDto?> GetFreelancerProfileAsync(string userId);
    Task<(bool Success, string[] Errors)> UpdateFreelancerProfileAsync(string userId, UpdateFreelancerProfileDto request);
    Task<PublicFreelancerDto?> GetPublicFreelancerByIdAsync(Guid freelancerId);
    Task<List<PublicFreelancerDto>> GetPublicFreelancersAsync(string? skill = null, string? search = null);
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class PortfolioItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LiveUrl { get; set; }
    public string? RepoUrl { get; set; }
    public List<string> TechStack { get; set; } = new();
    public List<string> ImageUrls { get; set; } = new();
    public DateTime? CompletedAt { get; set; }
}

public class WorkExperienceDto
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrentRole { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class EducationDto
{
    public Guid Id { get; set; }
    public string School { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public int StartYear { get; set; }
    public int? EndYear { get; set; }
}

public class CertificationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime? IssueDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
}

public class LanguageProficiencyDto
{
    public Guid Id { get; set; }
    public string Language { get; set; } = string.Empty;
    public string ProficiencyLevel { get; set; } = string.Empty;
}

public class FreelancerProfileDto
{
    public Guid Id { get; set; }
    public string Headline { get; set; } = string.Empty;
    public decimal? HourlyRate { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
    public string HoursPerWeek { get; set; } = string.Empty;
    public string? GithubUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public decimal JobSuccessScore { get; set; }
    public string? BankBin { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankAccountName { get; set; }
    public List<string> Skills { get; set; } = new();
    public List<PortfolioItemDto> PortfolioItems { get; set; } = new();
    public List<WorkExperienceDto> WorkExperiences { get; set; } = new();
    public List<EducationDto> Educations { get; set; } = new();
    public List<CertificationDto> Certifications { get; set; } = new();
    public List<LanguageProficiencyDto> Languages { get; set; } = new();
}

public class UpdateFreelancerProfileDto
{
    public string Headline { get; set; } = string.Empty;
    public decimal? HourlyRate { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Timezone { get; set; } = "UTC+7";
    public string HoursPerWeek { get; set; } = "> 30 hrs/week";
    public string? GithubUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? BankBin { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankAccountName { get; set; }
    public List<PortfolioItemDto> PortfolioItems { get; set; } = new();
    public List<WorkExperienceDto> WorkExperiences { get; set; } = new();
    public List<EducationDto> Educations { get; set; } = new();
    public List<CertificationDto> Certifications { get; set; } = new();
    public List<LanguageProficiencyDto> Languages { get; set; } = new();
}

public class PublicFreelancerDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public decimal? HourlyRate { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
    public string HoursPerWeek { get; set; } = string.Empty;
    public string? GithubUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public decimal JobSuccessScore { get; set; }
    public List<string> VerifiedSkills { get; set; } = new();
    public int CompletedProjectsCount { get; set; }
    public List<PortfolioItemDto> PortfolioItems { get; set; } = new();
    public List<WorkExperienceDto> WorkExperiences { get; set; } = new();
    public List<EducationDto> Educations { get; set; } = new();
    public List<CertificationDto> Certifications { get; set; } = new();
    public List<LanguageProficiencyDto> Languages { get; set; } = new();
}

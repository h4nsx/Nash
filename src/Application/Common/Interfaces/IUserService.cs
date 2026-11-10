using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
    Task<(bool Success, string[] Errors)> UpdateUserAsync(Guid id, UpdateUserDto request);
    Task<(bool Success, string[] Errors)> DeleteUserAsync(Guid id);
    
    // Freelancer Profile
    Task<FreelancerProfileDto?> GetFreelancerProfileAsync(string userId);
    Task<(bool Success, string[] Errors)> UpdateFreelancerProfileAsync(string userId, UpdateFreelancerProfileDto request);
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

public class FreelancerProfileDto
{
    public Guid Id { get; set; }
    public decimal? HourlyRate { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string Bio { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
}

public class UpdateFreelancerProfileDto
{
    public decimal? HourlyRate { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string Bio { get; set; } = string.Empty;
}

public class PublicFreelancerDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public decimal? HourlyRate { get; set; }
    public int? YearsOfExperience { get; set; }
    public bool IsAvailable { get; set; }
    public string Bio { get; set; } = string.Empty;
    public List<string> VerifiedSkills { get; set; } = new();
    public int CompletedProjectsCount { get; set; }
}

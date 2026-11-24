using System.Text.Json;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Identity;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        return await _context.DomainUsers
            .Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Role = u.Role.ToString()
            })
            .ToListAsync();
    }

    public async Task<(bool Success, string[] Errors)> UpdateUserAsync(Guid id, UpdateUserDto request)
    {
        var user = await _context.DomainUsers.FindAsync(id);
        if (user == null)
        {
            return (false, new[] { "Không tìm thấy người dùng." });
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        if (Enum.TryParse<Role>(request.Role, true, out var role))
        {
            user.Role = role;
        }

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> DeleteUserAsync(Guid id)
    {
        var domainUser = await _context.DomainUsers.FindAsync(id);
        if (domainUser == null)
        {
            return (false, new[] { "Không tìm thấy người dùng." });
        }

        var identityUser = await _userManager.FindByIdAsync(domainUser.IdentityId);
        
        _context.DomainUsers.Remove(domainUser);
        await _context.SaveChangesAsync();

        if (identityUser != null)
        {
            await _userManager.DeleteAsync(identityUser);
        }

        return (true, Array.Empty<string>());
    }

    public async Task<FreelancerProfileDto?> GetFreelancerProfileAsync(string userId)
    {
        var user = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.PortfolioItems)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.WorkExperiences)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Educations)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Certifications)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Languages)
            .Include(u => u.VerifiedSkills)
                .ThenInclude(vs => vs.Skill)
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null || user.Role != Role.Freelancer)
            return null;

        if (user.FreelancerProfile == null)
        {
            var newProfile = new Domain.Entities.FreelancerProfile
            {
                UserId = user.Id
            };
            _context.Add(newProfile);
            await _context.SaveChangesAsync();
            user.FreelancerProfile = newProfile;
        }

        var profile = user.FreelancerProfile;

        return new FreelancerProfileDto
        {
            Id = profile.Id,
            Headline = profile.Headline,
            HourlyRate = profile.HourlyRate,
            YearsOfExperience = profile.YearsOfExperience,
            IsAvailable = profile.IsAvailable,
            Bio = profile.Bio,
            City = profile.City,
            Country = profile.Country,
            Timezone = profile.Timezone,
            HoursPerWeek = profile.HoursPerWeek,
            GithubUrl = profile.GithubUrl,
            LinkedinUrl = profile.LinkedinUrl,
            WebsiteUrl = profile.WebsiteUrl,
            JobSuccessScore = profile.JobSuccessScore,
            BankBin = profile.BankBin,
            BankName = profile.BankName,
            BankAccountNumber = profile.BankAccountNumber,
            BankAccountName = profile.BankAccountName,
            Skills = user.VerifiedSkills.Select(vs => vs.Skill.Name).Distinct().ToList(),
            PortfolioItems = profile.PortfolioItems.Select(p => new PortfolioItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Role = p.Role,
                Description = p.Description,
                LiveUrl = p.LiveUrl,
                RepoUrl = p.RepoUrl,
                TechStack = DeserializeList(p.TechStackJson),
                ImageUrls = DeserializeList(p.ImageUrlsJson),
                CompletedAt = p.CompletedAt
            }).ToList(),
            WorkExperiences = profile.WorkExperiences.Select(w => new WorkExperienceDto
            {
                Id = w.Id,
                CompanyName = w.CompanyName,
                Position = w.Position,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                IsCurrentRole = w.IsCurrentRole,
                Description = w.Description
            }).OrderByDescending(w => w.StartDate).ToList(),
            Educations = profile.Educations.Select(e => new EducationDto
            {
                Id = e.Id,
                School = e.School,
                Degree = e.Degree,
                FieldOfStudy = e.FieldOfStudy,
                StartYear = e.StartYear,
                EndYear = e.EndYear
            }).OrderByDescending(e => e.StartYear).ToList(),
            Certifications = profile.Certifications.Select(c => new CertificationDto
            {
                Id = c.Id,
                Name = c.Name,
                Issuer = c.Issuer,
                IssueDate = c.IssueDate,
                CredentialId = c.CredentialId,
                CredentialUrl = c.CredentialUrl
            }).OrderByDescending(c => c.IssueDate).ToList(),
            Languages = profile.Languages.Select(l => new LanguageProficiencyDto
            {
                Id = l.Id,
                Language = l.Language,
                ProficiencyLevel = l.ProficiencyLevel
            }).ToList()
        };
    }

    public async Task<(bool Success, string[] Errors)> UpdateFreelancerProfileAsync(string userId, UpdateFreelancerProfileDto request)
    {
        var user = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.PortfolioItems)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.WorkExperiences)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Educations)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Certifications)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Languages)
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null || user.Role != Role.Freelancer)
        {
            return (false, new[] { "Không tìm thấy hồ sơ Freelancer." });
        }

        if (user.FreelancerProfile == null)
        {
            user.FreelancerProfile = new Domain.Entities.FreelancerProfile { UserId = user.Id };
            _context.Add(user.FreelancerProfile);
        }

        var profile = user.FreelancerProfile;
        profile.Headline = request.Headline ?? string.Empty;
        profile.HourlyRate = request.HourlyRate;
        profile.YearsOfExperience = request.YearsOfExperience;
        profile.IsAvailable = request.IsAvailable;
        profile.Bio = request.Bio ?? string.Empty;
        profile.City = request.City ?? string.Empty;
        profile.Country = request.Country ?? string.Empty;
        profile.Timezone = string.IsNullOrWhiteSpace(request.Timezone) ? "UTC+7" : request.Timezone;
        profile.HoursPerWeek = string.IsNullOrWhiteSpace(request.HoursPerWeek) ? "> 30 hrs/week" : request.HoursPerWeek;
        profile.GithubUrl = request.GithubUrl;
        profile.LinkedinUrl = request.LinkedinUrl;
        profile.WebsiteUrl = request.WebsiteUrl;
        profile.BankBin = request.BankBin;
        profile.BankName = request.BankName;
        profile.BankAccountNumber = request.BankAccountNumber;
        profile.BankAccountName = request.BankAccountName;

        // Sync PortfolioItems
        _context.PortfolioItems.RemoveRange(profile.PortfolioItems);
        if (request.PortfolioItems != null)
        {
            foreach (var item in request.PortfolioItems)
            {
                profile.PortfolioItems.Add(new PortfolioItem
                {
                    FreelancerProfileId = profile.Id,
                    Title = item.Title,
                    Role = item.Role,
                    Description = item.Description,
                    LiveUrl = item.LiveUrl,
                    RepoUrl = item.RepoUrl,
                    TechStackJson = JsonSerializer.Serialize(item.TechStack ?? new List<string>()),
                    ImageUrlsJson = JsonSerializer.Serialize(item.ImageUrls ?? new List<string>()),
                    CompletedAt = item.CompletedAt
                });
            }
        }

        // Sync WorkExperiences
        _context.WorkExperiences.RemoveRange(profile.WorkExperiences);
        if (request.WorkExperiences != null)
        {
            foreach (var exp in request.WorkExperiences)
            {
                profile.WorkExperiences.Add(new WorkExperience
                {
                    FreelancerProfileId = profile.Id,
                    CompanyName = exp.CompanyName,
                    Position = exp.Position,
                    StartDate = exp.StartDate.ToUniversalTime(),
                    EndDate = exp.EndDate.HasValue ? exp.EndDate.Value.ToUniversalTime() : null,
                    IsCurrentRole = exp.IsCurrentRole,
                    Description = exp.Description
                });
            }
        }

        // Sync Educations
        _context.Educations.RemoveRange(profile.Educations);
        if (request.Educations != null)
        {
            foreach (var edu in request.Educations)
            {
                profile.Educations.Add(new Education
                {
                    FreelancerProfileId = profile.Id,
                    School = edu.School,
                    Degree = edu.Degree,
                    FieldOfStudy = edu.FieldOfStudy,
                    StartYear = edu.StartYear,
                    EndYear = edu.EndYear
                });
            }
        }

        // Sync Certifications
        _context.Certifications.RemoveRange(profile.Certifications);
        if (request.Certifications != null)
        {
            foreach (var cert in request.Certifications)
            {
                profile.Certifications.Add(new Certification
                {
                    FreelancerProfileId = profile.Id,
                    Name = cert.Name,
                    Issuer = cert.Issuer,
                    IssueDate = cert.IssueDate.HasValue ? cert.IssueDate.Value.ToUniversalTime() : null,
                    CredentialId = cert.CredentialId,
                    CredentialUrl = cert.CredentialUrl
                });
            }
        }

        // Sync Languages
        _context.Languages.RemoveRange(profile.Languages);
        if (request.Languages != null)
        {
            foreach (var lang in request.Languages)
            {
                profile.Languages.Add(new LanguageProficiency
                {
                    FreelancerProfileId = profile.Id,
                    Language = lang.Language,
                    ProficiencyLevel = lang.ProficiencyLevel
                });
            }
        }

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<PublicFreelancerDto?> GetPublicFreelancerByIdAsync(Guid freelancerId)
    {
        var user = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.PortfolioItems)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.WorkExperiences)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Educations)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Certifications)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Languages)
            .Include(u => u.VerifiedSkills)
                .ThenInclude(vs => vs.Skill)
            .Include(u => u.ContractsAsFreelancer)
            .FirstOrDefaultAsync(u => u.Id == freelancerId && u.Role == Role.Freelancer);

        if (user == null) return null;

        var profile = user.FreelancerProfile;

        return new PublicFreelancerDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Headline = profile?.Headline ?? string.Empty,
            HourlyRate = profile?.HourlyRate,
            YearsOfExperience = profile?.YearsOfExperience,
            IsAvailable = profile?.IsAvailable ?? true,
            Bio = profile?.Bio ?? string.Empty,
            City = profile?.City ?? string.Empty,
            Country = profile?.Country ?? string.Empty,
            Timezone = profile?.Timezone ?? "UTC+7",
            HoursPerWeek = profile?.HoursPerWeek ?? "> 30 hrs/week",
            GithubUrl = profile?.GithubUrl,
            LinkedinUrl = profile?.LinkedinUrl,
            WebsiteUrl = profile?.WebsiteUrl,
            JobSuccessScore = profile?.JobSuccessScore ?? 100,
            VerifiedSkills = user.VerifiedSkills.Select(vs => vs.Skill.Name).Distinct().ToList(),
            CompletedProjectsCount = user.ContractsAsFreelancer.Count(c => c.Status == ContractStatus.Completed),
            PortfolioItems = profile?.PortfolioItems.Select(p => new PortfolioItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Role = p.Role,
                Description = p.Description,
                LiveUrl = p.LiveUrl,
                RepoUrl = p.RepoUrl,
                TechStack = DeserializeList(p.TechStackJson),
                ImageUrls = DeserializeList(p.ImageUrlsJson),
                CompletedAt = p.CompletedAt
            }).ToList() ?? new List<PortfolioItemDto>(),
            WorkExperiences = profile?.WorkExperiences.Select(w => new WorkExperienceDto
            {
                Id = w.Id,
                CompanyName = w.CompanyName,
                Position = w.Position,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                IsCurrentRole = w.IsCurrentRole,
                Description = w.Description
            }).OrderByDescending(w => w.StartDate).ToList() ?? new List<WorkExperienceDto>(),
            Educations = profile?.Educations.Select(e => new EducationDto
            {
                Id = e.Id,
                School = e.School,
                Degree = e.Degree,
                FieldOfStudy = e.FieldOfStudy,
                StartYear = e.StartYear,
                EndYear = e.EndYear
            }).OrderByDescending(e => e.StartYear).ToList() ?? new List<EducationDto>(),
            Certifications = profile?.Certifications.Select(c => new CertificationDto
            {
                Id = c.Id,
                Name = c.Name,
                Issuer = c.Issuer,
                IssueDate = c.IssueDate,
                CredentialId = c.CredentialId,
                CredentialUrl = c.CredentialUrl
            }).OrderByDescending(c => c.IssueDate).ToList() ?? new List<CertificationDto>(),
            Languages = profile?.Languages.Select(l => new LanguageProficiencyDto
            {
                Id = l.Id,
                Language = l.Language,
                ProficiencyLevel = l.ProficiencyLevel
            }).ToList() ?? new List<LanguageProficiencyDto>()
        };
    }

    public async Task<List<PublicFreelancerDto>> GetPublicFreelancersAsync(string? skill = null, string? search = null)
    {
        var query = _context.DomainUsers
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.PortfolioItems)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.WorkExperiences)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Educations)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Certifications)
            .Include(u => u.FreelancerProfile)
                .ThenInclude(fp => fp!.Languages)
            .Include(u => u.VerifiedSkills)
                .ThenInclude(vs => vs.Skill)
            .Include(u => u.ContractsAsFreelancer)
            .Where(u => u.Role == Role.Freelancer && (u.FreelancerProfile == null || u.FreelancerProfile.IsAvailable));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(u =>
                u.FirstName.ToLower().Contains(searchLower) ||
                u.LastName.ToLower().Contains(searchLower) ||
                (u.FreelancerProfile != null && (
                    u.FreelancerProfile.Headline.ToLower().Contains(searchLower) ||
                    u.FreelancerProfile.Bio.ToLower().Contains(searchLower)
                )) ||
                u.VerifiedSkills.Any(vs => vs.Skill.Name.ToLower().Contains(searchLower)));
        }

        if (!string.IsNullOrWhiteSpace(skill) && skill != "all")
        {
            var skillLower = skill.Trim().ToLower();
            query = query.Where(u => u.VerifiedSkills.Any(vs => vs.Skill.Name.ToLower() == skillLower));
        }

        var users = await query.ToListAsync();

        return users.Select(u => new PublicFreelancerDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Headline = u.FreelancerProfile?.Headline ?? string.Empty,
            HourlyRate = u.FreelancerProfile?.HourlyRate,
            YearsOfExperience = u.FreelancerProfile?.YearsOfExperience,
            IsAvailable = u.FreelancerProfile?.IsAvailable ?? true,
            Bio = u.FreelancerProfile?.Bio ?? string.Empty,
            City = u.FreelancerProfile?.City ?? string.Empty,
            Country = u.FreelancerProfile?.Country ?? string.Empty,
            Timezone = u.FreelancerProfile?.Timezone ?? "UTC+7",
            HoursPerWeek = u.FreelancerProfile?.HoursPerWeek ?? "> 30 hrs/week",
            GithubUrl = u.FreelancerProfile?.GithubUrl,
            LinkedinUrl = u.FreelancerProfile?.LinkedinUrl,
            WebsiteUrl = u.FreelancerProfile?.WebsiteUrl,
            JobSuccessScore = u.FreelancerProfile?.JobSuccessScore ?? 100,
            VerifiedSkills = u.VerifiedSkills.Select(vs => vs.Skill.Name).Distinct().ToList(),
            CompletedProjectsCount = u.ContractsAsFreelancer.Count(c => c.Status == ContractStatus.Completed),
            PortfolioItems = u.FreelancerProfile?.PortfolioItems.Select(p => new PortfolioItemDto
            {
                Id = p.Id,
                Title = p.Title,
                Role = p.Role,
                Description = p.Description,
                LiveUrl = p.LiveUrl,
                RepoUrl = p.RepoUrl,
                TechStack = DeserializeList(p.TechStackJson),
                ImageUrls = DeserializeList(p.ImageUrlsJson),
                CompletedAt = p.CompletedAt
            }).ToList() ?? new List<PortfolioItemDto>(),
            WorkExperiences = u.FreelancerProfile?.WorkExperiences.Select(w => new WorkExperienceDto
            {
                Id = w.Id,
                CompanyName = w.CompanyName,
                Position = w.Position,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                IsCurrentRole = w.IsCurrentRole,
                Description = w.Description
            }).OrderByDescending(w => w.StartDate).ToList() ?? new List<WorkExperienceDto>(),
            Educations = u.FreelancerProfile?.Educations.Select(e => new EducationDto
            {
                Id = e.Id,
                School = e.School,
                Degree = e.Degree,
                FieldOfStudy = e.FieldOfStudy,
                StartYear = e.StartYear,
                EndYear = e.EndYear
            }).OrderByDescending(e => e.StartYear).ToList() ?? new List<EducationDto>(),
            Certifications = u.FreelancerProfile?.Certifications.Select(c => new CertificationDto
            {
                Id = c.Id,
                Name = c.Name,
                Issuer = c.Issuer,
                IssueDate = c.IssueDate,
                CredentialId = c.CredentialId,
                CredentialUrl = c.CredentialUrl
            }).OrderByDescending(c => c.IssueDate).ToList() ?? new List<CertificationDto>(),
            Languages = u.FreelancerProfile?.Languages.Select(l => new LanguageProficiencyDto
            {
                Id = l.Id,
                Language = l.Language,
                ProficiencyLevel = l.ProficiencyLevel
            }).ToList() ?? new List<LanguageProficiencyDto>()
        }).ToList();
    }

    private static List<string> DeserializeList(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}

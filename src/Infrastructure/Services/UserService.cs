using Application.Common.Interfaces;
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
            // We do not allow changing to/from Admin unless we also update IdentityRole for the IdentityUser,
            // but for simplicity in MVP we only update the domain role. 
            // In a real application, you must update the Identity claims/roles via UserManager.
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
        
        // Remove from Domain (Cascade will handle related attempts/projects if configured)
        _context.DomainUsers.Remove(domainUser);
        await _context.SaveChangesAsync();

        if (identityUser != null)
        {
            // Remove from Identity
            await _userManager.DeleteAsync(identityUser);
        }

        return (true, Array.Empty<string>());
    }

    public async Task<FreelancerProfileDto?> GetFreelancerProfileAsync(string userId)
    {
        var user = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
            .Include(u => u.VerifiedSkills)
                .ThenInclude(vs => vs.Skill)
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null || user.Role != Role.Freelancer)
            return null;

        if (user.FreelancerProfile == null)
        {
            // Initialize empty profile if not exist
            var newProfile = new Domain.Entities.FreelancerProfile
            {
                UserId = user.Id
            };
            _context.Add(newProfile);
            await _context.SaveChangesAsync();
            user.FreelancerProfile = newProfile;
        }

        return new FreelancerProfileDto
        {
            Id = user.FreelancerProfile.Id,
            HourlyRate = user.FreelancerProfile.HourlyRate,
            YearsOfExperience = user.FreelancerProfile.YearsOfExperience,
            IsAvailable = user.FreelancerProfile.IsAvailable,
            Bio = user.FreelancerProfile.Bio,
            Skills = user.VerifiedSkills.Select(vs => vs.Skill.Name).ToList()
        };
    }

    public async Task<(bool Success, string[] Errors)> UpdateFreelancerProfileAsync(string userId, UpdateFreelancerProfileDto request)
    {
        var user = await _context.DomainUsers
            .Include(u => u.FreelancerProfile)
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

        user.FreelancerProfile.HourlyRate = request.HourlyRate;
        user.FreelancerProfile.YearsOfExperience = request.YearsOfExperience;
        user.FreelancerProfile.IsAvailable = request.IsAvailable;
        user.FreelancerProfile.Bio = request.Bio;

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }
}

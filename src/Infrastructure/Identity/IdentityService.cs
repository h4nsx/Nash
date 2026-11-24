using Application.Common.Interfaces;
using Application.Common.Models;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        AppDbContext context,
        IJwtService jwtService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<(bool Success, string[] Errors)> RegisterUserAsync(string email, string password, string firstName, string lastName, Role role)
    {
        var applicationUser = new ApplicationUser
        {
            UserName = email,
            Email = email
        };

        var result = await _userManager.CreateAsync(applicationUser, password);

        if (result.Succeeded)
        {
            // Create role if it doesn't exist
            var roleString = role.ToString();
            if (!await _roleManager.RoleExistsAsync(roleString))
            {
                await _roleManager.CreateAsync(new IdentityRole(roleString));
            }

            // Assign role
            await _userManager.AddToRoleAsync(applicationUser, roleString);

            // Create pure domain user
            var domainUser = new User
            {
                IdentityId = applicationUser.Id,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Role = role
            };

            _context.DomainUsers.Add(domainUser);
            await _context.SaveChangesAsync();

            return (true, Array.Empty<string>());
        }

        return (false, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<(bool Success, AuthResponse? AuthResponse, string[] Errors)> LoginAsync(string email, string password)
    {
        var applicationUser = await _userManager.FindByEmailAsync(email);

        if (applicationUser != null && await _userManager.CheckPasswordAsync(applicationUser, password))
        {
            var domainUser = _context.DomainUsers.FirstOrDefault(u => u.IdentityId == applicationUser.Id);
            if (domainUser == null)
            {
                return (false, null, new[] { "Không tìm thấy hồ sơ người dùng." });
            }

        var authResponse = new AuthResponse
        {
            Email = domainUser.Email,
            Role = domainUser.Role.ToString(),
            FirstName = domainUser.FirstName,
            LastName = domainUser.LastName,
            Token = _jwtService.GenerateToken(domainUser.Id.ToString(), domainUser.Email, domainUser.FirstName, domainUser.LastName, domainUser.Role)
        };

            return (true, authResponse, Array.Empty<string>());
        }

        return (false, null, new[] { "Email hoặc mật khẩu không chính xác." });
    }

    public async Task<(bool Success, string? ResetToken, string[] Errors)> ForgotPasswordAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            // Return success even if not found to avoid user enumeration
            return (true, null, Array.Empty<string>());
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        return (true, token, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false, new[] { "Không tìm thấy người dùng." });
        }

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (result.Succeeded)
        {
            return (true, Array.Empty<string>());
        }

        return (false, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<(bool Success, string[] Errors)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var domainUser = await _context.DomainUsers.FindAsync(userId);
        if (domainUser == null)
        {
            return (false, new[] { "Không tìm thấy hồ sơ người dùng." });
        }

        var appUser = await _userManager.FindByIdAsync(domainUser.IdentityId);
        if (appUser == null)
        {
            return (false, new[] { "Không tìm thấy tài khoản người dùng." });
        }

        var result = await _userManager.ChangePasswordAsync(appUser, currentPassword, newPassword);
        if (result.Succeeded)
        {
            return (true, Array.Empty<string>());
        }

        return (false, result.Errors.Select(e => e.Description).ToArray());
    }
}

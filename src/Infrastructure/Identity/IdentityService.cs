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
                return (false, null, new[] { "User domain record not found." });
            }

            var authResponse = new AuthResponse
            {
                Email = domainUser.Email,
                Role = domainUser.Role.ToString(),
                FirstName = domainUser.FirstName,
                LastName = domainUser.LastName,
                Token = _jwtService.GenerateToken(domainUser.IdentityId, domainUser.Email, domainUser.FirstName, domainUser.LastName, domainUser.Role)
            };

            return (true, authResponse, Array.Empty<string>());
        }

        return (false, null, new[] { "Invalid email or password." });
    }
}

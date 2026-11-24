using Application.Common.Models;
using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string[] Errors)> RegisterUserAsync(string email, string password, string firstName, string lastName, Role role);
    Task<(bool Success, AuthResponse? AuthResponse, string[] Errors)> LoginAsync(string email, string password);
    Task<(bool Success, string? ResetToken, string[] Errors)> ForgotPasswordAsync(string email);
    Task<(bool Success, string[] Errors)> ResetPasswordAsync(string email, string token, string newPassword);
    Task<(bool Success, string[] Errors)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}

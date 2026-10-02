using Application.Common.Models;
using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string[] Errors)> RegisterUserAsync(string email, string password, string firstName, string lastName, Role role);
    Task<(bool Success, AuthResponse? AuthResponse, string[] Errors)> LoginAsync(string email, string password);
}

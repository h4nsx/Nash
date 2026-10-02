using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(string userId, string email, string firstName, string lastName, Role role);
}

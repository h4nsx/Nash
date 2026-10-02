using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : Entity
{
    public string IdentityId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Role Role { get; set; }
}

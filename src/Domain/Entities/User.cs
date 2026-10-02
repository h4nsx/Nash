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
    
    // Navigation properties
    public ICollection<SkillTestAttempt> Attempts { get; set; } = new List<SkillTestAttempt>();
    public ICollection<VerifiedSkill> VerifiedSkills { get; set; } = new List<VerifiedSkill>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

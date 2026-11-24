using Domain.Enums;

namespace Domain.Entities;

public class VerifiedSkill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    public Guid SkillId { get; set; }
    
    public Guid SkillTestAttemptId { get; set; }
    
    public VerifiedSkillStatus Status { get; set; } = VerifiedSkillStatus.Verified;
    
    public DateTime VerifiedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? ExpiredAt { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
    public SkillTestAttempt Attempt { get; set; } = null!;
}

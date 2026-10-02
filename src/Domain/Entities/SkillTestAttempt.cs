using Domain.Enums;

namespace Domain.Entities;

public class SkillTestAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    public Guid SkillTestId { get; set; }
    
    public AttemptStatus Status { get; set; } = AttemptStatus.NotStarted;
    
    // Câu trả lời của người dùng dạng JSON
    public string UserAnswersJson { get; set; } = string.Empty;
    
    public int Score { get; set; }
    
    public DateTime? StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public SkillTest SkillTest { get; set; } = null!;
}

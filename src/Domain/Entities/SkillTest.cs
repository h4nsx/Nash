using Domain.Enums;

namespace Domain.Entities;

public class SkillTest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SkillId { get; set; }
    
    // Test Title / Version Name
    public string Title { get; set; } = string.Empty;
    
    // Test Version
    public string Version { get; set; } = string.Empty;
    
    // Minimum passing score
    public int PassingScore { get; set; }
    
    // Time limit in minutes
    public int TimeLimitMinutes { get; set; }
    
    // List of questions/tasks in JSON format
    public string TasksJson { get; set; } = string.Empty;
    
    public TestStatus Status { get; set; } = TestStatus.Draft;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Skill Skill { get; set; } = null!;
    public ICollection<SkillTestAttempt> Attempts { get; set; } = new List<SkillTestAttempt>();
}

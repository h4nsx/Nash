namespace Domain.Entities;

public class Skill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Skill name (e.g. C#, React)
    public string Name { get; set; } = string.Empty;
    
    // Short description
    public string Description { get; set; } = string.Empty;
    
    // Whether the skill is visible on the platform
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<SkillTest> Tests { get; set; } = new List<SkillTest>();
}

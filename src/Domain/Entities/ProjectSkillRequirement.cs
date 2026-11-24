namespace Domain.Entities;

public class ProjectSkillRequirement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    
    public Guid SkillId { get; set; }
    
    public bool IsMandatory { get; set; } = true;
    
    public int? MinimumExperienceYears { get; set; }
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public Skill Skill { get; set; } = null!;
}

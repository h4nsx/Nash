using Domain.Enums;

namespace Domain.Entities;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ClientId { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User Client { get; set; } = null!;
    public ICollection<ProjectSkillRequirement> SkillRequirements { get; set; } = new List<ProjectSkillRequirement>();
    
    // Phase 5: Handshake Navigation
    public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}

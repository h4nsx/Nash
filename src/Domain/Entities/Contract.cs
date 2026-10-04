using Domain.Enums;

namespace Domain.Entities;

public class Contract
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    public Guid FreelancerId { get; set; }
    public Guid AcceptedDraftId { get; set; }
    
    public decimal AgreedBudget { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public User Freelancer { get; set; } = null!;
    public ContractDraft AcceptedDraft { get; set; } = null!;
    
    // Phase 6: Work
    public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

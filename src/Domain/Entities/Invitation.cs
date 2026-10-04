using Domain.Enums;

namespace Domain.Entities;

public class Invitation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    public Guid FreelancerId { get; set; }
    public Guid SenderId { get; set; }
    
    public InvitationStatus Status { get; set; } = InvitationStatus.Draft;
    public DateTime ExpiresAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public User Freelancer { get; set; } = null!;
    public User Sender { get; set; } = null!;
    public ICollection<ContractDraft> ContractDrafts { get; set; } = new List<ContractDraft>();
}

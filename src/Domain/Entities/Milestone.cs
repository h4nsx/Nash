using Domain.Enums;

namespace Domain.Entities;

public class Milestone
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ContractId { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    
    public MilestoneStatus Status { get; set; } = MilestoneStatus.Pending;
    
    public string SubmissionNotes { get; set; } = string.Empty;
    public string FeedbackNotes { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public Contract Contract { get; set; } = null!;
}

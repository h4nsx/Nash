using Domain.Enums;

namespace Domain.Entities;

public class ContractDraft
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid InvitationId { get; set; }
    public int VersionNumber { get; set; }
    
    public decimal ProposedBudget { get; set; }
    public DateTime ProposedStartDate { get; set; }
    public DateTime ProposedEndDate { get; set; }
    
    public string ContractContentHtml { get; set; } = string.Empty;
    public string ContractContentJson { get; set; } = string.Empty;
    
    public Guid CreatedById { get; set; }
    public ContractDraftStatus Status { get; set; } = ContractDraftStatus.Draft;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Invitation Invitation { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
}

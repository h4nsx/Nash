using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IHandshakeService
{
    Task<(bool Success, Guid InvitationId, string[] Errors)> SendInvitationAsync(SendInvitationDto request, string senderId);
    Task<(bool Success, string[] Errors)> CounterOfferAsync(Guid invitationId, CounterOfferDto request, string userId);
    Task<(bool Success, string[] Errors)> AcceptInvitationAsync(Guid invitationId, string userId);
    Task<(bool Success, string[] Errors)> DeclineInvitationAsync(Guid invitationId, string userId);
    
    // Queries
    Task<List<InvitationDto>> GetMyInvitationsAsync(string userId, string? role = null);
    Task<InvitationDto?> GetInvitationByIdAsync(Guid invitationId, string userId);
}

public class InvitationDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public Guid FreelancerId { get; set; }
    public string FreelancerName { get; set; } = string.Empty;
    public Guid SenderId { get; set; }
    public InvitationStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ContractDraftDto> ContractDrafts { get; set; } = new();
}

public class ContractDraftDto
{
    public Guid Id { get; set; }
    public int VersionNumber { get; set; }
    public decimal ProposedBudget { get; set; }
    public DateTime ProposedStartDate { get; set; }
    public DateTime ProposedEndDate { get; set; }
    public string ContractContentHtml { get; set; } = string.Empty;
    public Guid CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public ContractDraftStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SendInvitationDto
{
    public Guid ProjectId { get; set; }
    public Guid FreelancerId { get; set; }
    public decimal ProposedBudget { get; set; }
    public DateTime ProposedStartDate { get; set; }
    public DateTime ProposedEndDate { get; set; }
    public string ContractContentHtml { get; set; } = string.Empty;
    public string ContractContentJson { get; set; } = string.Empty;
}

public class CounterOfferDto
{
    public decimal ProposedBudget { get; set; }
    public DateTime ProposedStartDate { get; set; }
    public DateTime ProposedEndDate { get; set; }
    public string ContractContentHtml { get; set; } = string.Empty;
    public string ContractContentJson { get; set; } = string.Empty;
}

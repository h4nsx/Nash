using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IHandshakeService
{
    Task<(bool Success, Guid InvitationId, string[] Errors)> SendInvitationAsync(SendInvitationDto request, string senderId);
    Task<(bool Success, string[] Errors)> CounterOfferAsync(Guid invitationId, CounterOfferDto request, string userId);
    Task<(bool Success, string[] Errors)> AcceptInvitationAsync(Guid invitationId, string userId);
    Task<(bool Success, string[] Errors)> DeclineInvitationAsync(Guid invitationId, string userId);
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

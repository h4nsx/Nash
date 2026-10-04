using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class HandshakeService : IHandshakeService
{
    private readonly AppDbContext _context;

    public HandshakeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, Guid InvitationId, string[] Errors)> SendInvitationAsync(SendInvitationDto request, string senderId)
    {
        var project = await _context.Projects.FindAsync(request.ProjectId);
        if (project == null || project.ClientId != Guid.Parse(senderId))
        {
            return (false, Guid.Empty, new[] { "Không tìm thấy dự án hoặc bạn không có quyền gửi lời mời." });
        }

        var freelancer = await _context.DomainUsers.FindAsync(request.FreelancerId);
        if (freelancer == null || freelancer.Role != Role.Freelancer)
        {
            return (false, Guid.Empty, new[] { "Freelancer không tồn tại." });
        }

        // Check if there's already an active contract
        var hasActiveContract = await _context.Contracts.AnyAsync(c => c.ProjectId == request.ProjectId && c.Status == ContractStatus.Active);
        if (hasActiveContract)
        {
            return (false, Guid.Empty, new[] { "Dự án này đã có hợp đồng đang hoạt động." });
        }

        var invitation = new Invitation
        {
            ProjectId = request.ProjectId,
            FreelancerId = request.FreelancerId,
            SenderId = Guid.Parse(senderId),
            Status = InvitationStatus.Sent,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var draft = new ContractDraft
        {
            VersionNumber = 1,
            ProposedBudget = request.ProposedBudget,
            ProposedStartDate = request.ProposedStartDate,
            ProposedEndDate = request.ProposedEndDate,
            ContractContentHtml = request.ContractContentHtml,
            ContractContentJson = request.ContractContentJson,
            CreatedById = Guid.Parse(senderId),
            Status = ContractDraftStatus.Sent,
            CreatedAt = DateTime.UtcNow
        };

        invitation.ContractDrafts.Add(draft);
        _context.Invitations.Add(invitation);
        
        await _context.SaveChangesAsync();

        return (true, invitation.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> CounterOfferAsync(Guid invitationId, CounterOfferDto request, string userId)
    {
        var invitation = await _context.Invitations
            .Include(i => i.ContractDrafts)
            .FirstOrDefaultAsync(i => i.Id == invitationId);

        if (invitation == null) return (false, new[] { "Không tìm thấy lời mời." });
        if (invitation.Status == InvitationStatus.Accepted || invitation.Status == InvitationStatus.Declined || invitation.Status == InvitationStatus.Expired)
        {
            return (false, new[] { "Không thể thương lượng lời mời đã đóng." });
        }

        var userGuid = Guid.Parse(userId);
        if (invitation.FreelancerId != userGuid && invitation.SenderId != userGuid)
        {
            return (false, new[] { "Bạn không có quyền thương lượng lời mời này." });
        }

        var latestDraft = invitation.ContractDrafts.OrderByDescending(d => d.VersionNumber).First();
        latestDraft.Status = ContractDraftStatus.Countered;

        var newDraft = new ContractDraft
        {
            VersionNumber = latestDraft.VersionNumber + 1,
            ProposedBudget = request.ProposedBudget,
            ProposedStartDate = request.ProposedStartDate,
            ProposedEndDate = request.ProposedEndDate,
            ContractContentHtml = request.ContractContentHtml,
            ContractContentJson = request.ContractContentJson,
            CreatedById = userGuid,
            Status = ContractDraftStatus.Sent,
            CreatedAt = DateTime.UtcNow
        };

        invitation.ContractDrafts.Add(newDraft);
        invitation.Status = InvitationStatus.Countered;
        invitation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> AcceptInvitationAsync(Guid invitationId, string userId)
    {
        var invitation = await _context.Invitations
            .Include(i => i.ContractDrafts)
            .FirstOrDefaultAsync(i => i.Id == invitationId);

        if (invitation == null) return (false, new[] { "Không tìm thấy lời mời." });

        var userGuid = Guid.Parse(userId);
        if (invitation.FreelancerId != userGuid && invitation.SenderId != userGuid)
        {
            return (false, new[] { "Bạn không có quyền thao tác trên lời mời này." });
        }

        // Concurrency Check
        var hasActiveContract = await _context.Contracts.AnyAsync(c => c.ProjectId == invitation.ProjectId && c.Status == ContractStatus.Active);
        if (hasActiveContract)
        {
            return (false, new[] { "Dự án này đã có hợp đồng đang hoạt động. Bạn không thể chấp nhận lời mời." });
        }

        var latestDraft = invitation.ContractDrafts.OrderByDescending(d => d.VersionNumber).First();
        if (latestDraft.CreatedById == userGuid)
        {
            return (false, new[] { "Bạn không thể tự chấp nhận đề nghị của chính mình." });
        }

        latestDraft.Status = ContractDraftStatus.Accepted;
        invitation.Status = InvitationStatus.Accepted;
        invitation.UpdatedAt = DateTime.UtcNow;

        var contract = new Contract
        {
            ProjectId = invitation.ProjectId,
            FreelancerId = invitation.FreelancerId,
            AcceptedDraftId = latestDraft.Id,
            AgreedBudget = latestDraft.ProposedBudget,
            StartDate = latestDraft.ProposedStartDate,
            EndDate = latestDraft.ProposedEndDate,
            Status = ContractStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Contracts.Add(contract);

        // Cancel other pending invitations for this project
        var pendingInvitations = await _context.Invitations
            .Where(i => i.ProjectId == invitation.ProjectId && i.Id != invitationId && i.Status != InvitationStatus.Accepted && i.Status != InvitationStatus.Declined)
            .ToListAsync();

        foreach (var pi in pendingInvitations)
        {
            pi.Status = InvitationStatus.Expired; // Or a specific status for cancelled
            pi.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> DeclineInvitationAsync(Guid invitationId, string userId)
    {
        var invitation = await _context.Invitations.FindAsync(invitationId);
        if (invitation == null) return (false, new[] { "Không tìm thấy lời mời." });

        var userGuid = Guid.Parse(userId);
        if (invitation.FreelancerId != userGuid && invitation.SenderId != userGuid)
        {
            return (false, new[] { "Bạn không có quyền thao tác trên lời mời này." });
        }

        invitation.Status = InvitationStatus.Declined;
        invitation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }
}

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

        if (invitation.IsExpired(DateTime.UtcNow))
        {
            invitation.Status = InvitationStatus.Expired;
            invitation.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return (false, new[] { "Lời mời này đã hết hạn phản hồi." });
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
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var invitation = await _context.Invitations
                .Include(i => i.ContractDrafts)
                .Include(i => i.Project)
                .FirstOrDefaultAsync(i => i.Id == invitationId);

            if (invitation == null) return (false, new[] { "Không tìm thấy lời mời." });
            if (invitation.Status == InvitationStatus.Accepted || invitation.Status == InvitationStatus.Declined || invitation.Status == InvitationStatus.Expired)
            {
                return (false, new[] { "Lời mời này đã hoàn thành hoặc đã hết hạn." });
            }

            if (invitation.IsExpired(DateTime.UtcNow))
            {
                invitation.Status = InvitationStatus.Expired;
                invitation.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return (false, new[] { "Lời mời này đã hết hạn phản hồi." });
            }

            var userGuid = Guid.Parse(userId);
            if (invitation.FreelancerId != userGuid && invitation.SenderId != userGuid)
            {
                return (false, new[] { "Bạn không có quyền thao tác trên lời mời này." });
            }

            // Concurrency Check: strict check for active contracts
            var hasActiveContract = await _context.Contracts.AnyAsync(c => c.ProjectId == invitation.ProjectId && c.Status == ContractStatus.Active);
            if (hasActiveContract)
            {
                return (false, new[] { "Dự án này đã có hợp đồng đang hoạt động. Không thể kích hoạt thêm hợp đồng." });
            }

            var latestDraft = invitation.ContractDrafts.OrderByDescending(d => d.VersionNumber).First();
            if (latestDraft.CreatedById == userGuid)
            {
                return (false, new[] { "Bạn không thể tự chấp nhận đề nghị của chính mình. Đang chờ đối tác xác nhận." });
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

            // Auto-seed initial Milestone 1 so the contract is immediately executable
            var initialMilestone = new Milestone
            {
                ContractId = contract.Id,
                Title = "Giai đoạn 1: Triển khai & Nghiệm thu toàn bộ phạm vi dự án",
                Description = $"Bàn giao sản phẩm theo đúng điều khoản cam kết trong hợp đồng dự án '{invitation.Project?.Title ?? "NASH"}'.",
                Amount = latestDraft.ProposedBudget,
                DueDate = latestDraft.ProposedEndDate,
                Status = MilestoneStatus.InProgress,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            contract.Milestones.Add(initialMilestone);
            _context.Contracts.Add(contract);

            // Update project status to InProgress
            if (invitation.Project != null)
            {
                invitation.Project.Status = ProjectStatus.InProgress;
                invitation.Project.UpdatedAt = DateTime.UtcNow;
            }

            // Cancel/Expire all other pending invitations for this project
            var otherInvitations = await _context.Invitations
                .Where(i => i.ProjectId == invitation.ProjectId && i.Id != invitationId && i.Status != InvitationStatus.Accepted && i.Status != InvitationStatus.Declined)
                .ToListAsync();

            foreach (var oi in otherInvitations)
            {
                oi.Status = InvitationStatus.Expired;
                oi.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return (true, Array.Empty<string>());
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, new[] { $"Lỗi khi chấp nhận hợp đồng: {ex.Message}" });
        }
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

    public async Task<List<InvitationDto>> GetMyInvitationsAsync(string userId, string? role = null)
    {
        var query = _context.Invitations
            .Include(i => i.Project).ThenInclude(p => p.Client)
            .Include(i => i.Freelancer)
            .Include(i => i.Sender)
            .Include(i => i.ContractDrafts).ThenInclude(d => d.CreatedBy)
            .AsQueryable();

        var parsedUserId = Guid.Parse(userId);

        if (role == "Client")
        {
            query = query.Where(i => i.Project.ClientId == parsedUserId);
        }
        else if (role == "Freelancer")
        {
            query = query.Where(i => i.FreelancerId == parsedUserId);
        }
        else
        {
            query = query.Where(i => i.Project.ClientId == parsedUserId || i.FreelancerId == parsedUserId);
        }

        var invitations = await query
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return invitations.Select(MapToDto).ToList();
    }

    public async Task<InvitationDto?> GetInvitationByIdAsync(Guid invitationId, string userId)
    {
        var parsedUserId = Guid.Parse(userId);

        var invitation = await _context.Invitations
            .Include(i => i.Project).ThenInclude(p => p.Client)
            .Include(i => i.Freelancer)
            .Include(i => i.Sender)
            .Include(i => i.ContractDrafts).ThenInclude(d => d.CreatedBy)
            .FirstOrDefaultAsync(i => i.Id == invitationId);

        if (invitation == null)
            return null;

        if (invitation.Project.ClientId != parsedUserId && invitation.FreelancerId != parsedUserId)
            return null;

        return MapToDto(invitation);
    }

    private static InvitationDto MapToDto(Invitation invitation)
    {
        var clientName = invitation.Project?.Client != null
            ? $"{invitation.Project.Client.FirstName} {invitation.Project.Client.LastName}".Trim()
            : (invitation.Project?.ClientId == invitation.SenderId
                ? $"{invitation.Sender.FirstName} {invitation.Sender.LastName}".Trim()
                : "Client");

        return new InvitationDto
        {
            Id = invitation.Id,
            ProjectId = invitation.ProjectId,
            ProjectTitle = invitation.Project!.Title,
            ProjectDescription = invitation.Project.Description,
            ClientId = invitation.Project.ClientId,
            ClientName = clientName,
            FreelancerId = invitation.FreelancerId,
            FreelancerName = $"{invitation.Freelancer.FirstName} {invitation.Freelancer.LastName}",
            SenderId = invitation.SenderId,
            Status = invitation.Status,
            ExpiresAt = invitation.ExpiresAt,
            CreatedAt = invitation.CreatedAt,
            UpdatedAt = invitation.UpdatedAt,
            ContractDrafts = invitation.ContractDrafts.Select(d => new ContractDraftDto
            {
                Id = d.Id,
                VersionNumber = d.VersionNumber,
                ProposedBudget = d.ProposedBudget,
                ProposedStartDate = d.ProposedStartDate,
                ProposedEndDate = d.ProposedEndDate,
                ContractContentHtml = d.ContractContentHtml,
                CreatedById = d.CreatedById,
                CreatedByName = $"{d.CreatedBy.FirstName} {d.CreatedBy.LastName}",
                Status = d.Status,
                CreatedAt = d.CreatedAt
            }).OrderByDescending(d => d.VersionNumber).ToList()
        };
    }
}

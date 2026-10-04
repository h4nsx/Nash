using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class WorkService : IWorkService
{
    private readonly AppDbContext _context;

    public WorkService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, Guid MilestoneId, string[] Errors)> CreateMilestoneAsync(Guid contractId, CreateMilestoneDto request, string clientId)
    {
        var contract = await _context.Contracts
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == contractId && c.Project.ClientId == Guid.Parse(clientId));

        if (contract == null) return (false, Guid.Empty, new[] { "Không tìm thấy hợp đồng hoặc bạn không có quyền thao tác." });
        if (contract.Status != ContractStatus.Active) return (false, Guid.Empty, new[] { "Chỉ có thể tạo mốc thanh toán cho hợp đồng đang hoạt động." });

        var milestone = new Milestone
        {
            ContractId = contractId,
            Title = request.Title,
            Description = request.Description,
            Amount = request.Amount,
            DueDate = request.DueDate,
            Status = MilestoneStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Milestones.Add(milestone);
        await _context.SaveChangesAsync();
        
        return (true, milestone.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> SubmitMilestoneAsync(Guid milestoneId, string notes, string freelancerId)
    {
        var milestone = await _context.Milestones
            .Include(m => m.Contract)
            .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(m => m.Id == milestoneId && m.Contract.FreelancerId == Guid.Parse(freelancerId));

        if (milestone == null) return (false, new[] { "Không tìm thấy mốc thanh toán hoặc bạn không có quyền nộp." });
        
        if (milestone.Status != MilestoneStatus.Pending && milestone.Status != MilestoneStatus.InProgress && milestone.Status != MilestoneStatus.ChangesRequested)
        {
            return (false, new[] { "Không thể nộp mốc thanh toán ở trạng thái hiện tại." });
        }

        milestone.Status = MilestoneStatus.Submitted;
        milestone.SubmissionNotes = notes;
        milestone.UpdatedAt = DateTime.UtcNow;

        var notification = new Notification
        {
            UserId = milestone.Contract.Project.ClientId,
            Title = "Mốc thanh toán đã được nộp",
            Message = $"Freelancer đã nộp mốc thanh toán '{milestone.Title}'.",
            Type = NotificationType.MilestoneUpdate,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> RequestMilestoneChangesAsync(Guid milestoneId, string feedback, string clientId)
    {
        var milestone = await _context.Milestones
            .Include(m => m.Contract)
            .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(m => m.Id == milestoneId && m.Contract.Project.ClientId == Guid.Parse(clientId));

        if (milestone == null) return (false, new[] { "Không tìm thấy mốc thanh toán hoặc bạn không có quyền." });
        
        if (milestone.Status != MilestoneStatus.Submitted)
            return (false, new[] { "Chỉ có thể yêu cầu chỉnh sửa khi mốc thanh toán đã được nộp." });

        milestone.Status = MilestoneStatus.ChangesRequested;
        milestone.FeedbackNotes = feedback;
        milestone.UpdatedAt = DateTime.UtcNow;

        var notification = new Notification
        {
            UserId = milestone.Contract.FreelancerId,
            Title = "Yêu cầu chỉnh sửa mốc thanh toán",
            Message = $"Khách hàng yêu cầu chỉnh sửa cho mốc thanh toán '{milestone.Title}'.",
            Type = NotificationType.MilestoneUpdate,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> AcceptMilestoneAsync(Guid milestoneId, string clientId)
    {
        var milestone = await _context.Milestones
            .Include(m => m.Contract)
            .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(m => m.Id == milestoneId && m.Contract.Project.ClientId == Guid.Parse(clientId));

        if (milestone == null) return (false, new[] { "Không tìm thấy mốc thanh toán hoặc bạn không có quyền." });
        
        if (milestone.Status != MilestoneStatus.Submitted)
            return (false, new[] { "Chỉ có thể chấp nhận khi mốc thanh toán đã được nộp." });

        milestone.Status = MilestoneStatus.Accepted;
        milestone.UpdatedAt = DateTime.UtcNow;

        var notification = new Notification
        {
            UserId = milestone.Contract.FreelancerId,
            Title = "Mốc thanh toán được chấp nhận",
            Message = $"Khách hàng đã chấp nhận mốc thanh toán '{milestone.Title}'.",
            Type = NotificationType.MilestoneUpdate,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> CompleteContractAsync(Guid contractId, string clientId)
    {
        var contract = await _context.Contracts
            .Include(c => c.Project)
            .Include(c => c.Milestones)
            .FirstOrDefaultAsync(c => c.Id == contractId && c.Project.ClientId == Guid.Parse(clientId));

        if (contract == null) return (false, new[] { "Không tìm thấy hợp đồng." });

        if (contract.Status != ContractStatus.Active)
            return (false, new[] { "Hợp đồng không ở trạng thái hoạt động." });

        if (contract.Milestones.Any() && contract.Milestones.Any(m => m.Status != MilestoneStatus.Accepted))
        {
            return (false, new[] { "Tất cả các mốc thanh toán phải được chấp nhận trước khi hoàn thành hợp đồng." });
        }

        contract.Status = ContractStatus.Completed;
        contract.UpdatedAt = DateTime.UtcNow;
        
        // Mark project as completed too
        contract.Project.Status = ProjectStatus.Completed;
        contract.Project.UpdatedAt = DateTime.UtcNow;

        var notification = new Notification
        {
            UserId = contract.FreelancerId,
            Title = "Hợp đồng hoàn thành",
            Message = $"Hợp đồng cho dự án '{contract.Project.Title}' đã được hoàn thành thành công.",
            Type = NotificationType.ContractUpdate,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> SubmitReviewAsync(Guid contractId, ReviewDto request, string reviewerId)
    {
        var contract = await _context.Contracts
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == contractId);

        if (contract == null) return (false, new[] { "Không tìm thấy hợp đồng." });

        if (contract.Status != ContractStatus.Completed)
            return (false, new[] { "Chỉ có thể đánh giá khi hợp đồng đã hoàn thành." });

        var rId = Guid.Parse(reviewerId);
        bool isClient = contract.Project.ClientId == rId;
        bool isFreelancer = contract.FreelancerId == rId;

        if (!isClient && !isFreelancer)
            return (false, new[] { "Bạn không tham gia vào hợp đồng này." });

        var revieweeId = isClient ? contract.FreelancerId : contract.Project.ClientId;

        var existingReview = await _context.Reviews.AnyAsync(r => r.ContractId == contractId && r.ReviewerId == rId);
        if (existingReview)
            return (false, new[] { "Bạn đã đánh giá hợp đồng này rồi." });

        var review = new Review
        {
            ContractId = contractId,
            ReviewerId = rId,
            RevieweeId = revieweeId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);

        var notification = new Notification
        {
            UserId = revieweeId,
            Title = "Bạn có đánh giá mới",
            Message = $"Bạn vừa nhận được một đánh giá {request.Rating} sao cho hợp đồng.",
            Type = NotificationType.ReviewReceived,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == Guid.Parse(userId))
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<(bool Success, string[] Errors)> MarkNotificationAsReadAsync(Guid notificationId, string userId)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == Guid.Parse(userId));
        if (notification == null) return (false, new[] { "Không tìm thấy thông báo." });

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }
}

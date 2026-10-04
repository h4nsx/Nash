using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IWorkService
{
    // Milestones
    Task<(bool Success, Guid MilestoneId, string[] Errors)> CreateMilestoneAsync(Guid contractId, CreateMilestoneDto request, string clientId);
    Task<(bool Success, string[] Errors)> SubmitMilestoneAsync(Guid milestoneId, string notes, string freelancerId);
    Task<(bool Success, string[] Errors)> RequestMilestoneChangesAsync(Guid milestoneId, string feedback, string clientId);
    Task<(bool Success, string[] Errors)> AcceptMilestoneAsync(Guid milestoneId, string clientId);
    
    // Contract
    Task<(bool Success, string[] Errors)> CompleteContractAsync(Guid contractId, string clientId);
    
    // Reviews
    Task<(bool Success, string[] Errors)> SubmitReviewAsync(Guid contractId, ReviewDto request, string reviewerId);
    
    // Notifications
    Task<List<NotificationDto>> GetUserNotificationsAsync(string userId);
    Task<(bool Success, string[] Errors)> MarkNotificationAsReadAsync(Guid notificationId, string userId);
}

public class CreateMilestoneDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
}

public class ReviewDto
{
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

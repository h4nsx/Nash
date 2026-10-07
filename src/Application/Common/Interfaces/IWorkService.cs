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
    
    // Contracts query
    Task<List<ContractDto>> GetUserContractsAsync(string userId, string? role = null);
    Task<ContractDto?> GetContractByIdAsync(Guid contractId, string userId);
    Task<List<MilestoneDto>> GetContractMilestonesAsync(Guid contractId, string userId);
    
    // Notifications
    Task<List<NotificationDto>> GetUserNotificationsAsync(string userId);
    Task<(bool Success, string[] Errors)> MarkNotificationAsReadAsync(Guid notificationId, string userId);
}

public class ContractDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public Guid FreelancerId { get; set; }
    public string FreelancerName { get; set; } = string.Empty;
    public decimal AgreedBudget { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public ContractStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MilestoneDto> Milestones { get; set; } = new();
    public List<ReviewItemDto> Reviews { get; set; } = new();
}

public class MilestoneDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public MilestoneStatus Status { get; set; }
    public string SubmissionNotes { get; set; } = string.Empty;
    public string FeedbackNotes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ReviewItemDto
{
    public Guid Id { get; set; }
    public Guid ReviewerId { get; set; }
    public Guid RevieweeId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
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

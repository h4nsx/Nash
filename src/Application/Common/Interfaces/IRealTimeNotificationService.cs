namespace Application.Common.Interfaces;

public interface IRealTimeNotificationService
{
    Task SendNotificationToUserAsync(string userId, string title, string message);
}

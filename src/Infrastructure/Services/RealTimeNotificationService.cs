using Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Infrastructure.Hubs;

namespace Infrastructure.Services;

public class RealTimeNotificationService : IRealTimeNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public RealTimeNotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationToUserAsync(string userId, string title, string message)
    {
        await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new
        {
            Title = title,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }
}

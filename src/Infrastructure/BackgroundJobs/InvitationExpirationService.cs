using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundJobs;

public class InvitationExpirationService : BackgroundService
{
    private readonly ILogger<InvitationExpirationService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

    public InvitationExpirationService(
        ILogger<InvitationExpirationService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("InvitationExpirationService is starting.");

        using var timer = new PeriodicTimer(_checkInterval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await ProcessExpiredInvitationsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing expired invitations.");
            }
        }
    }

    private async Task ProcessExpiredInvitationsAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Checking for expired invitations...");

        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        var expiredInvitations = await context.Invitations
            .Where(i => i.ExpiresAt < now && 
                        (i.Status == InvitationStatus.Draft || 
                         i.Status == InvitationStatus.Sent || 
                         i.Status == InvitationStatus.Countered))
            .ToListAsync(stoppingToken);

        if (expiredInvitations.Any())
        {
            foreach (var invitation in expiredInvitations)
            {
                invitation.Status = InvitationStatus.Expired;
                invitation.UpdatedAt = now;
                
                // We could also trigger a Notification here via IRealTimeNotificationService if desired
            }

            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Expired {Count} invitations.", expiredInvitations.Count);
        }
        else
        {
            _logger.LogInformation("No expired invitations found.");
        }
    }
}

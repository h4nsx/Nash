using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Xunit;

namespace UnitTests.Domain;

public class InvitationTests
{
    [Fact]
    public void IsExpired_WhenExpiresAtIsInFutureAndStatusIsSent_ShouldReturnFalse()
    {
        var now = new DateTime(2026, 11, 25, 10, 0, 0, DateTimeKind.Utc);
        var invitation = new Invitation
        {
            Status = InvitationStatus.Sent,
            ExpiresAt = now.AddDays(3)
        };

        invitation.IsExpired(now).Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WhenExpiresAtIsInPast_ShouldReturnTrue()
    {
        var now = new DateTime(2026, 11, 25, 10, 0, 0, DateTimeKind.Utc);
        var invitation = new Invitation
        {
            Status = InvitationStatus.Sent,
            ExpiresAt = now.AddMinutes(-1)
        };

        invitation.IsExpired(now).Should().BeTrue();
    }

    [Fact]
    public void IsExpired_WhenStatusIsExpiredEvenIfDateIsFuture_ShouldReturnTrue()
    {
        var now = new DateTime(2026, 11, 25, 10, 0, 0, DateTimeKind.Utc);
        var invitation = new Invitation
        {
            Status = InvitationStatus.Expired,
            ExpiresAt = now.AddDays(5)
        };

        invitation.IsExpired(now).Should().BeTrue();
    }
}

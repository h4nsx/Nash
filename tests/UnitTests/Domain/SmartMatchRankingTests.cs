using Domain.Services;
using FluentAssertions;
using Xunit;

namespace UnitTests.Domain;

public class SmartMatchRankingTests
{
    private sealed class FakeCandidate : IMatchRankingCandidate
    {
        public Guid FreelancerId { get; init; }
        public decimal Score { get; init; }
        public int MandatoryCoveredCount { get; init; }
        public int VerifiedCoveredCount { get; init; }
        public bool IsAvailable { get; init; }
    }

    [Fact]
    public void RankTop_WhenScoresTie_ShouldBreakTiesDeterministically()
    {
        var idLow = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var idHigh = Guid.Parse("00000000-0000-0000-0000-000000000002");

        var c1 = new FakeCandidate { FreelancerId = idHigh, Score = 90m, MandatoryCoveredCount = 2, VerifiedCoveredCount = 2, IsAvailable = true };
        var c2 = new FakeCandidate { FreelancerId = idLow, Score = 90m, MandatoryCoveredCount = 2, VerifiedCoveredCount = 3, IsAvailable = true };
        var c3 = new FakeCandidate { FreelancerId = Guid.NewGuid(), Score = 90m, MandatoryCoveredCount = 3, VerifiedCoveredCount = 3, IsAvailable = true };
        var c4 = new FakeCandidate { FreelancerId = Guid.NewGuid(), Score = 85m, MandatoryCoveredCount = 3, VerifiedCoveredCount = 3, IsAvailable = true };

        var ranked = MatchRanker.RankTop(new[] { c4, c1, c2, c3 }, 3);

        ranked.Should().HaveCount(3);
        ranked[0].Should().BeSameAs(c3); // Highest mandatory coverage at score 90
        ranked[1].Should().BeSameAs(c2); // Next highest verified coverage at score 90
        ranked[2].Should().BeSameAs(c1); // Remaining score 90 ahead of score 85
    }

    [Fact]
    public void RankTop_WhenAllMetricsTie_ShouldOrderByFreelancerIdAscending()
    {
        var idA = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var idB = Guid.Parse("22222222-2222-2222-2222-222222222222");

        var candB = new FakeCandidate { FreelancerId = idB, Score = 80m, MandatoryCoveredCount = 1, VerifiedCoveredCount = 1, IsAvailable = true };
        var candA = new FakeCandidate { FreelancerId = idA, Score = 80m, MandatoryCoveredCount = 1, VerifiedCoveredCount = 1, IsAvailable = true };

        var ranked = MatchRanker.RankTop(new[] { candB, candA }, 3);

        ranked.Select(r => r.FreelancerId).Should().ContainInOrder(idA, idB);
    }
}

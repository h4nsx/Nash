namespace Domain.Services;

public interface IMatchRankingCandidate
{
    Guid FreelancerId { get; }
    decimal Score { get; }
    int MandatoryCoveredCount { get; }
    int VerifiedCoveredCount { get; }
    bool IsAvailable { get; }
}

public static class MatchRanker
{
    public static List<T> RankTop<T>(IEnumerable<T> candidates, int count = 3)
        where T : IMatchRankingCandidate
    {
        return candidates
            .OrderByDescending(c => c.Score)
            .ThenByDescending(c => c.MandatoryCoveredCount)
            .ThenByDescending(c => c.VerifiedCoveredCount)
            .ThenByDescending(c => c.IsAvailable)
            .ThenBy(c => c.FreelancerId)
            .Take(count)
            .ToList();
    }
}

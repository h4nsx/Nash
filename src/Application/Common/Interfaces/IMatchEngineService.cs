using Domain.Enums;

namespace Application.Common.Interfaces;

public interface IMatchEngineService
{
    Task<(bool Success, List<MatchDto> Matches, string[] Errors)> GenerateMatchesAsync(Guid projectId, string clientId);
    Task<List<MatchDto>> GetMatchesForProjectAsync(Guid projectId, string clientId);
    Task<(bool Success, string[] Errors)> UpdateMatchStatusAsync(Guid matchId, MatchStatus status, string clientId);
}

public class MatchDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid FreelancerId { get; set; }
    public string FreelancerName { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public string MatchVersion { get; set; } = string.Empty;
    public List<string> Reasons { get; set; } = new();
    public MatchStatus Status { get; set; }
}

using Domain.Enums;

namespace Domain.Entities;

public class Match
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ProjectId { get; set; }
    
    public Guid FreelancerId { get; set; }
    
    public decimal Score { get; set; }
    
    public string MatchVersion { get; set; } = string.Empty;
    
    public string ReasonsJson { get; set; } = string.Empty;
    
    public MatchStatus Status { get; set; } = MatchStatus.Generated;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Project Project { get; set; } = null!;
    public User Freelancer { get; set; } = null!;
}

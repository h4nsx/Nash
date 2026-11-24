namespace Domain.Entities;

public class PortfolioItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid FreelancerProfileId { get; set; }
    
    public string Title { get; set; } = string.Empty;
    
    public string Role { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public string? LiveUrl { get; set; }
    
    public string? RepoUrl { get; set; }
    
    public string TechStackJson { get; set; } = "[]";
    
    public string ImageUrlsJson { get; set; } = "[]";
    
    public DateTime? CompletedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public FreelancerProfile FreelancerProfile { get; set; } = null!;
}


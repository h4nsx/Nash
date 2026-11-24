namespace Domain.Entities;

public class Certification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid FreelancerProfileId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string Issuer { get; set; } = string.Empty;
    
    public DateTime? IssueDate { get; set; }
    
    public string? CredentialId { get; set; }
    
    public string? CredentialUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public FreelancerProfile FreelancerProfile { get; set; } = null!;
}


namespace Domain.Entities;

public class WorkExperience
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid FreelancerProfileId { get; set; }
    
    public string CompanyName { get; set; } = string.Empty;
    
    public string Position { get; set; } = string.Empty;
    
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool IsCurrentRole { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public FreelancerProfile FreelancerProfile { get; set; } = null!;
}


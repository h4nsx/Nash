namespace Domain.Entities;

public class Education
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid FreelancerProfileId { get; set; }
    
    public string School { get; set; } = string.Empty;
    
    public string Degree { get; set; } = string.Empty;
    
    public string FieldOfStudy { get; set; } = string.Empty;
    
    public int StartYear { get; set; }
    
    public int? EndYear { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public FreelancerProfile FreelancerProfile { get; set; } = null!;
}


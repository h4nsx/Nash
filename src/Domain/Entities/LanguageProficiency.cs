namespace Domain.Entities;

public class LanguageProficiency
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid FreelancerProfileId { get; set; }
    
    public string Language { get; set; } = string.Empty;
    
    public string ProficiencyLevel { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public FreelancerProfile FreelancerProfile { get; set; } = null!;
}


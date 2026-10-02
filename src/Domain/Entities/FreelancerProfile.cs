namespace Domain.Entities;

public class FreelancerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    public decimal? HourlyRate { get; set; }
    
    public int? YearsOfExperience { get; set; }
    
    public bool IsAvailable { get; set; } = true;
    
    public string Bio { get; set; } = string.Empty;
    
    // Navigation property
    public User User { get; set; } = null!;
}

namespace Domain.Entities;

public class FreelancerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    
    public string Headline { get; set; } = string.Empty;
    
    public decimal? HourlyRate { get; set; }
    
    public int? YearsOfExperience { get; set; }
    
    public bool IsAvailable { get; set; } = true;
    
    public string Bio { get; set; } = string.Empty;
    
    public string City { get; set; } = string.Empty;
    
    public string Country { get; set; } = string.Empty;
    
    public string Timezone { get; set; } = "UTC+7";
    
    public string HoursPerWeek { get; set; } = "> 30 hrs/week";
    
    public string? GithubUrl { get; set; }
    
    public string? LinkedinUrl { get; set; }
    
    public string? WebsiteUrl { get; set; }
    
    public decimal JobSuccessScore { get; set; } = 100;
    
    // Banking / Payout details
    public string? BankBin { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankAccountName { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    
    public ICollection<PortfolioItem> PortfolioItems { get; set; } = new List<PortfolioItem>();
    
    public ICollection<WorkExperience> WorkExperiences { get; set; } = new List<WorkExperience>();
    
    public ICollection<Education> Educations { get; set; } = new List<Education>();
    
    public ICollection<Certification> Certifications { get; set; } = new List<Certification>();
    
    public ICollection<LanguageProficiency> Languages { get; set; } = new List<LanguageProficiency>();
}

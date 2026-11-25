namespace Domain.Entities;

public class ClientProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Industry { get; set; } = string.Empty;
    public string CompanySize { get; set; } = string.Empty;
    public string WebsiteUrl { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;
    public string BillingAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = "Việt Nam";
    public string ContactPhone { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}

namespace Domain.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ContractId { get; set; }
    
    public Guid ReviewerId { get; set; }
    public Guid RevieweeId { get; set; }
    
    public int Rating { get; set; } // 1 to 5
    public string Comment { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Contract Contract { get; set; } = null!;
    public User Reviewer { get; set; } = null!;
    public User Reviewee { get; set; } = null!;
}

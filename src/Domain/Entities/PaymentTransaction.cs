namespace Domain.Entities;

public class PaymentTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ContractId { get; set; }
    public Guid MilestoneId { get; set; }
    public Guid PayerId { get; set; }
    public Guid PayeeId { get; set; }
    
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    
    public string PaymentMethod { get; set; } = "VietQR"; // "VietQR", "Card"
    public string Status { get; set; } = "Pending"; // "Pending", "Completed", "Failed"
    
    public string TransactionCode { get; set; } = string.Empty;
    public string QrUrl { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public Contract Contract { get; set; } = null!;
    public Milestone Milestone { get; set; } = null!;
    public User Payer { get; set; } = null!;
    public User Payee { get; set; } = null!;
}


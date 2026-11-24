namespace Application.Common.Interfaces;

public interface IPaymentService
{
    Task<(bool Success, PaymentQrDto? QrData, string[] Errors)> GenerateMilestonePaymentQrAsync(Guid milestoneId, string clientId);
    Task<(bool Success, string[] Errors)> ProcessPayOsWebhookAsync(PayOsWebhookPayload payload);
    Task<(bool Success, string[] Errors)> ConfirmPaymentManuallyAsync(Guid milestoneId, string clientId);
}

public class PaymentQrDto
{
    public Guid MilestoneId { get; set; }
    public Guid ContractId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string MilestoneTitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    
    // Freelancer Banking details
    public string BankBin { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankAccountName { get; set; } = string.Empty;
    
    // Deterministic Payment details
    public string Memo { get; set; } = string.Empty;
    public string VietQrUrl { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
}

public class PayOsWebhookPayload
{
    public string Code { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public PayOsWebhookData? Data { get; set; }
}

public class PayOsWebhookData
{
    public long OrderCode { get; set; }
    public int Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string TransactionDateTime { get; set; } = string.Empty;
}


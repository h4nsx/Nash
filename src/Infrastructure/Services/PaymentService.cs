using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _context;
    private readonly IWorkService _workService;

    public PaymentService(AppDbContext context, IWorkService workService)
    {
        _context = context;
        _workService = workService;
    }

    public async Task<(bool Success, PaymentQrDto? QrData, string[] Errors)> GenerateMilestonePaymentQrAsync(Guid milestoneId, string clientId)
    {
        var clientGuid = Guid.Parse(clientId);
        var milestone = await _context.Milestones
            .Include(m => m.Contract)
                .ThenInclude(c => c.Project)
            .Include(m => m.Contract)
                .ThenInclude(c => c.Freelancer)
                    .ThenInclude(f => f.FreelancerProfile)
            .FirstOrDefaultAsync(m => m.Id == milestoneId && m.Contract.Project.ClientId == clientGuid);

        if (milestone == null)
        {
            return (false, null, new[] { "Không tìm thấy mốc thanh toán hoặc bạn không có quyền truy cập." });
        }

        var profile = milestone.Contract.Freelancer.FreelancerProfile;
        // Default to demo platform bank account if freelancer hasn't set one up yet
        var bankBin = !string.IsNullOrWhiteSpace(profile?.BankBin) ? profile.BankBin : "970422"; // MB Bank
        var bankName = !string.IsNullOrWhiteSpace(profile?.BankName) ? profile.BankName : "MB Bank (Quân Đội)";
        var accountNumber = !string.IsNullOrWhiteSpace(profile?.BankAccountNumber) ? profile.BankAccountNumber : "0987654321";
        var accountName = !string.IsNullOrWhiteSpace(profile?.BankAccountName) ? profile.BankAccountName : $"{milestone.Contract.Freelancer.LastName} {milestone.Contract.Freelancer.FirstName}".ToUpperInvariant();

        // Deterministic transaction code & memo: NASH<ShortId>M<Index>
        var shortContract = milestone.ContractId.ToString().Substring(0, 6).ToUpperInvariant();
        var shortMilestone = milestone.Id.ToString().Substring(0, 4).ToUpperInvariant();
        var transactionCode = $"NASH-{shortContract}-{shortMilestone}";
        var memo = transactionCode;

        // Ensure amount is in VND (if budget is stored as small numbers <= 10000, convert as USD rate approx 25,400 VND)
        var amountVnd = milestone.Amount > 10000 ? (long)milestone.Amount : (long)(milestone.Amount * 25400);

        // Standard VietQR Image URL format
        var encodedAccountName = Uri.EscapeDataString(accountName);
        var encodedMemo = Uri.EscapeDataString(memo);
        var qrUrl = $"https://img.vietqr.io/image/{bankBin}-{accountNumber}-compact2.png?amount={amountVnd}&addInfo={encodedMemo}&accountName={encodedAccountName}";

        // Log / update payment transaction record
        var existingTx = await _context.PaymentTransactions
            .FirstOrDefaultAsync(pt => pt.MilestoneId == milestoneId && pt.Status == "Pending");

        if (existingTx == null)
        {
            var tx = new PaymentTransaction
            {
                ContractId = milestone.ContractId,
                MilestoneId = milestone.Id,
                PayerId = clientGuid,
                PayeeId = milestone.Contract.FreelancerId,
                Amount = amountVnd,
                Currency = "VND",
                PaymentMethod = "VietQR",
                Status = "Pending",
                TransactionCode = transactionCode,
                QrUrl = qrUrl,
                CreatedAt = DateTime.UtcNow
            };
            _context.PaymentTransactions.Add(tx);
            await _context.SaveChangesAsync();
        }

        var dto = new PaymentQrDto
        {
            MilestoneId = milestone.Id,
            ContractId = milestone.ContractId,
            ProjectTitle = milestone.Contract.Project.Title,
            MilestoneTitle = milestone.Title,
            Amount = amountVnd,
            Currency = "VND",
            BankBin = bankBin,
            BankName = bankName,
            BankAccountNumber = accountNumber,
            BankAccountName = accountName,
            Memo = memo,
            VietQrUrl = qrUrl,
            TransactionCode = transactionCode
        };

        return (true, dto, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> ProcessPayOsWebhookAsync(PayOsWebhookPayload payload)
    {
        if (payload?.Data == null || string.IsNullOrWhiteSpace(payload.Data.Description))
        {
            return (false, new[] { "Dữ liệu webhook không hợp lệ." });
        }

        // Look for transaction code in transfer description (e.g., NASH-XXXXXX-XXXX)
        var match = Regex.Match(payload.Data.Description, @"NASH-[A-Z0-9]{6}-[A-Z0-9]{4}", RegexOptions.IgnoreCase);
        if (!match.Success)
        {
            return (false, new[] { "Không tìm thấy mã giao dịch NASH trong nội dung chuyển khoản." });
        }

        var code = match.Value.ToUpperInvariant();
        var tx = await _context.PaymentTransactions
            .Include(t => t.Milestone)
            .Include(t => t.Contract)
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.TransactionCode == code && t.Status == "Pending");

        if (tx == null)
        {
            return (false, new[] { "Không tìm thấy giao dịch chờ tương ứng." });
        }

        tx.Status = "Completed";
        tx.CompletedAt = DateTime.UtcNow;

        // Automatically accept milestone using Client's identity
        await _workService.AcceptMilestoneAsync(tx.MilestoneId, tx.PayerId.ToString());
        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> ConfirmPaymentManuallyAsync(Guid milestoneId, string clientId)
    {
        var clientGuid = Guid.Parse(clientId);
        var tx = await _context.PaymentTransactions
            .FirstOrDefaultAsync(t => t.MilestoneId == milestoneId && t.PayerId == clientGuid && t.Status == "Pending");

        if (tx != null)
        {
            tx.Status = "Completed";
            tx.CompletedAt = DateTime.UtcNow;
        }

        // Accept the milestone
        var result = await _workService.AcceptMilestoneAsync(milestoneId, clientId);
        if (result.Success)
        {
            await _context.SaveChangesAsync();
        }

        return result;
    }

    public async Task<List<PaymentTransactionDto>> GetUserTransactionsAsync(string userId, string? role = null)
    {
        if (!Guid.TryParse(userId, out var userGuid)) return new List<PaymentTransactionDto>();

        var query = _context.PaymentTransactions
            .Include(t => t.Contract)
                .ThenInclude(c => c.Project)
            .Include(t => t.Milestone)
            .Include(t => t.Payer)
            .Include(t => t.Payee)
            .AsQueryable();

        if (string.Equals(role, "Client", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.PayerId == userGuid);
        }
        else if (string.Equals(role, "Freelancer", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(t => t.PayeeId == userGuid);
        }
        else
        {
            query = query.Where(t => t.PayerId == userGuid || t.PayeeId == userGuid);
        }

        var transactions = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transactions.Select(t =>
        {
            var isPayer = t.PayerId == userGuid;
            var counterparty = isPayer ? t.Payee : t.Payer;
            return new PaymentTransactionDto
            {
                Id = t.Id,
                ContractId = t.ContractId,
                MilestoneId = t.MilestoneId,
                ProjectTitle = t.Contract?.Project?.Title ?? string.Empty,
                MilestoneTitle = t.Milestone?.Title ?? string.Empty,
                CounterpartyName = counterparty != null ? $"{counterparty.LastName} {counterparty.FirstName}".Trim() : string.Empty,
                Amount = t.Amount,
                Currency = t.Currency,
                PaymentMethod = t.PaymentMethod,
                Status = t.Status,
                TransactionCode = t.TransactionCode,
                QrUrl = t.QrUrl,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            };
        }).ToList();
    }
}


using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [Authorize(Roles = "Client")]
    [HttpGet("milestones/{milestoneId}/qr")]
    public async Task<ActionResult<ApiResponse<PaymentQrDto>>> GetMilestonePaymentQr(Guid milestoneId)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, qrData, errors) = await _paymentService.GenerateMilestonePaymentQrAsync(milestoneId, clientId);

        if (!success || qrData == null)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = 400,
                Code = "GENERATE_QR_FAILED",
                Message = errors.FirstOrDefault() ?? "Không thể tạo mã VietQR thanh toán."
            });
        }

        return Ok(ApiResponse<PaymentQrDto>.Ok(qrData));
    }

    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<ActionResult<ApiResponse<object>>> HandlePayOsWebhook([FromBody] PayOsWebhookPayload payload)
    {
        var (success, errors) = await _paymentService.ProcessPayOsWebhookAsync(payload);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = 400,
                Code = "WEBHOOK_FAILED",
                Message = errors.FirstOrDefault() ?? "Xử lý webhook thất bại."
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Xử lý webhook thanh toán thành công." }));
    }

    [Authorize(Roles = "Client")]
    [HttpPost("milestones/{milestoneId}/confirm-transfer")]
    public async Task<ActionResult<ApiResponse<object>>> ConfirmTransfer(Guid milestoneId)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _paymentService.ConfirmPaymentManuallyAsync(milestoneId, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = 400,
                Code = "CONFIRM_PAYMENT_FAILED",
                Message = errors.FirstOrDefault() ?? "Không thể xác nhận thanh toán."
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Xác nhận thanh toán và nghiệm thu mốc thành công." }));
    }
}


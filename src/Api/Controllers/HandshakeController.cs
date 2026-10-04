using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class HandshakeController : ControllerBase
{
    private readonly IHandshakeService _handshakeService;

    public HandshakeController(IHandshakeService handshakeService)
    {
        _handshakeService = handshakeService;
    }

    [HttpPost("invitations")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<ApiResponse<object>>> SendInvitation([FromBody] SendInvitationDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, invitationId, errors) = await _handshakeService.SendInvitationAsync(request, userId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "SEND_INVITATION_FAILED", Message = errors.FirstOrDefault() ?? "Không thể gửi lời mời." });
        }

        return Ok(ApiResponse<object>.Ok(new { Id = invitationId, Message = "Gửi lời mời thành công." }));
    }

    [HttpPost("invitations/{id}/counter")]
    public async Task<ActionResult<ApiResponse<object>>> CounterOffer(Guid id, [FromBody] CounterOfferDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, errors) = await _handshakeService.CounterOfferAsync(id, request, userId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "COUNTER_OFFER_FAILED", Message = errors.FirstOrDefault() ?? "Không thể gửi đề nghị thương lượng." });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Gửi đề nghị thương lượng thành công." }));
    }

    [HttpPost("invitations/{id}/accept")]
    public async Task<ActionResult<ApiResponse<object>>> AcceptInvitation(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, errors) = await _handshakeService.AcceptInvitationAsync(id, userId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "ACCEPT_INVITATION_FAILED", Message = errors.FirstOrDefault() ?? "Không thể chấp nhận lời mời." });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Chấp nhận lời mời thành công. Hợp đồng đã được tạo." }));
    }

    [HttpPost("invitations/{id}/decline")]
    public async Task<ActionResult<ApiResponse<object>>> DeclineInvitation(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, errors) = await _handshakeService.DeclineInvitationAsync(id, userId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "DECLINE_INVITATION_FAILED", Message = errors.FirstOrDefault() ?? "Không thể từ chối lời mời." });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Đã từ chối lời mời." }));
    }
}

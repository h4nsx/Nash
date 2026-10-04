using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IWorkService _workService;

    public NotificationsController(IWorkService workService)
    {
        _workService = workService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var notifications = await _workService.GetUserNotificationsAsync(userId);
        return Ok(ApiResponse<List<NotificationDto>>.Ok(notifications));
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsRead(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, errors) = await _workService.MarkNotificationAsReadAsync(id, userId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "MARK_READ_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi cập nhật thông báo." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật thông báo thành công." }));
    }
}

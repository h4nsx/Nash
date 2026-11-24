using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISystemSettingsService _settingsService;

    public SettingsController(ISystemSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<Dictionary<string, string>>>> GetSettings()
    {
        var settings = await _settingsService.GetSettingsAsync();
        return Ok(ApiResponse<Dictionary<string, string>>.Ok(settings));
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateSetting([FromBody] UpdateSettingRequest request)
    {
        var (success, errors) = await _settingsService.UpdateSettingAsync(request.Key, request.Value);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "UPDATE_SETTING_FAILED", Message = errors.FirstOrDefault() ?? "Cập nhật cài đặt thất bại." });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật cài đặt thành công." }));
    }
}

public class UpdateSettingRequest
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

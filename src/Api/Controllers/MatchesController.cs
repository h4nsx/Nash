using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/projects")]
public class MatchesController : ControllerBase
{
    private readonly IMatchEngineService _matchService;

    public MatchesController(IMatchEngineService matchService)
    {
        _matchService = matchService;
    }

    [Authorize(Roles = "Client")]
    [HttpPost("{projectId}/matches/generate")]
    public async Task<ActionResult<ApiResponse<List<MatchDto>>>> GenerateMatches(Guid projectId)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, matches, errors) = await _matchService.GenerateMatchesAsync(projectId, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "MATCH_GENERATION_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể tạo danh sách ứng viên phù hợp." 
            });
        }

        return Ok(ApiResponse<List<MatchDto>>.Ok(matches));
    }

    [Authorize(Roles = "Client")]
    [HttpGet("{projectId}/matches")]
    public async Task<ActionResult<ApiResponse<List<MatchDto>>>> GetMatches(Guid projectId)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var matches = await _matchService.GetMatchesForProjectAsync(projectId, clientId);
        return Ok(ApiResponse<List<MatchDto>>.Ok(matches));
    }

    [Authorize(Roles = "Client")]
    [HttpPut("matches/{matchId}/status")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateMatchStatus(Guid matchId, [FromBody] UpdateMatchStatusRequest request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _matchService.UpdateMatchStatusAsync(matchId, request.Status, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "MATCH_UPDATE_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể cập nhật trạng thái ứng viên." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật thành công." }));
    }
}

public class UpdateMatchStatusRequest
{
    public MatchStatus Status { get; set; }
}

using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ISkillService _skillService;

    public SkillsController(ISkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SkillDto>>>> GetSkills()
    {
        var skills = await _skillService.GetActiveSkillsAsync();
        return Ok(ApiResponse<List<SkillDto>>.Ok(skills));
    }

    [Authorize]
    [HttpPost("{skillId}/test/start")]
    public async Task<ActionResult<ApiResponse<SkillTestAttemptDto>>> StartTest(Guid skillId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, attempt, errors) = await _skillService.StartTestAttemptAsync(userId, skillId);

        if (!success || attempt == null)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "TEST_START_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể bắt đầu bài kiểm tra." 
            });
        }

        return Ok(ApiResponse<SkillTestAttemptDto>.Ok(attempt));
    }

    [Authorize]
    [HttpPost("test/{attemptId}/submit")]
    public async Task<ActionResult<ApiResponse<object>>> SubmitTest(Guid attemptId, [FromBody] SubmitTestRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, score, errors) = await _skillService.SubmitTestAttemptAsync(userId, attemptId, request.UserAnswersJson);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "TEST_SUBMIT_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể nộp bài kiểm tra." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Đã nộp bài kiểm tra thành công.", Score = score }));
    }

    [Authorize]
    [HttpGet("me/verified")]
    public async Task<ActionResult<ApiResponse<List<VerifiedSkillDto>>>> GetMyVerifiedSkills()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var verifiedSkills = await _skillService.GetVerifiedSkillsAsync(userId);
        return Ok(ApiResponse<List<VerifiedSkillDto>>.Ok(verifiedSkills));
    }
}

public class SubmitTestRequest
{
    public string UserAnswersJson { get; set; } = string.Empty;
}

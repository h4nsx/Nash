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

    [HttpGet("categories-overview")]
    public async Task<ActionResult<ApiResponse<List<SkillCategoryOverviewDto>>>> GetCategoriesOverview()
    {
        var overview = await _skillService.GetSkillCategoriesOverviewAsync();
        return Ok(ApiResponse<List<SkillCategoryOverviewDto>>.Ok(overview));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<List<SkillDto>>>> GetAllSkills()
    {
        var skills = await _skillService.GetAllSkillsAsync();
        return Ok(ApiResponse<List<SkillDto>>.Ok(skills));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> CreateSkill([FromBody] CreateSkillDto request)
    {
        var (success, skillId, errors) = await _skillService.CreateSkillAsync(request);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "CREATE_SKILL_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể tạo kỹ năng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Id = skillId, Message = "Tạo kỹ năng thành công." }));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{skillId}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateSkill(Guid skillId, [FromBody] UpdateSkillDto request)
    {
        var (success, errors) = await _skillService.UpdateSkillAsync(skillId, request);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "UPDATE_SKILL_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể cập nhật kỹ năng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật kỹ năng thành công." }));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{skillId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSkill(Guid skillId)
    {
        var (success, errors) = await _skillService.DeleteSkillAsync(skillId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "DELETE_SKILL_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể xóa kỹ năng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Xóa kỹ năng thành công." }));
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

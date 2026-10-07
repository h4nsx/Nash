using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class WorkController : ControllerBase
{
    private readonly IWorkService _workService;

    public WorkController(IWorkService workService)
    {
        _workService = workService;
    }

    [HttpGet("contracts")]
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetMyContracts()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        var role = User.FindFirstValue(ClaimTypes.Role);

        var contracts = await _workService.GetUserContractsAsync(userId, role);
        return Ok(ApiResponse<List<ContractDto>>.Ok(contracts));
    }

    [HttpGet("contracts/{id}")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> GetContractById(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var contract = await _workService.GetContractByIdAsync(id, userId);
        if (contract == null)
        {
            return NotFound(new ApiErrorResponse 
            { 
                StatusCode = 404, 
                Code = "CONTRACT_NOT_FOUND", 
                Message = "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập." 
            });
        }

        return Ok(ApiResponse<ContractDto>.Ok(contract));
    }

    [HttpGet("contracts/{contractId}/milestones")]
    public async Task<ActionResult<ApiResponse<List<MilestoneDto>>>> GetContractMilestones(Guid contractId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var milestones = await _workService.GetContractMilestonesAsync(contractId, userId);
        return Ok(ApiResponse<List<MilestoneDto>>.Ok(milestones));
    }

    [HttpPost("contracts/{contractId}/milestones")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<ApiResponse<object>>> CreateMilestone(Guid contractId, [FromBody] CreateMilestoneDto request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, milestoneId, errors) = await _workService.CreateMilestoneAsync(contractId, request, clientId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "CREATE_MILESTONE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi tạo mốc thanh toán." });

        return Ok(ApiResponse<object>.Ok(new { Id = milestoneId, Message = "Tạo mốc thanh toán thành công." }));
    }

    [HttpPost("milestones/{id}/submit")]
    [HttpPut("milestones/{id}/submit")]
    [Authorize(Roles = "Freelancer")]
    public async Task<ActionResult<ApiResponse<object>>> SubmitMilestone(Guid id, [FromBody] SubmitMilestoneRequest request)
    {
        var freelancerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (freelancerId == null) return Unauthorized();

        var (success, errors) = await _workService.SubmitMilestoneAsync(id, request.Notes, freelancerId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "SUBMIT_MILESTONE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi nộp mốc thanh toán." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Nộp mốc thanh toán thành công." }));
    }

    [HttpPost("milestones/{id}/request-changes")]
    [HttpPut("milestones/{id}/request-changes")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<ApiResponse<object>>> RequestMilestoneChanges(Guid id, [FromBody] RequestChangesRequest request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _workService.RequestMilestoneChangesAsync(id, request.Feedback, clientId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "REQUEST_CHANGES_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi yêu cầu chỉnh sửa." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Đã gửi yêu cầu chỉnh sửa." }));
    }

    [HttpPost("milestones/{id}/accept")]
    [HttpPut("milestones/{id}/accept")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<ApiResponse<object>>> AcceptMilestone(Guid id)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _workService.AcceptMilestoneAsync(id, clientId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "ACCEPT_MILESTONE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi chấp nhận mốc thanh toán." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Chấp nhận mốc thanh toán thành công." }));
    }

    [HttpPost("contracts/{id}/complete")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<ApiResponse<object>>> CompleteContract(Guid id)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _workService.CompleteContractAsync(id, clientId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "COMPLETE_CONTRACT_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi hoàn thành hợp đồng." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Hợp đồng đã hoàn thành." }));
    }

    [HttpPost("contracts/{id}/reviews")]
    public async Task<ActionResult<ApiResponse<object>>> SubmitReview(Guid id, [FromBody] ReviewDto request)
    {
        var reviewerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (reviewerId == null) return Unauthorized();

        var (success, errors) = await _workService.SubmitReviewAsync(id, request, reviewerId);

        if (!success)
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "SUBMIT_REVIEW_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi gửi đánh giá." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Gửi đánh giá thành công." }));
    }
}

public class SubmitMilestoneRequest
{
    public string Notes { get; set; } = string.Empty;
}

public class RequestChangesRequest
{
    public string Feedback { get; set; } = string.Empty;
}

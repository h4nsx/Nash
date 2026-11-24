using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [Authorize(Roles = "Client")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> CreateProject([FromBody] CreateProjectDto request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, projectId, errors) = await _projectService.CreateProjectAsync(request, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "CREATE_PROJECT_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể tạo dự án." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Id = projectId, Message = "Tạo dự án thành công." }));
    }

    [Authorize(Roles = "Client")]
    [HttpPut("{projectId}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateProject(Guid projectId, [FromBody] UpdateProjectDto request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _projectService.UpdateProjectAsync(projectId, request, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "UPDATE_PROJECT_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể cập nhật dự án." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật dự án thành công." }));
    }

    [Authorize(Roles = "Client")]
    [HttpPost("{projectId}/skills")]
    public async Task<ActionResult<ApiResponse<object>>> AddSkillRequirement(Guid projectId, [FromBody] SkillRequirementDto request)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _projectService.AddOrUpdateSkillRequirementAsync(projectId, request, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "ADD_REQUIREMENT_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể thêm yêu cầu kỹ năng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Thêm yêu cầu kỹ năng thành công." }));
    }

    [Authorize(Roles = "Client")]
    [HttpDelete("{projectId}/skills/{requirementId}")]
    public async Task<ActionResult<ApiResponse<object>>> RemoveSkillRequirement(Guid projectId, Guid requirementId)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _projectService.RemoveSkillRequirementAsync(projectId, requirementId, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "REMOVE_REQUIREMENT_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể xóa yêu cầu kỹ năng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Xóa yêu cầu kỹ năng thành công." }));
    }

    [Authorize(Roles = "Client")]
    [HttpPost("{projectId}/publish")]
    public async Task<ActionResult<ApiResponse<object>>> PublishProject(Guid projectId)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var (success, errors) = await _projectService.PublishProjectAsync(projectId, clientId);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "PUBLISH_PROJECT_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể xuất bản dự án." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Xuất bản dự án thành công." }));
    }

    [Authorize(Roles = "Client")]
    [HttpGet("my-projects")]
    public async Task<ActionResult<ApiResponse<List<ProjectDto>>>> GetMyProjects()
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (clientId == null) return Unauthorized();

        var projects = await _projectService.GetClientProjectsAsync(clientId);
        return Ok(ApiResponse<List<ProjectDto>>.Ok(projects));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ProjectDto>>>> GetPublishedProjects()
    {
        var projects = await _projectService.GetPublishedProjectsAsync();
        return Ok(ApiResponse<List<ProjectDto>>.Ok(projects));
    }

    [HttpGet("{projectId}")]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> GetProjectById(Guid projectId)
    {
        var project = await _projectService.GetProjectByIdAsync(projectId);
        
        if (project == null)
        {
            return NotFound(new ApiErrorResponse 
            { 
                StatusCode = 404, 
                Code = "PROJECT_NOT_FOUND", 
                Message = "Không tìm thấy dự án." 
            });
        }

        return Ok(ApiResponse<ProjectDto>.Ok(project));
    }
}

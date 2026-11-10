using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateUser(Guid id, [FromBody] UpdateUserDto request)
    {
        var (success, errors) = await _userService.UpdateUserAsync(id, request);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "UPDATE_USER_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể cập nhật người dùng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật người dùng thành công." }));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(Guid id)
    {
        var (success, errors) = await _userService.DeleteUserAsync(id);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "DELETE_USER_FAILED", 
                Message = errors.FirstOrDefault() ?? "Không thể xóa người dùng." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Xóa người dùng thành công." }));
    }

    [Authorize(Roles = "Freelancer")]
    [HttpGet("me/profile")]
    public async Task<ActionResult<ApiResponse<FreelancerProfileDto>>> GetMyProfile()
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _userService.GetFreelancerProfileAsync(userId);
        if (profile == null)
            return NotFound(new ApiErrorResponse { StatusCode = 404, Code = "PROFILE_NOT_FOUND", Message = "Không tìm thấy hồ sơ." });

        return Ok(ApiResponse<FreelancerProfileDto>.Ok(profile));
    }

    [Authorize(Roles = "Freelancer")]
    [HttpPut("me/profile")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateMyProfile([FromBody] UpdateFreelancerProfileDto request)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var result = await _userService.UpdateFreelancerProfileAsync(userId, request);

        if (!result.Success)
        {
            return BadRequest(new ApiErrorResponse 
            { 
                StatusCode = 400, 
                Code = "UPDATE_PROFILE_FAILED", 
                Message = result.Errors.FirstOrDefault() ?? "Không thể cập nhật hồ sơ." 
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật hồ sơ thành công." }));
    }

    [HttpGet("freelancers")]
    public async Task<ActionResult<ApiResponse<List<PublicFreelancerDto>>>> GetPublicFreelancers([FromQuery] string? skill, [FromQuery] string? search)
    {
        var freelancers = await _userService.GetPublicFreelancersAsync(skill, search);
        return Ok(ApiResponse<List<PublicFreelancerDto>>.Ok(freelancers));
    }
}

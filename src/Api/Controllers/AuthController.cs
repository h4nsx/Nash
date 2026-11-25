using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<object>>> Register([FromBody] RegisterRequest request)
    {
        if (!Enum.TryParse<Role>(request.Role, true, out var role))
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "INVALID_ROLE", Message = "Vai trò không hợp lệ." });
        }

        var (success, errors) = await _identityService.RegisterUserAsync(request.Email, request.Password, request.FirstName, request.LastName, role);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "REGISTRATION_FAILED", Message = "Đăng ký người dùng thất bại.", Errors = new Dictionary<string, string[]> { { "Identity", errors } } });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Đăng ký người dùng thành công." }));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var (success, authResponse, errors) = await _identityService.LoginAsync(request.Email, request.Password);

        if (!success || authResponse == null)
        {
            return Unauthorized(new ApiErrorResponse { StatusCode = 401, Code = "LOGIN_FAILED", Message = "Email hoặc mật khẩu không chính xác.", Errors = new Dictionary<string, string[]> { { "Auth", errors } } });
        }

        // Set HttpOnly Cookie (Must be SameSite=None for cross-origin Netlify -> Fly.io)
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("X-Access-Token", authResponse.Token, cookieOptions);

        return Ok(ApiResponse<AuthResponse>.Ok(authResponse));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("X-Access-Token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });
        return Ok(ApiResponse<object>.Ok(new { Message = "Đăng xuất thành công." }));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<object>>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var (success, token, errors) = await _identityService.ForgotPasswordAsync(request.Email);
        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "FORGOT_PASSWORD_FAILED", Message = "Yêu cầu đặt lại mật khẩu thất bại.", Errors = new Dictionary<string, string[]> { { "Identity", errors } } });
        }

        // In production, token is sent via email. For MVP demo/dev, we return the token
        return Ok(ApiResponse<object>.Ok(new { Message = "Mã xác thực đã được gửi về email của bạn.", ResetToken = token }));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<object>>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var (success, errors) = await _identityService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "RESET_PASSWORD_FAILED", Message = "Đặt lại mật khẩu thất bại.", Errors = new Dictionary<string, string[]> { { "Identity", errors } } });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." }));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<ApiResponse<object>> GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email")
            ?? string.Empty;
        var firstName = User.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty;
        var lastName = User.FindFirstValue(ClaimTypes.Surname) ?? string.Empty;
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        return Ok(ApiResponse<object>.Ok(new
        {
            UserId = userId,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            Role = role
        }));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<object>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();

        var (success, errors) = await _identityService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = 400,
                Code = "CHANGE_PASSWORD_FAILED",
                Message = errors.FirstOrDefault() ?? "Không thể đổi mật khẩu.",
                Errors = new Dictionary<string, string[]> { { "Identity", errors } }
            });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Đổi mật khẩu thành công." }));
    }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

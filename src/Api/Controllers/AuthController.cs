using Application.Common.Interfaces;
using Application.Common.Models;
using Domain.Enums;
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

        // Set HttpOnly Cookie
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("X-Access-Token", authResponse.Token, cookieOptions);

        // Hide token in body for security
        authResponse.Token = string.Empty;

        return Ok(ApiResponse<AuthResponse>.Ok(authResponse));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("X-Access-Token");
        return Ok(ApiResponse<object>.Ok(new { Message = "Đăng xuất thành công." }));
    }
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

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
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "INVALID_ROLE", Message = "Invalid role specified." });
        }

        var (success, errors) = await _identityService.RegisterUserAsync(request.Email, request.Password, request.FirstName, request.LastName, role);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "REGISTRATION_FAILED", Message = "User registration failed.", Errors = new Dictionary<string, string[]> { { "Identity", errors } } });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "User registered successfully." }));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var (success, authResponse, errors) = await _identityService.LoginAsync(request.Email, request.Password);

        if (!success || authResponse == null)
        {
            return Unauthorized(new ApiErrorResponse { StatusCode = 401, Code = "LOGIN_FAILED", Message = "Invalid email or password.", Errors = new Dictionary<string, string[]> { { "Auth", errors } } });
        }

        return Ok(ApiResponse<AuthResponse>.Ok(authResponse));
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

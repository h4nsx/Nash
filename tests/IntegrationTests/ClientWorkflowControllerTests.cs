using System.Security.Claims;
using Api.Controllers;
using Application.Common.Interfaces;
using Application.Common.Models;
using Domain.Enums;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace IntegrationTests;

public class ClientWorkflowControllerTests
{
    private static void SetUserClaims(ControllerBase controller, Guid userId, string role = "Client")
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, "client@nash.test"),
            new Claim(ClaimTypes.GivenName, "Minh"),
            new Claim(ClaimTypes.Surname, "Nguyen"),
            new Claim(ClaimTypes.Role, role)
        };
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"))
            }
        };
    }

    [Fact]
    public void AuthController_GetMe_ReturnsClaims()
    {
        var controller = new AuthController(new StubIdentityService());
        var userId = Guid.NewGuid();
        SetUserClaims(controller, userId, "Client");

        var result = controller.GetMe();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<object>>().Subject;
        payload.Success.Should().BeTrue();
    }

    [Fact]
    public async Task AuthController_ChangePassword_ReturnsOkWhenSucceeded()
    {
        var controller = new AuthController(new StubIdentityService { ChangePasswordResult = (true, Array.Empty<string>()) });
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.ChangePassword(new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword1!",
            NewPassword = "NewPassword1!"
        });

        result.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task AuthController_ChangePassword_ReturnsBadRequestWhenFailed()
    {
        var controller = new AuthController(new StubIdentityService { ChangePasswordResult = (false, new[] { "Mật khẩu hiện tại không đúng." }) });
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.ChangePassword(new ChangePasswordRequest
        {
            CurrentPassword = "WrongPassword",
            NewPassword = "NewPassword1!"
        });

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task ProjectsController_CloseProject_ReturnsOkWhenSucceeded()
    {
        var controller = new ProjectsController(new StubProjectService { CloseResult = (true, Array.Empty<string>()) });
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.CloseProject(Guid.NewGuid());

        result.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ProjectsController_CloseProject_ReturnsBadRequestWhenAlreadyCompleted()
    {
        var controller = new ProjectsController(new StubProjectService { CloseResult = (false, new[] { "Dự án đã hoàn thành hoặc đã đóng." }) });
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.CloseProject(Guid.NewGuid());

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task HandshakeController_AcceptInvitation_ReturnsConflictWhenExpired()
    {
        var controller = new HandshakeController(new StubHandshakeService
        {
            AcceptResult = (false, new[] { "Lời mời này đã hết hạn phản hồi." })
        });
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.AcceptInvitation(Guid.NewGuid());

        result.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task HandshakeController_CounterOffer_ReturnsConflictWhenClosed()
    {
        var controller = new HandshakeController(new StubHandshakeService
        {
            CounterResult = (false, new[] { "Không thể thương lượng lời mời đã đóng." })
        });
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.CounterOffer(Guid.NewGuid(), new CounterOfferDto());

        result.Result.Should().BeOfType<ConflictObjectResult>();
    }

    private sealed class StubIdentityService : IIdentityService
    {
        public (bool Success, string[] Errors) ChangePasswordResult { get; set; } = (true, Array.Empty<string>());

        public Task<(bool Success, string[] Errors)> RegisterUserAsync(string email, string password, string firstName, string lastName, Role role)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<(bool Success, AuthResponse? AuthResponse, string[] Errors)> LoginAsync(string email, string password)
            => Task.FromResult<(bool, AuthResponse?, string[])>((false, null, Array.Empty<string>()));

        public Task<(bool Success, string? ResetToken, string[] Errors)> ForgotPasswordAsync(string email)
            => Task.FromResult<(bool, string?, string[])>((true, null, Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> ResetPasswordAsync(string email, string token, string newPassword)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
            => Task.FromResult(ChangePasswordResult);
    }

    private sealed class StubProjectService : IProjectService
    {
        public (bool Success, string[] Errors) CloseResult { get; set; } = (true, Array.Empty<string>());

        public Task<(bool Success, Guid ProjectId, string[] Errors)> CreateProjectAsync(CreateProjectDto request, string clientId)
            => Task.FromResult((true, Guid.NewGuid(), Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> UpdateProjectAsync(Guid projectId, UpdateProjectDto request, string clientId)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> AddOrUpdateSkillRequirementAsync(Guid projectId, SkillRequirementDto request, string clientId)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> RemoveSkillRequirementAsync(Guid projectId, Guid skillId, string clientId)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> PublishProjectAsync(Guid projectId, string clientId)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> CloseProjectAsync(Guid projectId, string clientId)
            => Task.FromResult(CloseResult);

        public Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
            => Task.FromResult<ProjectDto?>(null);

        public Task<List<ProjectDto>> GetClientProjectsAsync(string clientId)
            => Task.FromResult(new List<ProjectDto>());

        public Task<List<ProjectDto>> GetPublishedProjectsAsync()
            => Task.FromResult(new List<ProjectDto>());
    }

    private sealed class StubHandshakeService : IHandshakeService
    {
        public (bool Success, string[] Errors) AcceptResult { get; set; } = (true, Array.Empty<string>());
        public (bool Success, string[] Errors) CounterResult { get; set; } = (true, Array.Empty<string>());

        public Task<(bool Success, Guid InvitationId, string[] Errors)> SendInvitationAsync(SendInvitationDto request, string senderId)
            => Task.FromResult((true, Guid.NewGuid(), Array.Empty<string>()));

        public Task<(bool Success, string[] Errors)> CounterOfferAsync(Guid invitationId, CounterOfferDto request, string userId)
            => Task.FromResult(CounterResult);

        public Task<(bool Success, string[] Errors)> AcceptInvitationAsync(Guid invitationId, string userId)
            => Task.FromResult(AcceptResult);

        public Task<(bool Success, string[] Errors)> DeclineInvitationAsync(Guid invitationId, string userId)
            => Task.FromResult((true, Array.Empty<string>()));

        public Task<List<InvitationDto>> GetMyInvitationsAsync(string userId, string? role = null)
            => Task.FromResult(new List<InvitationDto>());

        public Task<InvitationDto?> GetInvitationByIdAsync(Guid invitationId, string userId)
            => Task.FromResult<InvitationDto?>(null);
    }
}

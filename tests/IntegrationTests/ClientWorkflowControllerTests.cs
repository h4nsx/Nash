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

    [Fact]
    public async Task UsersController_GetAndUpdateClientProfile_ReturnsOk()
    {
        var userId = Guid.NewGuid();
        var controller = new UsersController(new StubUserService());
        SetUserClaims(controller, userId, "Client");

        var getResult = await controller.GetMyClientProfile();
        getResult.Result.Should().BeOfType<OkObjectResult>();

        var updateResult = await controller.UpdateMyClientProfile(new UpdateClientProfileDto
        {
            CompanyName = "NASH Tech Co., Ltd",
            TaxCode = "0312345678"
        });
        updateResult.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task ContractTemplatesController_ForClient_ReturnsOnlyActiveTemplates()
    {
        var controller = new ContractTemplatesController(new StubContractTemplateService());
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.GetAllTemplates();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = ok.Value.Should().BeOfType<ApiResponse<List<ContractTemplateDto>>>().Subject;
        response.Data.Should().HaveCount(1);
        response.Data![0].IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task WorkController_UpdateAndDeleteMilestone_ReturnsExpectedResponses()
    {
        var controller = new WorkController(new StubWorkService());
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var updateResult = await controller.UpdateMilestone(Guid.NewGuid(), new UpdateMilestoneDto
        {
            Title = "Milestone 1",
            Amount = 5000000,
            DueDate = DateTime.UtcNow.AddDays(7)
        });
        updateResult.Result.Should().BeOfType<OkObjectResult>();

        var deleteResult = await controller.DeleteMilestone(Guid.NewGuid());
        deleteResult.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task PaymentsController_GetMyTransactions_ReturnsOk()
    {
        var controller = new PaymentsController(new StubPaymentService());
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.GetMyTransactions();
        result.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task MediaController_UploadWithNullFile_ReturnsBadRequest()
    {
        var controller = new MediaController(new StubStorageService());
        SetUserClaims(controller, Guid.NewGuid(), "Client");

        var result = await controller.Upload(null);
        result.Result.Should().BeOfType<BadRequestObjectResult>();
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

    private sealed class StubUserService : IUserService
    {
        public Task<List<UserDto>> GetAllUsersAsync() => Task.FromResult(new List<UserDto>());
        public Task<(bool Success, string[] Errors)> UpdateUserAsync(Guid id, UpdateUserDto request) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> DeleteUserAsync(Guid id) => Task.FromResult((true, Array.Empty<string>()));
        public Task<FreelancerProfileDto?> GetFreelancerProfileAsync(string userId) => Task.FromResult<FreelancerProfileDto?>(null);
        public Task<(bool Success, string[] Errors)> UpdateFreelancerProfileAsync(string userId, UpdateFreelancerProfileDto request) => Task.FromResult((true, Array.Empty<string>()));
        public Task<PublicFreelancerDto?> GetPublicFreelancerByIdAsync(Guid freelancerId) => Task.FromResult<PublicFreelancerDto?>(null);
        public Task<List<PublicFreelancerDto>> GetPublicFreelancersAsync(string? skill = null, string? search = null) => Task.FromResult(new List<PublicFreelancerDto>());
        public Task<ClientProfileDto?> GetClientProfileAsync(string userId) => Task.FromResult<ClientProfileDto?>(new ClientProfileDto { CompanyName = "NASH Co" });
        public Task<(bool Success, string[] Errors)> UpdateClientProfileAsync(string userId, UpdateClientProfileDto request) => Task.FromResult((true, Array.Empty<string>()));
        public Task<PublicClientDto?> GetPublicClientByIdAsync(Guid clientId) => Task.FromResult<PublicClientDto?>(new PublicClientDto { CompanyName = "NASH Co" });
    }

    private sealed class StubContractTemplateService : IContractTemplateService
    {
        public Task<List<ContractTemplateDto>> GetAllTemplatesAsync() => Task.FromResult(new List<ContractTemplateDto>
        {
            new() { Id = Guid.NewGuid(), Name = "Active Template", IsActive = true },
            new() { Id = Guid.NewGuid(), Name = "Inactive Template", IsActive = false }
        });
        public Task<(bool Success, Guid TemplateId, string[] Errors)> CreateTemplateAsync(ContractTemplateDto request) => Task.FromResult((true, Guid.NewGuid(), Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> UpdateTemplateAsync(Guid templateId, ContractTemplateDto request) => Task.FromResult((true, Array.Empty<string>()));
    }

    private sealed class StubWorkService : IWorkService
    {
        public Task<(bool Success, Guid MilestoneId, string[] Errors)> CreateMilestoneAsync(Guid contractId, CreateMilestoneDto request, string clientId) => Task.FromResult((true, Guid.NewGuid(), Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> UpdateMilestoneAsync(Guid milestoneId, UpdateMilestoneDto request, string clientId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> DeleteMilestoneAsync(Guid milestoneId, string clientId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> SubmitMilestoneAsync(Guid milestoneId, string notes, string freelancerId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> RequestMilestoneChangesAsync(Guid milestoneId, string feedback, string clientId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> AcceptMilestoneAsync(Guid milestoneId, string clientId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> CompleteContractAsync(Guid contractId, string clientId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> CancelContractAsync(Guid contractId, string reason, string userId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> SubmitReviewAsync(Guid contractId, ReviewDto request, string reviewerId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<List<ContractDto>> GetUserContractsAsync(string userId, string? role = null) => Task.FromResult(new List<ContractDto>());
        public Task<ContractDto?> GetContractByIdAsync(Guid contractId, string userId) => Task.FromResult<ContractDto?>(null);
        public Task<List<MilestoneDto>> GetContractMilestonesAsync(Guid contractId, string userId) => Task.FromResult(new List<MilestoneDto>());
        public Task<List<NotificationDto>> GetUserNotificationsAsync(string userId) => Task.FromResult(new List<NotificationDto>());
        public Task<(bool Success, string[] Errors)> MarkNotificationAsReadAsync(Guid notificationId, string userId) => Task.FromResult((true, Array.Empty<string>()));
    }

    private sealed class StubPaymentService : IPaymentService
    {
        public Task<(bool Success, PaymentQrDto? QrData, string[] Errors)> GenerateMilestonePaymentQrAsync(Guid milestoneId, string clientId) => Task.FromResult<(bool, PaymentQrDto?, string[])>((true, null, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> ProcessPayOsWebhookAsync(PayOsWebhookPayload payload) => Task.FromResult((true, Array.Empty<string>()));
        public Task<(bool Success, string[] Errors)> ConfirmPaymentManuallyAsync(Guid milestoneId, string clientId) => Task.FromResult((true, Array.Empty<string>()));
        public Task<List<PaymentTransactionDto>> GetUserTransactionsAsync(string userId, string? role = null) => Task.FromResult(new List<PaymentTransactionDto>());
    }

    private sealed class StubStorageService : IStorageService
    {
        public Task<(bool Success, MediaUploadResultDto? Asset, string[] Errors)> UploadFileAsync(Stream fileStream, string fileName, string contentType, long sizeInBytes, string uploadedByUserId)
            => Task.FromResult<(bool, MediaUploadResultDto?, string[])>((true, new MediaUploadResultDto { FileName = fileName }, Array.Empty<string>()));
        public Task<bool> DeleteFileAsync(Guid assetId, string requesterUserId) => Task.FromResult(true);
    }
}

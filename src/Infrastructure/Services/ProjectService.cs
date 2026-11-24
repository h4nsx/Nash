using System.Text.Json;
using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;

    public ProjectService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, Guid ProjectId, string[] Errors)> CreateProjectAsync(CreateProjectDto request, string clientId)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return (false, Guid.Empty, new[] { "Tiêu đề dự án không được để trống." });
        }

        var project = new Project
        {
            ClientId = Guid.Parse(clientId),
            Title = request.Title,
            Description = request.Description,
            Category = request.Category ?? string.Empty,
            SubCategory = request.SubCategory ?? string.Empty,
            PricingType = request.PricingType,
            BudgetMin = request.BudgetMin,
            BudgetMax = request.BudgetMax,
            HourlyRateMin = request.HourlyRateMin,
            HourlyRateMax = request.HourlyRateMax,
            Scope = request.Scope,
            ExperienceLevel = request.ExperienceLevel,
            LocationPreference = string.IsNullOrWhiteSpace(request.LocationPreference) ? "Worldwide" : request.LocationPreference,
            PreferredLanguage = string.IsNullOrWhiteSpace(request.PreferredLanguage) ? "Any" : request.PreferredLanguage,
            StartDate = request.StartDate.HasValue ? request.StartDate.Value.ToUniversalTime() : null,
            EndDate = request.EndDate.HasValue ? request.EndDate.Value.ToUniversalTime() : null,
            FileAttachmentsJson = JsonSerializer.Serialize(request.FileAttachments ?? new List<string>()),
            Status = ProjectStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.SkillRequirements != null && request.SkillRequirements.Any())
        {
            foreach (var req in request.SkillRequirements)
            {
                project.SkillRequirements.Add(new ProjectSkillRequirement
                {
                    SkillId = req.SkillId,
                    IsMandatory = req.IsMandatory,
                    MinimumExperienceYears = req.MinimumExperienceYears
                });
            }
        }

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return (true, project.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> UpdateProjectAsync(Guid projectId, UpdateProjectDto request, string clientId)
    {
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));
        
        if (project == null)
        {
            return (false, new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });
        }

        if (project.Status != ProjectStatus.Draft)
        {
            return (false, new[] { "Chỉ có thể chỉnh sửa dự án khi ở trạng thái Nháp (Draft)." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return (false, new[] { "Tiêu đề dự án không được để trống." });
        }

        project.Title = request.Title;
        project.Description = request.Description;
        project.Category = request.Category ?? string.Empty;
        project.SubCategory = request.SubCategory ?? string.Empty;
        project.PricingType = request.PricingType;
        project.BudgetMin = request.BudgetMin;
        project.BudgetMax = request.BudgetMax;
        project.HourlyRateMin = request.HourlyRateMin;
        project.HourlyRateMax = request.HourlyRateMax;
        project.Scope = request.Scope;
        project.ExperienceLevel = request.ExperienceLevel;
        project.LocationPreference = string.IsNullOrWhiteSpace(request.LocationPreference) ? "Worldwide" : request.LocationPreference;
        project.PreferredLanguage = string.IsNullOrWhiteSpace(request.PreferredLanguage) ? "Any" : request.PreferredLanguage;
        project.StartDate = request.StartDate.HasValue ? request.StartDate.Value.ToUniversalTime() : null;
        project.EndDate = request.EndDate.HasValue ? request.EndDate.Value.ToUniversalTime() : null;
        project.FileAttachmentsJson = JsonSerializer.Serialize(request.FileAttachments ?? new List<string>());
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> AddOrUpdateSkillRequirementAsync(Guid projectId, SkillRequirementDto request, string clientId)
    {
        var project = await _context.Projects
            .Include(p => p.SkillRequirements)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));

        if (project == null)
        {
            return (false, new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });
        }

        if (project.Status != ProjectStatus.Draft)
        {
            return (false, new[] { "Chỉ có thể thay đổi yêu cầu kỹ năng khi dự án ở trạng thái Nháp (Draft)." });
        }

        var skill = await _context.Skills.FindAsync(request.SkillId);
        if (skill == null || !skill.IsActive)
        {
            return (false, new[] { "Kỹ năng không tồn tại hoặc đã bị vô hiệu hóa." });
        }

        var existingReq = project.SkillRequirements.FirstOrDefault(r => r.SkillId == request.SkillId);
        if (existingReq != null)
        {
            existingReq.IsMandatory = request.IsMandatory;
            existingReq.MinimumExperienceYears = request.MinimumExperienceYears;
        }
        else
        {
            project.SkillRequirements.Add(new ProjectSkillRequirement
            {
                ProjectId = project.Id,
                SkillId = request.SkillId,
                IsMandatory = request.IsMandatory,
                MinimumExperienceYears = request.MinimumExperienceYears
            });
        }

        project.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> RemoveSkillRequirementAsync(Guid projectId, Guid skillId, string clientId)
    {
        var project = await _context.Projects
            .Include(p => p.SkillRequirements)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));

        if (project == null)
        {
            return (false, new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });
        }

        if (project.Status != ProjectStatus.Draft)
        {
            return (false, new[] { "Chỉ có thể thay đổi yêu cầu kỹ năng khi dự án ở trạng thái Nháp (Draft)." });
        }

        var req = project.SkillRequirements.FirstOrDefault(r => r.SkillId == skillId);
        if (req != null)
        {
            _context.ProjectSkillRequirements.Remove(req);
            project.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> PublishProjectAsync(Guid projectId, string clientId)
    {
        var project = await _context.Projects
            .Include(p => p.SkillRequirements)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));

        if (project == null)
        {
            return (false, new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });
        }

        if (project.Status != ProjectStatus.Draft)
        {
            return (false, new[] { "Dự án đã được xuất bản hoặc không ở trạng thái Nháp (Draft)." });
        }

        if (string.IsNullOrWhiteSpace(project.Title) || string.IsNullOrWhiteSpace(project.Description))
        {
            return (false, new[] { "Tiêu đề và mô tả dự án không được để trống." });
        }

        if (!project.SkillRequirements.Any())
        {
            return (false, new[] { "Dự án phải có ít nhất một yêu cầu kỹ năng trước khi xuất bản." });
        }

        project.Status = ProjectStatus.Published;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> CloseProjectAsync(Guid projectId, string clientId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.ClientId == Guid.Parse(clientId));

        if (project == null)
        {
            return (false, new[] { "Không tìm thấy dự án hoặc bạn không có quyền truy cập." });
        }

        if (project.Status == ProjectStatus.Completed || project.Status == ProjectStatus.Cancelled)
        {
            return (false, new[] { "Dự án đã hoàn thành hoặc đã đóng." });
        }

        project.Status = ProjectStatus.Cancelled;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
    {
        var p = await _context.Projects
            .Include(x => x.SkillRequirements)
                .ThenInclude(r => r.Skill)
            .FirstOrDefaultAsync(x => x.Id == projectId);

        if (p == null) return null;

        return MapToProjectDto(p);
    }

    public async Task<List<ProjectDto>> GetClientProjectsAsync(string clientId)
    {
        var projects = await _context.Projects
            .Include(p => p.SkillRequirements)
                .ThenInclude(r => r.Skill)
            .Where(p => p.ClientId == Guid.Parse(clientId))
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return projects.Select(MapToProjectDto).ToList();
    }

    public async Task<List<ProjectDto>> GetPublishedProjectsAsync()
    {
        var projects = await _context.Projects
            .Include(p => p.SkillRequirements)
                .ThenInclude(r => r.Skill)
            .Where(p => p.Status == ProjectStatus.Published)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return projects.Select(MapToProjectDto).ToList();
    }

    private static ProjectDto MapToProjectDto(Project p)
    {
        return new ProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Category = p.Category,
            SubCategory = p.SubCategory,
            PricingType = p.PricingType,
            BudgetMin = p.BudgetMin,
            BudgetMax = p.BudgetMax,
            HourlyRateMin = p.HourlyRateMin,
            HourlyRateMax = p.HourlyRateMax,
            Scope = p.Scope,
            ExperienceLevel = p.ExperienceLevel,
            LocationPreference = p.LocationPreference,
            PreferredLanguage = p.PreferredLanguage,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            FileAttachments = DeserializeList(p.FileAttachmentsJson),
            Status = p.Status,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            SkillRequirements = p.SkillRequirements.Select(r => new ProjectSkillRequirementDto
            {
                Id = r.Id,
                SkillId = r.SkillId,
                SkillName = r.Skill != null ? r.Skill.Name : string.Empty,
                IsMandatory = r.IsMandatory,
                MinimumExperienceYears = r.MinimumExperienceYears
            }).ToList()
        };
    }

    private static List<string> DeserializeList(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}

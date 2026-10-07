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
            BudgetMin = request.BudgetMin,
            BudgetMax = request.BudgetMax,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = ProjectStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

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
        project.BudgetMin = request.BudgetMin;
        project.BudgetMax = request.BudgetMax;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;
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

        var skillExists = await _context.Skills.AnyAsync(s => s.Id == request.SkillId && s.IsActive);
        if (!skillExists)
        {
            return (false, new[] { "Kỹ năng không tồn tại hoặc không khả dụng." });
        }

        var requirement = project.SkillRequirements.FirstOrDefault(r => r.SkillId == request.SkillId);
        if (requirement != null)
        {
            // Update existing
            requirement.IsMandatory = request.IsMandatory;
            requirement.MinimumExperienceYears = request.MinimumExperienceYears;
        }
        else
        {
            // Add new
            project.SkillRequirements.Add(new ProjectSkillRequirement
            {
                SkillId = request.SkillId,
                IsMandatory = request.IsMandatory,
                MinimumExperienceYears = request.MinimumExperienceYears
            });
        }

        project.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> RemoveSkillRequirementAsync(Guid projectId, Guid requirementId, string clientId)
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

        var requirement = project.SkillRequirements.FirstOrDefault(r => r.Id == requirementId);
        if (requirement == null)
        {
            return (false, new[] { "Không tìm thấy yêu cầu kỹ năng này trong dự án." });
        }

        project.SkillRequirements.Remove(requirement);
        project.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

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
            return (false, new[] { "Dự án không ở trạng thái Nháp (Draft) nên không thể xuất bản." });
        }

        if (!project.SkillRequirements.Any(r => r.IsMandatory))
        {
            return (false, new[] { "Không thể xuất bản dự án nếu chưa có ít nhất một yêu cầu kỹ năng bắt buộc." });
        }

        project.Status = ProjectStatus.Published;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }

    public async Task<List<ProjectDto>> GetClientProjectsAsync(string clientId)
    {
        return await _context.Projects
            .Where(p => p.ClientId == Guid.Parse(clientId))
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                BudgetMin = p.BudgetMin,
                BudgetMax = p.BudgetMax,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<ProjectDto>> GetPublishedProjectsAsync()
    {
        return await _context.Projects
            .Include(p => p.SkillRequirements).ThenInclude(r => r.Skill)
            .Where(p => p.Status == ProjectStatus.Published)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                BudgetMin = p.BudgetMin,
                BudgetMax = p.BudgetMax,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                SkillRequirements = p.SkillRequirements.Select(r => new ProjectSkillRequirementDto
                {
                    Id = r.Id,
                    SkillId = r.SkillId,
                    SkillName = r.Skill.Name,
                    IsMandatory = r.IsMandatory,
                    MinimumExperienceYears = r.MinimumExperienceYears
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Include(p => p.SkillRequirements)
            .ThenInclude(r => r.Skill)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null) return null;

        return new ProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            BudgetMin = project.BudgetMin,
            BudgetMax = project.BudgetMax,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            Status = project.Status,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            SkillRequirements = project.SkillRequirements.Select(r => new ProjectSkillRequirementDto
            {
                Id = r.Id,
                SkillId = r.SkillId,
                SkillName = r.Skill.Name,
                IsMandatory = r.IsMandatory,
                MinimumExperienceYears = r.MinimumExperienceYears
            }).ToList()
        };
    }
}

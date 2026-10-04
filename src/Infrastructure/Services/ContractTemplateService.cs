using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class ContractTemplateService : IContractTemplateService
{
    private readonly AppDbContext _context;

    public ContractTemplateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ContractTemplateDto>> GetAllTemplatesAsync()
    {
        return await _context.ContractTemplates
            .Select(t => new ContractTemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                ContentHtml = t.ContentHtml,
                ContentJson = t.ContentJson,
                IsActive = t.IsActive
            })
            .ToListAsync();
    }

    public async Task<(bool Success, Guid TemplateId, string[] Errors)> CreateTemplateAsync(ContractTemplateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return (false, Guid.Empty, new[] { "Tên mẫu hợp đồng không được để trống." });

        var template = new ContractTemplate
        {
            Name = request.Name,
            ContentHtml = request.ContentHtml,
            ContentJson = request.ContentJson,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ContractTemplates.Add(template);
        await _context.SaveChangesAsync();

        return (true, template.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> UpdateTemplateAsync(Guid templateId, ContractTemplateDto request)
    {
        var template = await _context.ContractTemplates.FindAsync(templateId);
        if (template == null) return (false, new[] { "Không tìm thấy mẫu hợp đồng." });

        template.Name = request.Name;
        template.ContentHtml = request.ContentHtml;
        template.ContentJson = request.ContentJson;
        template.IsActive = request.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (true, Array.Empty<string>());
    }
}

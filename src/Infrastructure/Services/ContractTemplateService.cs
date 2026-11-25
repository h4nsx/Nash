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
        if (!await _context.ContractTemplates.AnyAsync())
        {
            var defaults = new List<ContractTemplate>
            {
                new ContractTemplate
                {
                    Name = "Mẫu Hợp đồng Khoán gọn theo Cột mốc (Fixed-Price)",
                    ContentHtml = "<h4>THỎA THUẬN TRIỂN KHAI DỰ ÁN THEO CỘT MỐC</h4><p><strong>Dự án:</strong> {{PROJECT_TITLE}}</p><p><strong>Bên nhận việc:</strong> {{FREELANCER_NAME}}</p><p><strong>Tổng ngân sách:</strong> {{BUDGET_VND}}</p><p><strong>Thời hạn:</strong> Từ {{START_DATE}} đến {{END_DATE}}</p><p>Thanh toán được giải ngân qua VietQR ngay sau khi Bên A nghiệm thu từng cột mốc bàn giao.</p>",
                    ContentJson = "{\"type\":\"fixed_milestone\"}",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new ContractTemplate
                {
                    Name = "Mẫu Hợp đồng Tư vấn & Phát triển theo Giờ (Hourly)",
                    ContentHtml = "<h4>THỎA THUẬN HỢP TÁC KỸ THUẬT THEO GIỜ</h4><p><strong>Dự án:</strong> {{PROJECT_TITLE}}</p><p><strong>Chuyên gia thực hiện:</strong> {{FREELANCER_NAME}}</p><p><strong>Ngân sách trần dự kiến:</strong> {{BUDGET_VND}}</p><p><strong>Thời hạn:</strong> Từ {{START_DATE}} đến {{END_DATE}}</p><p>Hai bên thống nhất báo cáo tiến độ định kỳ hàng tuần và nghiệm thu bàn giao theo từng giai đoạn.</p>",
                    ContentJson = "{\"type\":\"hourly_retainer\"}",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };
            _context.ContractTemplates.AddRange(defaults);
            await _context.SaveChangesAsync();
        }

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

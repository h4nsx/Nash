namespace Application.Common.Interfaces;

public interface IContractTemplateService
{
    Task<List<ContractTemplateDto>> GetAllTemplatesAsync();
    Task<(bool Success, Guid TemplateId, string[] Errors)> CreateTemplateAsync(ContractTemplateDto request);
    Task<(bool Success, string[] Errors)> UpdateTemplateAsync(Guid templateId, ContractTemplateDto request);
}

public class ContractTemplateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContentHtml { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

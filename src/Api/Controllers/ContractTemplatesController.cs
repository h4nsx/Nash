using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(Roles = "Admin")]
public class ContractTemplatesController : ControllerBase
{
    private readonly IContractTemplateService _templateService;

    public ContractTemplatesController(IContractTemplateService templateService)
    {
        _templateService = templateService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ContractTemplateDto>>>> GetAllTemplates()
    {
        var templates = await _templateService.GetAllTemplatesAsync();
        return Ok(ApiResponse<List<ContractTemplateDto>>.Ok(templates));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> CreateTemplate([FromBody] ContractTemplateDto request)
    {
        var (success, templateId, errors) = await _templateService.CreateTemplateAsync(request);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "CREATE_TEMPLATE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi tạo mẫu hợp đồng." });
        }

        return Ok(ApiResponse<object>.Ok(new { Id = templateId, Message = "Tạo mẫu hợp đồng thành công." }));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTemplate(Guid id, [FromBody] ContractTemplateDto request)
    {
        var (success, errors) = await _templateService.UpdateTemplateAsync(id, request);

        if (!success)
        {
            return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "UPDATE_TEMPLATE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi cập nhật mẫu hợp đồng." });
        }

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật mẫu hợp đồng thành công." }));
    }
}

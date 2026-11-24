using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CmsController : ControllerBase
{
    private readonly ICmsService _cmsService;

    public CmsController(ICmsService cmsService)
    {
        _cmsService = cmsService;
    }

    // -- ARTICLES --
    
    [HttpGet("articles")]
    public async Task<ActionResult<ApiResponse<List<ArticleSummaryDto>>>> GetPublicArticles()
    {
        var articles = await _cmsService.GetPublicArticlesAsync();
        return Ok(ApiResponse<List<ArticleSummaryDto>>.Ok(articles));
    }

    [HttpGet("articles/{slug}")]
    public async Task<ActionResult<ApiResponse<ArticleDto>>> GetArticleBySlug(string slug)
    {
        var article = await _cmsService.GetArticleBySlugAsync(slug);
        if (article == null) return NotFound(new ApiErrorResponse { StatusCode = 404, Code = "NOT_FOUND", Message = "Không tìm thấy bài viết." });

        return Ok(ApiResponse<ArticleDto>.Ok(article));
    }

    [HttpPost("articles")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> CreateArticle([FromBody] CreateArticleDto request)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authorId == null) return Unauthorized();

        var (success, id, errors) = await _cmsService.CreateArticleAsync(request, authorId);
        if (!success) return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "CREATE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi." });

        return Ok(ApiResponse<object>.Ok(new { Id = id, Message = "Tạo bài viết thành công." }));
    }

    [HttpPut("articles/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateArticle(Guid id, [FromBody] UpdateArticleDto request)
    {
        var (success, errors) = await _cmsService.UpdateArticleAsync(id, request);
        if (!success) return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "UPDATE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật thành công." }));
    }

    [HttpDelete("articles/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteArticle(Guid id)
    {
        var (success, errors) = await _cmsService.DeleteArticleAsync(id);
        if (!success) return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "DELETE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Xóa thành công." }));
    }

    // -- PAGES --

    [HttpGet("pages/{slug}")]
    public async Task<ActionResult<ApiResponse<PageDto>>> GetPageBySlug(string slug)
    {
        var page = await _cmsService.GetPageBySlugAsync(slug);
        if (page == null) return NotFound(new ApiErrorResponse { StatusCode = 404, Code = "NOT_FOUND", Message = "Không tìm thấy trang." });

        return Ok(ApiResponse<PageDto>.Ok(page));
    }

    [HttpPost("pages")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> CreatePage([FromBody] CreatePageDto request)
    {
        var (success, id, errors) = await _cmsService.CreatePageAsync(request);
        if (!success) return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "CREATE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi." });

        return Ok(ApiResponse<object>.Ok(new { Id = id, Message = "Tạo trang thành công." }));
    }

    [HttpPut("pages/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> UpdatePage(Guid id, [FromBody] UpdatePageDto request)
    {
        var (success, errors) = await _cmsService.UpdatePageAsync(id, request);
        if (!success) return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "UPDATE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Cập nhật thành công." }));
    }

    [HttpDelete("pages/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeletePage(Guid id)
    {
        var (success, errors) = await _cmsService.DeletePageAsync(id);
        if (!success) return BadRequest(new ApiErrorResponse { StatusCode = 400, Code = "DELETE_FAILED", Message = errors.FirstOrDefault() ?? "Lỗi." });

        return Ok(ApiResponse<object>.Ok(new { Message = "Xóa thành công." }));
    }

    // -- SITEMAP --

    [HttpGet("sitemap.xml")]
    public async Task<IActionResult> GetSitemap()
    {
        // Ideally from configuration/settings, but hardcoded base url for now
        var baseUrl = "https://nash.com"; 
        var xml = await _cmsService.GenerateSitemapXmlAsync(baseUrl);
        return Content(xml, "application/xml");
    }
}

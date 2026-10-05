namespace Application.Common.Interfaces;

public interface ICmsService
{
    // Articles
    Task<(bool Success, Guid ArticleId, string[] Errors)> CreateArticleAsync(CreateArticleDto request, string authorId);
    Task<(bool Success, string[] Errors)> UpdateArticleAsync(Guid id, UpdateArticleDto request);
    Task<(bool Success, string[] Errors)> DeleteArticleAsync(Guid id);
    Task<ArticleDto?> GetArticleBySlugAsync(string slug);
    Task<List<ArticleSummaryDto>> GetPublicArticlesAsync(); // MVP: Return all published

    // Pages
    Task<(bool Success, Guid PageId, string[] Errors)> CreatePageAsync(CreatePageDto request);
    Task<(bool Success, string[] Errors)> UpdatePageAsync(Guid id, UpdatePageDto request);
    Task<(bool Success, string[] Errors)> DeletePageAsync(Guid id);
    Task<PageDto?> GetPageBySlugAsync(string slug);
    
    // Sitemap
    Task<string> GenerateSitemapXmlAsync(string baseUrl);
}

// DTOs
public class CreateArticleDto
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ContentHtml { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public string SeoTitle { get; set; } = string.Empty;
    public string SeoDescription { get; set; } = string.Empty;
    public string SeoKeywords { get; set; } = string.Empty;
}

public class UpdateArticleDto : CreateArticleDto { }

public class ArticleDto : CreateArticleDto
{
    public Guid Id { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string AuthorName { get; set; } = string.Empty;
}

public class ArticleSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }
}

public class CreatePageDto
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ContentHtml { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public string SeoTitle { get; set; } = string.Empty;
    public string SeoDescription { get; set; } = string.Empty;
    public string SeoKeywords { get; set; } = string.Empty;
}

public class UpdatePageDto : CreatePageDto { }

public class PageDto : CreatePageDto
{
    public Guid Id { get; set; }
}

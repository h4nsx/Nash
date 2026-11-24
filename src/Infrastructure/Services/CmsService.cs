using System.Text;
using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class CmsService : ICmsService
{
    private readonly AppDbContext _context;

    public CmsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, Guid ArticleId, string[] Errors)> CreateArticleAsync(CreateArticleDto request, string authorId)
    {
        var existing = await _context.Articles.AnyAsync(a => a.Slug == request.Slug);
        if (existing) return (false, Guid.Empty, new[] { "Đường dẫn (Slug) này đã tồn tại." });

        var article = new Article
        {
            Title = request.Title,
            Slug = request.Slug,
            ContentHtml = request.ContentHtml,
            ContentJson = request.ContentJson,
            ThumbnailUrl = request.ThumbnailUrl,
            IsPublished = request.IsPublished,
            PublishedAt = request.IsPublished ? DateTime.UtcNow : null,
            SeoTitle = request.SeoTitle,
            SeoDescription = request.SeoDescription,
            SeoKeywords = request.SeoKeywords,
            AuthorId = Guid.Parse(authorId),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        return (true, article.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> UpdateArticleAsync(Guid id, UpdateArticleDto request)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) return (false, new[] { "Không tìm thấy bài viết." });

        if (article.Slug != request.Slug)
        {
            var existing = await _context.Articles.AnyAsync(a => a.Slug == request.Slug && a.Id != id);
            if (existing) return (false, new[] { "Đường dẫn (Slug) này đã tồn tại." });
        }

        article.Title = request.Title;
        article.Slug = request.Slug;
        article.ContentHtml = request.ContentHtml;
        article.ContentJson = request.ContentJson;
        article.ThumbnailUrl = request.ThumbnailUrl;
        
        if (!article.IsPublished && request.IsPublished)
        {
            article.PublishedAt = DateTime.UtcNow;
        }
        article.IsPublished = request.IsPublished;
        
        article.SeoTitle = request.SeoTitle;
        article.SeoDescription = request.SeoDescription;
        article.SeoKeywords = request.SeoKeywords;
        article.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> DeleteArticleAsync(Guid id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) return (false, new[] { "Không tìm thấy bài viết." });

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<ArticleDto?> GetArticleBySlugAsync(string slug)
    {
        var article = await _context.Articles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Slug == slug && a.IsPublished);

        if (article == null) return null;

        return new ArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Slug = article.Slug,
            ContentHtml = article.ContentHtml,
            ContentJson = article.ContentJson,
            ThumbnailUrl = article.ThumbnailUrl,
            IsPublished = article.IsPublished,
            PublishedAt = article.PublishedAt,
            SeoTitle = article.SeoTitle,
            SeoDescription = article.SeoDescription,
            SeoKeywords = article.SeoKeywords,
            AuthorName = $"{article.Author.FirstName} {article.Author.LastName}".Trim()
        };
    }

    public async Task<List<ArticleSummaryDto>> GetPublicArticlesAsync()
    {
        return await _context.Articles
            .Where(a => a.IsPublished)
            .OrderByDescending(a => a.PublishedAt)
            .Select(a => new ArticleSummaryDto
            {
                Id = a.Id,
                Title = a.Title,
                Slug = a.Slug,
                ThumbnailUrl = a.ThumbnailUrl,
                PublishedAt = a.PublishedAt
            })
            .ToListAsync();
    }

    // Pages
    public async Task<(bool Success, Guid PageId, string[] Errors)> CreatePageAsync(CreatePageDto request)
    {
        var existing = await _context.Pages.AnyAsync(p => p.Slug == request.Slug);
        if (existing) return (false, Guid.Empty, new[] { "Đường dẫn (Slug) này đã tồn tại." });

        var page = new Page
        {
            Title = request.Title,
            Slug = request.Slug,
            ContentHtml = request.ContentHtml,
            ContentJson = request.ContentJson,
            IsPublished = request.IsPublished,
            SeoTitle = request.SeoTitle,
            SeoDescription = request.SeoDescription,
            SeoKeywords = request.SeoKeywords,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Pages.Add(page);
        await _context.SaveChangesAsync();

        return (true, page.Id, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> UpdatePageAsync(Guid id, UpdatePageDto request)
    {
        var page = await _context.Pages.FindAsync(id);
        if (page == null) return (false, new[] { "Không tìm thấy trang." });

        if (page.Slug != request.Slug)
        {
            var existing = await _context.Pages.AnyAsync(p => p.Slug == request.Slug && p.Id != id);
            if (existing) return (false, new[] { "Đường dẫn (Slug) này đã tồn tại." });
        }

        page.Title = request.Title;
        page.Slug = request.Slug;
        page.ContentHtml = request.ContentHtml;
        page.ContentJson = request.ContentJson;
        page.IsPublished = request.IsPublished;
        page.SeoTitle = request.SeoTitle;
        page.SeoDescription = request.SeoDescription;
        page.SeoKeywords = request.SeoKeywords;
        page.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<(bool Success, string[] Errors)> DeletePageAsync(Guid id)
    {
        var page = await _context.Pages.FindAsync(id);
        if (page == null) return (false, new[] { "Không tìm thấy trang." });

        _context.Pages.Remove(page);
        await _context.SaveChangesAsync();
        return (true, Array.Empty<string>());
    }

    public async Task<PageDto?> GetPageBySlugAsync(string slug)
    {
        var page = await _context.Pages.FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);
        if (page == null) return null;

        return new PageDto
        {
            Id = page.Id,
            Title = page.Title,
            Slug = page.Slug,
            ContentHtml = page.ContentHtml,
            ContentJson = page.ContentJson,
            IsPublished = page.IsPublished,
            SeoTitle = page.SeoTitle,
            SeoDescription = page.SeoDescription,
            SeoKeywords = page.SeoKeywords
        };
    }

    public async Task<string> GenerateSitemapXmlAsync(string baseUrl)
    {
        var articles = await _context.Articles
            .Where(a => a.IsPublished)
            .Select(a => new { a.Slug, a.UpdatedAt })
            .ToListAsync();

        var pages = await _context.Pages
            .Where(p => p.IsPublished)
            .Select(p => new { p.Slug, p.UpdatedAt })
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        // Base URL
        sb.AppendLine("  <url>");
        sb.AppendLine($"    <loc>{baseUrl}</loc>");
        sb.AppendLine("    <changefreq>daily</changefreq>");
        sb.AppendLine("    <priority>1.0</priority>");
        sb.AppendLine("  </url>");

        foreach (var p in pages)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{baseUrl}/{p.Slug}</loc>");
            sb.AppendLine($"    <lastmod>{p.UpdatedAt:yyyy-MM-dd}</lastmod>");
            sb.AppendLine("    <changefreq>weekly</changefreq>");
            sb.AppendLine("    <priority>0.8</priority>");
            sb.AppendLine("  </url>");
        }

        foreach (var a in articles)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>{baseUrl}/blog/{a.Slug}</loc>");
            sb.AppendLine($"    <lastmod>{a.UpdatedAt:yyyy-MM-dd}</lastmod>");
            sb.AppendLine("    <changefreq>monthly</changefreq>");
            sb.AppendLine("    <priority>0.6</priority>");
            sb.AppendLine("  </url>");
        }

        sb.AppendLine("</urlset>");
        return sb.ToString();
    }
}

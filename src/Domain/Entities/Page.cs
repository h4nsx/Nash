namespace Domain.Entities;

public class Page
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    
    public string ContentHtml { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
    
    public bool IsPublished { get; set; } = false;
    
    // SEO Fields
    public string SeoTitle { get; set; } = string.Empty;
    public string SeoDescription { get; set; } = string.Empty;
    public string SeoKeywords { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

namespace Domain.Entities;

public class MediaAsset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    
    public Guid UploadedById { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

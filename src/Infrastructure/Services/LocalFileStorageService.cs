using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class LocalFileStorageService : IStorageService
{
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".webp", ".zip", ".txt"
    };

    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public LocalFileStorageService(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<(bool Success, MediaUploadResultDto? Asset, string[] Errors)> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        long sizeInBytes,
        string uploadedByUserId)
    {
        if (sizeInBytes <= 0)
            return (false, null, new[] { "Tệp tải lên không có nội dung." });

        if (sizeInBytes > MaxFileSizeBytes)
            return (false, null, new[] { "Kích thước tệp tối đa là 10 MB." });

        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            return (false, null, new[] { "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận PDF, Word, Excel, Ảnh, TXT hoặc ZIP." });
        }

        if (!Guid.TryParse(uploadedByUserId, out var uploaderId))
            return (false, null, new[] { "Người dùng không hợp lệ." });

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var uploadsDir = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var safeName = Path.GetFileNameWithoutExtension(fileName)
            .Replace(" ", "_")
            .Replace("..", "_");
        if (safeName.Length > 60) safeName = safeName[..60];
        var storedFileName = $"{Guid.NewGuid():N}_{safeName}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadsDir, storedFileName);

        await using (var targetStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write))
        {
            await fileStream.CopyToAsync(targetStream);
        }

        var relativeUrl = $"/uploads/{storedFileName}";

        var mediaAsset = new MediaAsset
        {
            FileName = Path.GetFileName(fileName),
            ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType,
            Url = relativeUrl,
            SizeInBytes = sizeInBytes,
            UploadedById = uploaderId,
            CreatedAt = DateTime.UtcNow
        };

        _context.MediaAssets.Add(mediaAsset);
        await _context.SaveChangesAsync();

        return (true, new MediaUploadResultDto
        {
            Id = mediaAsset.Id,
            FileName = mediaAsset.FileName,
            Url = mediaAsset.Url,
            ContentType = mediaAsset.ContentType,
            SizeInBytes = mediaAsset.SizeInBytes
        }, Array.Empty<string>());
    }

    public async Task<bool> DeleteFileAsync(Guid assetId, string requesterUserId)
    {
        if (!Guid.TryParse(requesterUserId, out var userGuid)) return false;

        var asset = await _context.MediaAssets
            .FirstOrDefaultAsync(a => a.Id == assetId && a.UploadedById == userGuid);
        if (asset == null) return false;

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var relativePath = asset.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(webRoot, relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        _context.MediaAssets.Remove(asset);
        await _context.SaveChangesAsync();
        return true;
    }
}

namespace Application.Common.Interfaces;

public interface IStorageService
{
    Task<(bool Success, MediaUploadResultDto? Asset, string[] Errors)> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        long sizeInBytes,
        string uploadedByUserId);

    Task<bool> DeleteFileAsync(Guid assetId, string requesterUserId);
}

public class MediaUploadResultDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
}

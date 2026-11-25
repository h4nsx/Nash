using System.Security.Claims;
using Application.Common.Interfaces;
using Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IStorageService _storageService;

    public MediaController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<ApiResponse<MediaUploadResultDto>>> Upload(IFormFile? file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = 400,
                Code = "INVALID_FILE",
                Message = "Vui lòng chọn tệp hợp lệ để tải lên."
            });
        }

        await using var stream = file.OpenReadStream();
        var (success, asset, errors) = await _storageService.UploadFileAsync(
            stream,
            file.FileName,
            file.ContentType,
            file.Length,
            userId);

        if (!success || asset == null)
        {
            return BadRequest(new ApiErrorResponse
            {
                StatusCode = 400,
                Code = "UPLOAD_FAILED",
                Message = errors.FirstOrDefault() ?? "Không thể tải tệp lên."
            });
        }

        if (asset.Url.StartsWith("/") && Request?.Host.HasValue == true)
        {
            asset.Url = $"{Request.Scheme}://{Request.Host}{asset.Url}";
        }

        return Ok(ApiResponse<MediaUploadResultDto>.Ok(asset));
    }
}

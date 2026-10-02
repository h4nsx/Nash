using Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MetaController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public MetaController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpGet]
    public ActionResult<ApiResponse<object>> GetMeta()
    {
        var meta = new
        {
            Service = "NASH API",
            Version = "1.0.0",
            Environment = _env.EnvironmentName,
            Timestamp = DateTime.UtcNow
        };

        return Ok(ApiResponse<object>.Ok(meta, requestId: HttpContext.TraceIdentifier));
    }
}

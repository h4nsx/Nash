using System.Net;
using System.Text.Json;
using Application.Common.Models;
using Domain.Common;

namespace Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var requestId = context.TraceIdentifier;
        var statusCode = (int)HttpStatusCode.InternalServerError;
        var code = "INTERNAL_SERVER_ERROR";
        var message = "An unexpected error occurred.";

        if (exception is DomainException domainEx)
        {
            statusCode = (int)HttpStatusCode.BadRequest;
            code = domainEx.Code;
            message = domainEx.Message;
            _logger.LogWarning(domainEx, "Domain exception occurred. RequestId: {RequestId}, Code: {Code}", requestId, code);
        }
        else
        {
            _logger.LogError(exception, "Unhandled exception occurred. RequestId: {RequestId}", requestId);
        }

        var response = new ApiErrorResponse
        {
            StatusCode = statusCode,
            Code = code,
            Message = message,
            RequestId = requestId
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}

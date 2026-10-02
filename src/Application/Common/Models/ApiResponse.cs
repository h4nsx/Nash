namespace Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string? RequestId { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null, string? requestId = null) =>
        new() { Success = true, Data = data, Message = message, RequestId = requestId };
}

public class ApiErrorResponse
{
    public int StatusCode { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? RequestId { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
}

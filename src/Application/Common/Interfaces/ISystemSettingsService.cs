namespace Application.Common.Interfaces;

public interface ISystemSettingsService
{
    Task<Dictionary<string, string>> GetSettingsAsync();
    Task<(bool Success, string[] Errors)> UpdateSettingAsync(string key, string value);
}

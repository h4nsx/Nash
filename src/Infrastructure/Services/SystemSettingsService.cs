using Application.Common.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Infrastructure.Services;

public class SystemSettingsService : ISystemSettingsService
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "SystemSettings";

    public SystemSettingsService(AppDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Dictionary<string, string>> GetSettingsAsync()
    {
        if (!_cache.TryGetValue(CacheKey, out Dictionary<string, string>? cachedSettings) || cachedSettings == null)
        {
            var settings = await _context.SystemSettings.ToListAsync();
            cachedSettings = settings.ToDictionary(s => s.Key, s => s.Value);
            _cache.Set(CacheKey, cachedSettings, TimeSpan.FromMinutes(30));
        }
        return cachedSettings;
    }

    public async Task<(bool Success, string[] Errors)> UpdateSettingAsync(string key, string value)
    {
        if (string.IsNullOrWhiteSpace(key))
            return (false, new[] { "Khóa cài đặt không được để trống." });

        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (setting == null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = value,
                UpdatedAt = DateTime.UtcNow
            };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        _cache.Remove(CacheKey); // Invalidate cache
        
        return (true, Array.Empty<string>());
    }
}

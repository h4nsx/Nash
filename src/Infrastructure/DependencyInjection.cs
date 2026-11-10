using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.RateLimiting;
using Application.Common.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Infrastructure.Identity;
using Infrastructure.Services;
using Infrastructure.BackgroundJobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default");

        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

            services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
            
            services.AddMemoryCache();
            
            services.AddRateLimiter(options =>
            {
                options.AddFixedWindowLimiter("Strict", opt =>
                {
                    opt.Window = TimeSpan.FromMinutes(1);
                    opt.PermitLimit = 5;
                    opt.QueueLimit = 0;
                });
                
                options.AddFixedWindowLimiter("Global", opt =>
                {
                    opt.Window = TimeSpan.FromMinutes(1);
                    opt.PermitLimit = 100;
                    opt.QueueLimit = 2;
                });
            });

            services.AddIdentityCore<ApplicationUser>(options => 
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>();

            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<ISkillService, SkillService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IMatchEngineService, MatchEngineService>();
            services.AddScoped<IContractTemplateService, ContractTemplateService>();
            services.AddScoped<IHandshakeService, HandshakeService>();
            services.AddScoped<IWorkService, WorkService>();
            services.AddScoped<ISystemSettingsService, SystemSettingsService>();
            services.AddScoped<ICmsService, CmsService>();
            
            services.AddSignalR();
            services.AddScoped<IRealTimeNotificationService, RealTimeNotificationService>();
            
            services.AddHostedService<InvitationExpirationService>();
        }

        return services;
    }
}

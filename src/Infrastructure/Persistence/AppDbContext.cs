using Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Infrastructure.Identity;
using Domain.Entities;

namespace Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser>, IAppDbContext
{
    public DbSet<User> DomainUsers { get; set; } = null!;
    public DbSet<Skill> Skills { get; set; } = null!;
    public DbSet<SkillTest> SkillTests { get; set; } = null!;
    public DbSet<SkillTestAttempt> SkillTestAttempts { get; set; } = null!;
    public DbSet<VerifiedSkill> VerifiedSkills { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<ProjectSkillRequirement> ProjectSkillRequirements { get; set; } = null!;
    public DbSet<FreelancerProfile> FreelancerProfiles { get; set; } = null!;
    public DbSet<Match> Matches { get; set; } = null!;
    
    // Phase 5: Handshake
    public DbSet<ContractTemplate> ContractTemplates { get; set; } = null!;
    public DbSet<Invitation> Invitations { get; set; } = null!;
    public DbSet<ContractDraft> ContractDrafts { get; set; } = null!;
    public DbSet<Contract> Contracts { get; set; } = null!;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        
        // Map pure Domain User to the Users table
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IdentityId).IsRequired();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.ToTable("Skills");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<SkillTest>(entity =>
        {
            entity.ToTable("SkillTests");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Skill)
                  .WithMany(s => s.Tests)
                  .HasForeignKey(e => e.SkillId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SkillTestAttempt>(entity =>
        {
            entity.ToTable("SkillTestAttempts");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Attempts)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SkillTest)
                  .WithMany(st => st.Attempts)
                  .HasForeignKey(e => e.SkillTestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VerifiedSkill>(entity =>
        {
            entity.ToTable("VerifiedSkills");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithMany(u => u.VerifiedSkills)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Skill)
                  .WithMany()
                  .HasForeignKey(e => e.SkillId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Attempt)
                  .WithMany()
                  .HasForeignKey(e => e.SkillTestAttemptId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            
            entity.HasOne(e => e.Client)
                  .WithMany(u => u.Projects)
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProjectSkillRequirement>(entity =>
        {
            entity.ToTable("ProjectSkillRequirements");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Project)
                  .WithMany(p => p.SkillRequirements)
                  .HasForeignKey(e => e.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Skill)
                  .WithMany()
                  .HasForeignKey(e => e.SkillId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FreelancerProfile>(entity =>
        {
            entity.ToTable("FreelancerProfiles");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithOne(u => u.FreelancerProfile)
                  .HasForeignKey<FreelancerProfile>(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Match>(entity =>
        {
            entity.ToTable("Matches");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Project)
                  .WithMany()
                  .HasForeignKey(e => e.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Freelancer)
                  .WithMany(u => u.Matches)
                  .HasForeignKey(e => e.FreelancerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Phase 5: Handshake
        modelBuilder.Entity<ContractTemplate>(entity =>
        {
            entity.ToTable("ContractTemplates");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.ToTable("Invitations");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Project)
                  .WithMany(p => p.Invitations)
                  .HasForeignKey(e => e.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Freelancer)
                  .WithMany(u => u.InvitationsReceived)
                  .HasForeignKey(e => e.FreelancerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Sender)
                  .WithMany(u => u.InvitationsSent)
                  .HasForeignKey(e => e.SenderId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ContractDraft>(entity =>
        {
            entity.ToTable("ContractDrafts");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Invitation)
                  .WithMany(i => i.ContractDrafts)
                  .HasForeignKey(e => e.InvitationId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.CreatedBy)
                  .WithMany(u => u.ContractDraftsCreated)
                  .HasForeignKey(e => e.CreatedById)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.ToTable("Contracts");
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.Project)
                  .WithMany(p => p.Contracts)
                  .HasForeignKey(e => e.ProjectId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Freelancer)
                  .WithMany(u => u.ContractsAsFreelancer)
                  .HasForeignKey(e => e.FreelancerId)
                  .OnDelete(DeleteBehavior.Restrict);
                  
            entity.HasOne(e => e.AcceptedDraft)
                  .WithMany()
                  .HasForeignKey(e => e.AcceptedDraftId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed Vietnamese Data
        var reactSkillId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var dotnetSkillId = Guid.Parse("22222222-2222-2222-2222-222222222222");

        modelBuilder.Entity<Skill>().HasData(
            new Skill { Id = reactSkillId, Name = "Phát triển ReactJS", Description = "Kỹ năng lập trình front-end với thư viện ReactJS.", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Skill { Id = dotnetSkillId, Name = "Lập trình C# .NET", Description = "Kỹ năng xây dựng ứng dụng với ngôn ngữ C# và nền tảng .NET.", IsActive = true, CreatedAt = DateTime.UtcNow }
        );

        modelBuilder.Entity<SkillTest>().HasData(
            new SkillTest 
            { 
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), 
                SkillId = reactSkillId, 
                Title = "Bài kiểm tra ReactJS cơ bản", 
                Version = "1.0", 
                PassingScore = 70, 
                TimeLimitMinutes = 30, 
                TasksJson = "[{\"question\":\"Hooks trong React là gì?\",\"options\":[\"Một tính năng mới trong React 16.8\",\"Một loại component\",\"Một phương thức của class\"],\"answer\":0}]", 
                Status = Domain.Enums.TestStatus.Active, 
                CreatedAt = DateTime.UtcNow 
            },
            new SkillTest 
            { 
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), 
                SkillId = dotnetSkillId, 
                Title = "Bài kiểm tra C# .NET", 
                Version = "1.0", 
                PassingScore = 80, 
                TimeLimitMinutes = 45, 
                TasksJson = "[{\"question\":\"Interface trong C# khác abstract class như thế nào?\",\"options\":[\"Interface không thể có field\",\"Interface không thể khai báo method\",\"Cả hai đều giống nhau\"],\"answer\":0}]", 
                Status = Domain.Enums.TestStatus.Active, 
                CreatedAt = DateTime.UtcNow 
            }
        );
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return base.SaveChangesAsync(cancellationToken);
    }
}

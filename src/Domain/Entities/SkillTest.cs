using Domain.Enums;

namespace Domain.Entities;

public class SkillTest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SkillId { get; set; }
    
    // Tên bài kiểm tra / Phiên bản
    public string Title { get; set; } = string.Empty;
    
    // Phiên bản bài kiểm tra
    public string Version { get; set; } = string.Empty;
    
    // Điểm tối thiểu để vượt qua bài kiểm tra
    public int PassingScore { get; set; }
    
    // Thời gian giới hạn (tính bằng phút)
    public int TimeLimitMinutes { get; set; }
    
    // Danh sách câu hỏi hoặc bài tập dạng JSON
    public string TasksJson { get; set; } = string.Empty;
    
    public TestStatus Status { get; set; } = TestStatus.Draft;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Skill Skill { get; set; } = null!;
    public ICollection<SkillTestAttempt> Attempts { get; set; } = new List<SkillTestAttempt>();
}

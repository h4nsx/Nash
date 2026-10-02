namespace Domain.Entities;

public class Skill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Tên kỹ năng (VD: C#, React)
    public string Name { get; set; } = string.Empty;
    
    // Mô tả ngắn
    public string Description { get; set; } = string.Empty;
    
    // Kỹ năng có đang hiển thị trên nền tảng hay không
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ICollection<SkillTest> Tests { get; set; } = new List<SkillTest>();
}

using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : Entity
{
    public string IdentityId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Role Role { get; set; }
    
    // Navigation properties
    public ICollection<SkillTestAttempt> Attempts { get; set; } = new List<SkillTestAttempt>();
    public ICollection<VerifiedSkill> VerifiedSkills { get; set; } = new List<VerifiedSkill>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    
    public FreelancerProfile? FreelancerProfile { get; set; }
    public ICollection<Match> Matches { get; set; } = new List<Match>();
    
    // Phase 5: Handshake Navigation
    public ICollection<Invitation> InvitationsReceived { get; set; } = new List<Invitation>();
    public ICollection<Invitation> InvitationsSent { get; set; } = new List<Invitation>();
    public ICollection<ContractDraft> ContractDraftsCreated { get; set; } = new List<ContractDraft>();
    public ICollection<Contract> ContractsAsFreelancer { get; set; } = new List<Contract>();
    
    // Phase 6: Work
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
    public ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
    
    // Phase 7: CMS
    public ICollection<Article> AuthoredArticles { get; set; } = new List<Article>();
}

# Domain Model

## Entities
User, FreelancerProfile, ClientProfile, Skill, SkillTest, SkillTestAttempt, VerifiedSkill, Project, ProjectSkillRequirement, Match, Invitation, ContractDraft, Contract, Milestone, Review, Media, CMS content, Notification, AuditLog.

## Key relations
```text
Skill → SkillTest → SkillTestAttempt → VerifiedSkill
Project → ProjectSkillRequirement → Match → Invitation → ContractDraft(versioned) → Contract → Milestone → Review
```

## State machines
- Project: DRAFT → PUBLISHED → IN_PROGRESS → COMPLETED; CLOSED/CANCELLED terminal alternatives.
- Attempt: NOT_STARTED → IN_PROGRESS → SUBMITTED → PASSED/FAILED.
- VerifiedSkill: PENDING → VERIFIED → EXPIRED/REVOKED where enabled.
- Match: GENERATED → RECOMMENDED → VIEWED/DISMISSED/EXPIRED.
- Invitation: DRAFT → SENT → VIEWED → ACCEPTED/COUNTERED/DECLINED/EXPIRED.
- ContractDraft: DRAFT → SENT → COUNTERED → ACCEPTED; versions immutable.
- Contract: ACTIVE → COMPLETED/CANCELLED.
- Milestone: PENDING → IN_PROGRESS → SUBMITTED → ACCEPTED; changes-requested loop allowed.

## Invariants
- Contract requires accepted draft.
- Expired invitation cannot be accepted.
- Historical draft versions are immutable.
- VerifiedSkill references its originating attempt/version.
- Match stores score version and explanations.
- Concurrent acceptance cannot create duplicate active contracts.

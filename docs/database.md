# Database

PostgreSQL is the primary relational store; EF Core manages mappings and migrations.

## Core tables
`users`, `freelancer_profiles`, `client_profiles`, `skills`, `skill_categories`, `skill_tests`, `skill_test_attempts`, `verified_skills`, `projects`, `project_skill_requirements`, `matches`, `invitations`, `contract_drafts`, `contracts`, `milestones`, `reviews`, `media`, `cms_pages`, `cms_posts`, `notifications`, `audit_logs`.

## Important constraints/indexes
- Unique skill slug.
- Active verified-skill uniqueness as product rules require.
- Match indexes by project/score/status and retain generation/score version.
- Invitation lookup by freelancer/client/status.
- Contract draft unique `(invitation_id, version)`.
- Milestone ordering unique per contract.
- Concurrency tokens for mutable workflow records.

Never calculate historical match scores from current profile data. Persist score, score version, reasons and generation timestamp; retain additional snapshot data when required for reproducibility.

Use migrations, review important generated SQL, preserve data and avoid destructive startup migrations. Soft delete only when justified.

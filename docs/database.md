# NASH Database Specification

## Database

PostgreSQL is the primary relational database.

ORM:
**Entity Framework Core**

Migration strategy:
- code-first migrations
- migration files committed to source control
- production migrations executed deliberately during deployment

## Core Tables

```text
users
freelancer_profiles
client_profiles
projects
proposals
contracts
milestones
reviews
categories
skills
freelancer_skills
portfolio_items
media_assets
cms_contents
seo_metadata
reports
refresh_tokens
```

## General Rules

- use UUIDs or another consistent non-sequential public identifier strategy
- every table should have `created_at` and `updated_at` where applicable
- use UTC timestamps
- use foreign keys
- use unique constraints for business uniqueness
- add indexes based on query patterns
- avoid storing derived values unless justified
- use transactions for multi-entity workflows
- never expose database entities directly from API endpoints

## Important Constraints

### Users
- email unique
- normalized email for uniqueness checks

### Projects
- slug unique among public projects
- client_id foreign key to users
- category_id foreign key to categories

### Proposals
- project_id + freelancer_id unique for active/accepted proposal semantics
- project_id indexed
- freelancer_id indexed
- status indexed if frequently filtered

### Contracts
- accepted proposal should map to one contract
- project_id indexed
- client_id indexed
- freelancer_id indexed

### Skills
- skill name unique

## Soft Delete

Use soft deletion only where business recovery/audit value exists.

Do not blindly add soft delete to every table.

## Concurrency

Use optimistic concurrency for entities where simultaneous edits matter.

Important workflows such as proposal acceptance must execute inside a transaction and protect against duplicate acceptance.

## Performance

Start with:
- proper indexes
- pagination
- projection queries
- connection pooling
- avoiding N+1 queries
- query profiling

Do not introduce sharding or database partitioning prematurely.

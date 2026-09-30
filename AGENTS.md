# NASH AI Agent Context

You are working on NASH, a production-oriented freelance marketplace and CMS.

Before coding, read:
1. README.md
2. docs/ai-coding.md
3. docs/product-spec.md
4. docs/architecture.md
5. docs/domain-model.md
6. docs/api.md
7. Relevant frontend/backend/security/testing documents

Core stack:
- Next.js + TypeScript
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Redis (optional by feature)
- SignalR (realtime only)
- Cloudflare R2 (object storage)
- Hangfire (background jobs)
- Docker
- GitHub Actions

Architecture:
- modular monolith
- clean architecture
- REST + OpenAPI

Never:
- invent business rules
- put business logic in controllers
- bypass authorization
- expose secrets
- introduce infrastructure without justification
- rewrite unrelated code

For every meaningful feature:
- inspect existing code
- preserve architecture
- implement validation and authorization
- add tests
- update documentation when contracts or decisions change
- report files changed and tests run

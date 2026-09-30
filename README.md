# NASH — Network · Ability · Skills · Human

NASH is a production-oriented freelance marketplace and content management platform connecting clients and freelancers across the project lifecycle.

## Engineering Goal

NASH is intentionally scoped as a **modular monolith** with enterprise-style engineering practices:

- maintainable architecture
- secure authentication and authorization
- relational data modeling
- CMS and SEO
- automated testing
- Docker-based development
- CI/CD
- deployment and observability
- documentation suitable for AI-assisted / vibe coding

The project should demonstrate engineering depth rather than attempt to reproduce the full feature set of a platform such as Upwork.

## Core Workflow

Client → Project → Proposal → Selection → Contract → Milestones → Completion → Review

## Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

### Backend
- ASP.NET Core Web API (.NET)
- Clean Architecture
- Modular Monolith
- Entity Framework Core
- REST
- OpenAPI / Swagger
- ASP.NET Core Identity
- JWT
- RBAC + resource-based authorization

### Data / Infrastructure
- PostgreSQL
- Redis
- Cloudflare R2
- Hangfire
- Docker / Docker Compose
- GitHub Actions
- Cloudflare

### Quality / Observability
- xUnit
- ASP.NET Core integration tests
- Playwright
- ESLint
- Prettier
- EditorConfig
- .NET analyzers
- Serilog
- OpenTelemetry
- Sentry

## Documentation

| Document | Purpose |
|---|---|
| `docs/product-spec.md` | Product scope and requirements |
| `docs/architecture.md` | System and backend architecture |
| `docs/domain-model.md` | Domain entities and business rules |
| `docs/database.md` | PostgreSQL schema and data rules |
| `docs/api.md` | REST API contract |
| `docs/frontend.md` | Next.js architecture and conventions |
| `docs/backend.md` | .NET architecture and coding conventions |
| `docs/auth-security.md` | Authentication and security rules |
| `docs/cms-seo.md` | CMS and SEO requirements |
| `docs/testing.md` | Testing strategy |
| `docs/development.md` | Local development workflow |
| `docs/deployment.md` | Deployment and production workflow |
| `docs/operations.md` | Logging, monitoring, backups and incidents |
| `docs/ai-coding.md` | Rules for AI/vibe coding |
| `docs/roadmap.md` | Implementation phases |
| `docs/decisions.md` | Architectural decision index |
| `docs/adr/*` | Individual architecture decisions |

## Source of Truth

When implementation and documentation disagree, update the documentation first if the decision is intentional. AI-generated code must follow these documents rather than inventing a new architecture.

## Scope Rule

Do not introduce microservices, Kubernetes, Kafka, Elasticsearch, GraphQL, or other infrastructure unless a documented requirement and ADR justify it.

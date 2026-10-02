# NASH Technical Documentation

NASH is a freelance marketplace built around **Verified Skills, Explainable Smart Match, and Direct Handshake**.

Core workflow: `Profile → Skill Verification → Job → Smart Match → Top 3 → Direct Invite → Contract Draft → Accept/Counter → Contract → Milestones → Review`.

This repository is the source of truth for implementation and AI/vibe coding.

## Stack
- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query + React Hook Form + Zod
- ASP.NET Core Web API (.NET)
- Clean Architecture + Modular Monolith
- EF Core + PostgreSQL
- ASP.NET Identity + JWT
- RBAC + Resource-based Authorization
- REST + OpenAPI/Swagger
- Redis + SignalR + Hangfire

- xUnit + Integration Testing + Playwright
- ESLint + Prettier + EditorConfig + .NET Analyzers
- Docker + Docker Compose + GitHub Actions
- Serilog + OpenTelemetry + Sentry
- Vercel + .NET cloud hosting + Managed PostgreSQL + Cloudflare

## Docs
- product-spec.md — product requirements
- architecture.md — system architecture
- domain-model.md — entities/state machines
- database.md — PostgreSQL/EF Core
- api.md — REST contract
- matching-engine.md — Smart Match contract
- skill-verification.md — tests/badges
- contract-workflow.md — invitation/contract versioning
- frontend.md / backend.md — implementation conventions
- auth-security.md — security
- cms-seo.md — CMS/SEO
- testing.md — testing strategy
- development.md / deployment.md / operations.md — engineering operations
- ai-coding.md / ai-prompts.md — AI workflow
- roadmap.md — implementation phases
- definition-of-done.md — completion checklist
- decisions.md + adr/ — architecture decisions

## Source of truth
Priority: explicit task → product spec → domain contracts → ADRs → API/database contracts → code conventions. Never invent business rules.

## Scope
Start as a modular monolith. Do not add microservices, Kafka, Kubernetes, Elasticsearch, GraphQL or service mesh without a concrete requirement and ADR.

# Architecture

NASH uses a **Modular Monolith + Clean Architecture**.

```text
NASH.Api → NASH.Application → NASH.Domain
                         ↑
                 NASH.Infrastructure
```

Modules: Auth, Users, Freelancers, Clients, Skills, SkillVerification, Projects, Matching, Invitations, Contracts, Milestones, Reviews, Media, CMS, Reports, Admin, Notifications.

Request flow: Next.js → HTTPS → ASP.NET Core → Application use case → Domain rules → EF Core/Redis/R2/Hangfire → infrastructure.

Smart Match: Publish → candidate retrieval → eligibility → feature calculation → weighted score → explanations → deterministic ranking → Top 3 → snapshot.

Contract acceptance must validate current version/state, authorization and expiry, then atomically activate the contract.

Keep API stateless; persistent state lives in PostgreSQL/Redis/R2. Use transactions, optimistic concurrency and unique constraints for stateful workflows.

Hangfire: notifications, matching refresh, expiry cleanup, media jobs. SignalR: chat/notifications/presence only.

Storage abstraction: `IStorageService` with local provider for development and R2 for production.

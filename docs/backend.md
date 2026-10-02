# Backend

Projects: `NASH.Api`, `NASH.Application`, `NASH.Domain`, `NASH.Infrastructure`.

Controllers/endpoints stay thin. Application layer owns use cases; domain owns business invariants; infrastructure implements persistence/integrations.

Use EF Core Fluent configurations, migrations, projections, concurrency tokens and DTOs. Do not expose EF entities directly as public API models.

Authorization combines roles with resource ownership. Redis is for cache/transient infrastructure, PostgreSQL is authoritative business state. Hangfire jobs should be retry-safe/idempotent.

Use consistent Problem Details-style errors and centralized exception handling.

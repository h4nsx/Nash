# NASH Backend Engineering Guide

## Stack

- ASP.NET Core Web API
- C#
- Entity Framework Core
- PostgreSQL
- ASP.NET Core Identity
- JWT
- Redis
- Hangfire
- SignalR

## Project Structure

```text
src/
├── NASH.Api/
├── NASH.Application/
├── NASH.Domain/
└── NASH.Infrastructure/

tests/
├── NASH.UnitTests/
└── NASH.IntegrationTests/
```

## Domain

Entities and business rules belong in Domain.

Avoid:
- EF Core-specific behavior in domain entities where it creates coupling
- HTTP concerns
- database queries
- UI logic

## Application

Application services/use cases should:
- validate business operations
- coordinate domain behavior
- invoke repositories/data access abstractions where appropriate
- return DTOs/results

## Infrastructure

Infrastructure owns:
- EF Core DbContext
- database configuration
- Identity persistence
- Redis
- R2 integration
- Hangfire
- email/external services

## API

Controllers should remain thin.

Bad:

```text
Controller → 300 lines of business logic
```

Preferred:

```text
Controller
  → Application use case
      → Domain
      → Infrastructure
```

## Dependency Injection

Dependencies must flow inward.

Use interfaces at boundaries where they improve testability or isolate infrastructure.

## DTOs

Never expose EF Core entities directly through API responses.

Use:
- request DTOs
- response DTOs
- explicit mappings

## Exceptions

Use domain/application exceptions for predictable business failures.

Unexpected exceptions should be handled by global middleware and logged with correlation/request IDs.

## Logging

Use structured logs.

Avoid:

```text
"Something went wrong"
```

Prefer structured context:

```text
ProjectProposalRejected
projectId
proposalId
userId
requestId
```

Never log passwords, tokens, secrets, or sensitive credentials.

## Database Access

Prefer:
- projection
- pagination
- async operations
- explicit includes only when required
- transaction boundaries around business workflows

Avoid N+1 queries.

## API Design

Use REST resources and explicit action endpoints only for domain operations that are not naturally represented as CRUD.

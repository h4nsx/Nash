# NASH AI / Vibe Coding Rules

This document is the primary instruction set for AI coding agents working on NASH.

## 1. Priority

Follow this order:

1. User's explicit task
2. Product requirements
3. Architecture document
4. Domain rules
5. API contract
6. Security rules
7. Existing code conventions
8. Personal implementation preference

Do not silently override higher-priority requirements.

## 2. Never Invent Architecture

Before adding:
- a new library
- a new infrastructure service
- a new database
- a new API pattern
- a new authentication mechanism
- a new architectural layer

check the existing documentation.

If the change is significant, propose an ADR before implementation.

## 3. Preserve Boundaries

Backend:

```text
Api → Application → Domain
Infrastructure → Application/Domain
```

Do not put business logic in controllers.

Do not make Domain depend on Infrastructure.

Frontend should keep API communication in a dedicated API layer.

## 4. Small Changes

When implementing a feature:

1. inspect existing code
2. identify affected modules
3. update domain/API contracts if needed
4. implement backend
5. implement frontend
6. add tests
7. update docs
8. report files changed

Do not rewrite unrelated code.

## 5. Database Safety

Before changing schema:
- identify existing migrations
- check relationships
- consider existing data
- create a migration
- update database documentation

Never drop or reset production data.

## 6. Security

Assume all client input is untrusted.

Always verify:
- authentication
- authorization
- ownership
- validation
- file permissions

Never expose:
- secrets
- password hashes
- internal exceptions
- private media
- unrestricted admin APIs

## 7. API Consistency

Follow `/api/v1`.

Use existing:
- status codes
- error shape
- pagination
- naming
- authentication conventions

Do not create one-off response formats.

## 8. Frontend Consistency

Reuse:
- existing UI components
- existing API client
- existing form patterns
- existing query keys
- existing error handling

Do not introduce a second state-management library without an ADR.

## 9. Testing

Every meaningful feature should include tests.

At minimum:
- domain/application unit tests for business rules
- integration tests for important API behavior
- E2E coverage for critical user journeys

## 10. Definition of Done

A task is complete only when:
- implementation works
- validation exists
- authorization exists
- errors are handled
- tests are added/updated
- lint/type/build passes
- docs are updated when necessary

## 11. AI Response Format

For implementation tasks, the AI should report:

```text
## Changes
- ...

## Files
- ...

## API / DB Changes
- ...

## Tests
- ...

## Notes
- ...
```

## 12. Avoid Overengineering

Do not introduce:
- microservices
- Kubernetes
- Kafka
- Elasticsearch
- GraphQL
- event sourcing
- CQRS infrastructure
- service mesh

unless the product requirements create a concrete need and an ADR approves the change.

## 13. When Uncertain

Do not fabricate missing business rules.

If a decision materially affects data, security, API behavior, or architecture:
- identify the ambiguity
- choose the safest minimal behavior if implementation must continue
- record the assumption
- ask for confirmation when needed

## 14. Documentation Is Code

If implementation changes:
- architecture
- API
- database
- security
- deployment

update the corresponding documentation in the same change.

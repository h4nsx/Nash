# NASH AI Prompt Pack

These prompts are intended to be used with an AI coding agent after the repository has been initialized.

## 1. Repository Initialization

> Read `README.md` and all documents under `docs/`. Initialize the NASH repository according to the documented architecture. Do not introduce technologies not listed in the architecture. Create the smallest working foundation for Next.js, ASP.NET Core, PostgreSQL and Docker Compose. Stop after the foundation is buildable and explain the files created.

## 2. Implement a Feature

> Read `docs/product-spec.md`, `docs/domain-model.md`, `docs/api.md`, `docs/backend.md`, `docs/frontend.md`, `docs/ai-coding.md`. Implement [FEATURE]. First identify affected modules and contracts. Then implement backend, database changes, frontend, validation, authorization and tests. Do not change unrelated code. Report changes, files, tests and assumptions.

## 3. Review

> Review the current implementation against all documents in `docs/`. Find violations of architecture, security, API consistency, domain rules and testing requirements. Do not refactor unrelated code. Return findings grouped by severity and propose minimal fixes.

## 4. Security Review

> Audit [FEATURE/AREA] against `docs/auth-security.md`. Check authentication, authorization, ownership, input validation, rate limiting, secrets, file handling, error leakage and logging. Identify concrete vulnerabilities and fixes.

## 5. Database Change

> I need to change the data model for [CHANGE]. Read `docs/database.md` and `docs/domain-model.md`. Propose the minimal schema change, migration impact, indexes, constraints and affected APIs. Do not implement until the migration plan is clear.

## 6. Testing

> Read `docs/testing.md`. Identify missing unit, integration and E2E coverage for [FEATURE]. Implement the highest-value tests without changing production behavior.

## 7. Refactor

> Refactor [AREA] to comply with `docs/backend.md` / `docs/frontend.md`. Preserve behavior and API compatibility. Do not introduce a new library or architectural pattern.

## 8. Documentation Sync

> Compare the implementation with `docs/`. Identify documentation that is now stale because of the latest code changes. Update only the affected documentation.

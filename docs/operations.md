# NASH Operations

## Logging

Use structured logging with:
- timestamp
- level
- requestId/correlationId
- userId where appropriate
- endpoint
- duration
- outcome

Never log secrets.

## Metrics

Track:
- request count
- latency
- error rate
- database latency
- background job failures
- cache hit/miss where useful

## Tracing

Use OpenTelemetry for distributed traces when multiple external components justify it.

## Error Monitoring

Sentry can collect application exceptions and frontend errors.

## Backups

PostgreSQL production backups must be enabled by the hosting provider or backup system.

Test restoration periodically.

## Background Jobs

Hangfire jobs should be:
- idempotent where possible
- retryable
- observable
- safe to execute more than once

Examples:
- notification dispatch
- email
- media cleanup
- scheduled CMS tasks

## Incident Checklist

1. Identify affected component.
2. Check health endpoint.
3. Check recent deployments.
4. Inspect logs/traces.
5. Check database/Redis health.
6. Mitigate.
7. Restore service.
8. Record root cause and prevention.

## Operational Principle

Do not add infrastructure merely because it exists.

Every operational component should have a clear problem it solves.

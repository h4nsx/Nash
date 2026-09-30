# NASH Deployment

## Deployment Model

```text
                         Internet
                            │
                       Cloudflare
                       /        \
                      /          \
                 Next.js        API
                  Vercel      .NET Host
                                  │
                       ┌──────────┼──────────┐
                       ▼          ▼          ▼
                   PostgreSQL   Redis       R2
```

The exact hosting providers may change. Infrastructure choices should be documented in deployment configuration rather than hard-coded into application design.

## Environments

### Development
Local machine.

### Staging
Used for integration testing and demo validation.

### Production
Stable public deployment.

## CI Pipeline

On pull request:

```text
checkout
→ install
→ lint
→ typecheck
→ unit tests
→ integration tests
→ frontend build
→ backend build
```

## CD Pipeline

On protected branch:

```text
build
→ test
→ package
→ deploy
→ health check
→ smoke test
```

## Database Migrations

Migrations must be:
- reviewed
- backward-conscious
- tested
- applied in controlled deployment steps

Avoid destructive schema changes without migration planning.

## Health Checks

Provide:
```text
/health
/health/ready
```

Readiness should verify required dependencies where appropriate.

## Demo / Presentation

For local presentation, the application can be exposed through a secure tunnel such as Cloudflare Tunnel instead of publicly exposing PostgreSQL or Redis.

Only HTTP/HTTPS application traffic should be public.

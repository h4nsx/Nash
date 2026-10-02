# Development

Prerequisites: Node.js, package manager, .NET SDK, Docker, Git.

Keep local infra light: PostgreSQL and Redis via Docker Compose. Use local filesystem for development storage; R2 in production. Do not run unnecessary services.

Typical env categories: database, JWT, Redis, R2, Sentry. Never commit real values.

Flow: read docs → domain contract → API contract → backend → frontend → tests → docs.

Use small conventional commits (`feat`, `fix`, `test`, `docs`, `refactor`, `chore`). For demos, use Cloudflare Tunnel; never expose PostgreSQL/Redis directly.

# Deployment

Target: Cloudflare → Next.js/Vercel → ASP.NET Core → Managed PostgreSQL/Redis/R2/Hangfire.

Backend exposes `/health` and `/ready`. Production PostgreSQL uses backups, TLS, connection limits and monitoring. R2 private objects require controlled access/signed URLs.

GitHub Actions: PR → lint/test/build/integration tests; main → build/test/deploy. Migrations are explicit release steps, not blind destructive startup actions.

Use Development/Staging/Production separation. For local presentations: laptop → Cloudflare Tunnel → public HTTPS application only.

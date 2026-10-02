# Authentication and Security

ASP.NET Identity manages users/passwords/roles; JWT may authenticate API requests. Use RBAC plus resource-based authorization.

Server must enforce ownership, state transitions, invitation recipient checks, expiry, contract version and skill-attempt ownership.

Use HTTPS, strict CORS, rate limiting, validation, secure headers and safe file-upload policies. Never log passwords, tokens or unnecessary contract-sensitive data.

Skill tests require server-side scoring and locked submission. Contract acceptance requires current-version/state validation and transaction/concurrency protection.

Secrets live in environment/secret management, never source control. Audit role changes, verification, invitations, contracts and admin actions.

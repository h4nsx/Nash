# NASH Authentication & Security

## Authentication

Use ASP.NET Core Identity for account management.

Use short-lived access authentication plus refresh-token/session renewal.

Security requirements:
- strong password hashing
- secure token handling
- token rotation/revocation strategy
- logout invalidation
- account status checks

## Authorization

Use two levels:

### Role-Based
Roles:
- CLIENT
- FREELANCER
- ADMIN

### Resource-Based
Examples:
- client can edit only own project
- freelancer can edit only own profile
- client can review proposals only for own projects
- admin can manage administrative resources

Never trust the role or ownership supplied by the client.

## Input Validation

Validate:
- body
- route parameters
- query parameters
- file metadata
- content length

## Rate Limiting

Rate-limit sensitive endpoints:
- login
- registration
- password-related operations
- proposal submission
- report submission
- upload initialization

## CORS

Allow only configured frontend origins.

Never use unrestricted production CORS unless explicitly justified.

## Cookies / Tokens

If using cookies:
- HttpOnly
- Secure
- SameSite configured appropriately

If using Authorization headers:
- never store long-lived credentials in unsafe browser storage

Follow one documented authentication strategy consistently.

## File Upload Security

Validate:
- size
- extension
- MIME type
- object key/path
- ownership

Do not trust the original filename.

Use random object keys.

For public media, store only safe metadata and generated URLs.

## Secrets

Never commit:
- database passwords
- JWT secrets
- API keys
- R2 credentials
- Sentry credentials

Use environment variables or secret managers.

## Security Headers

Configure appropriate:
- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- frame protections
- HSTS in HTTPS production environments

## Production Rule

A UI restriction is not authorization.

Every sensitive operation must be authorized on the server.

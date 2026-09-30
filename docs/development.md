# NASH Local Development

## Prerequisites

- Node.js LTS
- .NET SDK LTS
- Docker
- Docker Compose
- Git
- PostgreSQL client/tooling

## Repository

```text
nash/
├── apps/
│   └── web/
├── src/
│   ├── NASH.Api/
│   ├── NASH.Application/
│   ├── NASH.Domain/
│   └── NASH.Infrastructure/
├── tests/
├── docs/
├── docker-compose.yml
└── README.md
```

## Local Services

Docker Compose should initially run only infrastructure:

```text
PostgreSQL
Redis
```

Do not add heavy infrastructure without a requirement.

## Environment Variables

Frontend:

```env
NEXT_PUBLIC_API_URL=
```

Backend:

```env
ConnectionStrings__Default=
Jwt__Issuer=
Jwt__Audience=
Jwt__Secret=
Redis__Connection=
R2__Endpoint=
R2__AccessKey=
R2__SecretKey=
R2__Bucket=
Sentry__Dsn=
```

Use `.env.example` with placeholders.

## Startup

Suggested:

```bash
docker compose up -d
dotnet restore
dotnet ef database update
dotnet run --project src/NASH.Api
npm install
npm run dev
```

## Git Workflow

Suggested branches:

```text
main
develop
feature/*
fix/*
chore/*
```

Pull requests should include:
- summary
- implementation notes
- tests
- screenshots for UI changes
- migration notes when database changes exist

## Commit Style

Use conventional commits:

```text
feat:
fix:
refactor:
test:
docs:
chore:
build:
ci:
```

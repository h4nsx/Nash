# NASH REST API Contract

Base URL:

```text
/api/v1
```

## Conventions

- JSON request/response
- REST-oriented resource naming
- plural resource paths
- pagination for collections
- filtering through query parameters
- consistent error responses
- authenticated endpoints require bearer/session authentication
- OpenAPI is the authoritative machine-readable API contract

## Resources

### Auth

```text
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

### Projects

```text
GET    /projects
POST   /projects
GET    /projects/{id}
PATCH  /projects/{id}
DELETE /projects/{id}
POST   /projects/{id}/publish
POST   /projects/{id}/close
```

### Proposals

```text
GET    /projects/{projectId}/proposals
POST   /projects/{projectId}/proposals
GET    /proposals/{id}
POST   /proposals/{id}/withdraw
POST   /proposals/{id}/accept
POST   /proposals/{id}/reject
```

### Contracts

```text
GET    /contracts
GET    /contracts/{id}
POST   /contracts/{id}/complete
POST   /contracts/{id}/cancel
```

### Milestones

```text
POST   /contracts/{contractId}/milestones
PATCH  /milestones/{id}
POST   /milestones/{id}/submit
POST   /milestones/{id}/approve
POST   /milestones/{id}/reject
```

### Freelancer

```text
GET    /freelancers
GET    /freelancers/{username}
PATCH  /freelancers/me
GET    /freelancers/me/portfolio
POST   /freelancers/me/portfolio
```

### CMS / Admin

```text
GET    /admin/users
GET    /admin/projects
GET    /admin/reports
GET    /admin/reviews
CRUD   /admin/categories
CRUD   /admin/skills
CRUD   /admin/content
CRUD   /admin/media
```

## Pagination

Use:

```text
?page=1&pageSize=20
```

Response:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

For high-volume endpoints, cursor pagination may be introduced later.

## Validation

Return validation errors using a predictable structure:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "One or more fields are invalid.",
  "errors": {
    "title": ["Title is required."]
  },
  "requestId": "..."
}
```

## HTTP Semantics

- `200` successful read/update
- `201` successful creation
- `204` successful deletion/action with no body
- `400` invalid request
- `401` unauthenticated
- `403` unauthorized
- `404` resource not found
- `409` business conflict
- `422` semantically invalid operation when appropriate
- `429` rate limited
- `500` unexpected server error

## Versioning

Public API routes use `/api/v1`.

Breaking API changes require a new version or a documented migration strategy.

# REST API Contract

Base: `/api/v1`.

## Auth
`POST /auth/register`, `/login`, `/refresh`, `/logout`; `GET /auth/me`.

## Profiles/skills
`GET/PATCH /freelancers/{id}`, `PATCH /freelancers/me`; `GET/PATCH /clients/...`; `GET /skills`; `PUT /freelancers/me/skills`.

## Skill verification
`GET /skill-tests`; `GET /skill-tests/{id}`; `POST /skill-tests/{id}/attempts`; `GET /skill-test-attempts/{id}`; `POST /skill-test-attempts/{id}/submit`; `GET /freelancers/me/verified-skills`.

## Projects
`POST/GET /projects`; `GET/PATCH /projects/{id}`; `POST /projects/{id}/publish`; `POST /projects/{id}/close`.

## Matching
`POST /projects/{id}/match`; `GET /projects/{id}/matches`; `GET /projects/{id}/matches/{matchId}`; `POST .../dismiss`. Response includes score, scoreVersion, reasons, generatedAt, status.

## Invitations
`POST /projects/{id}/invitations`; `GET /clients/me/invitations`; `GET /freelancers/me/invitations`; `GET /invitations/{id}`; `POST /invitations/{id}/view|accept|decline|counter`.

## Contracts
`GET/POST /invitations/{id}/contract-draft`; `POST /contract-drafts/{id}/counter`; `GET /contract-drafts/{id}/versions`; `GET /contracts/{id}`; `POST /contracts/{id}/cancel`.

## Milestones/reviews
Milestone CRUD + submit/accept/request-changes. `POST/GET /contracts/{id}/reviews`.

## Errors
Use Problem Details-style JSON and HTTP 409 for state/concurrency conflicts.

Validate request shape, authorization, ownership and domain state on the server. Consider idempotency keys for invitation creation, acceptance and submissions.

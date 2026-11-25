# REST API Contract

Base: `/api/v1`.

## Auth
`POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/change-password`; `GET /auth/me`.

## Profiles/skills
`GET/PATCH /freelancers/{id}`, `PATCH /freelancers/me`; `GET/PATCH /clients/...`; `GET /skills`; `PUT /freelancers/me/skills`.

## Skill verification
`GET /skill-tests`; `GET /skill-tests/{id}`; `POST /skill-tests/{id}/attempts`; `GET /skill-test-attempts/{id}`; `POST /skill-test-attempts/{id}/submit`; `GET /freelancers/me/verified-skills`.

## Projects
`POST/GET /projects`; `GET /projects/my-projects`; `GET/PUT /projects/{id}`; `POST /projects/{id}/skills`; `DELETE /projects/{id}/skills/{requirementId}`; `POST /projects/{id}/publish`; `POST /projects/{id}/close`.

## Matching
`POST /projects/{id}/matches/generate`; `GET /projects/{id}/matches`; `PUT /projects/matches/{matchId}/status`. Response includes `id`, `projectId`, `freelancerId`, `freelancerName`, `score`, `matchVersion`, `reasons`, `status`.

## Invitations
`POST /handshake/invitations`; `GET /handshake/invitations`; `GET /handshake/invitations/{id}`; `POST /handshake/invitations/{id}/accept|decline|counter`.

## Contracts & Work
`GET /work/contracts`; `GET /work/contracts/{id}`; `POST /work/contracts/{id}/complete`; `POST /work/contracts/{id}/cancel`.

## Milestones/reviews/notifications
`GET/POST /work/contracts/{contractId}/milestones`; `POST /work/milestones/{id}/submit|accept|request-changes`; `POST /work/contracts/{id}/reviews`; `GET /notifications`; `PUT /notifications/{id}/read`.

## Errors
Use Problem Details-style JSON and HTTP 409 for state/concurrency conflicts.

Validate request shape, authorization, ownership and domain state on the server. Consider idempotency keys for invitation creation, acceptance and submissions.

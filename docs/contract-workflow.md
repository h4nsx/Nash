# Contract Workflow

## Invitation
`DRAFT → SENT → VIEWED → ACCEPTED/COUNTERED/DECLINED/EXPIRED`. It references project, client, freelancer, match, current draft and expiry.

## Draft versioning
Every counter creates a new immutable version. Example: v1 dates Oct 10–Nov 10; counter creates v2 dates Oct 12–Nov 12.

## Acceptance
Show current budget, dates, milestones and material terms. Require explicit confirmation.

## Transaction
Validate actor, current version, invitation state and expiry; accept draft; create/activate contract; mark invitation accepted; write audit event; enqueue notifications.

## Concurrency
Use transaction + state checks + concurrency token/unique constraints so two acceptance requests cannot create duplicate contracts.

## Expiry
Enforce at action time; Hangfire may proactively mark expired records but is not authoritative.

## Completion
`ACTIVE → all milestones accepted → COMPLETED → reviews available`.

Contract templates are product features and should receive jurisdiction-specific legal review before production use.

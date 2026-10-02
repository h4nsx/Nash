# Skill Verification

A Verified Skill is evidence produced by a versioned standardized assessment.

Test fields: skill, version, passing score, time limit, tasks/questions, status. Once attempts exist, a test version is immutable.

Attempt: `NOT_STARTED → IN_PROGRESS → SUBMITTED → PASSED/FAILED`. Submitted attempts cannot be edited.

VerifiedSkill stores freelancer, skill, source attempt, test version, status, verifiedAt and optional expiry/revocation.

MVP security: server-side scoring, ownership checks, submission lock, time validation, rate limiting and audit logs.

Matching reads verification state, not raw answers.

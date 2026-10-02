# Testing

## Unit
Test match scoring, eligibility, explanations, skill verification and state transitions.

## Matching cases
Exact/partial skills, missing mandatory skill, verified/unverified, budget mismatch, availability conflict, ties, fewer than 3 candidates, score-version changes.

## Contract cases
Invite, view, accept, decline, counter/versioning, expiry, ownership, concurrent acceptance, contract activation.

## Integration
PostgreSQL mappings, transactions, authorization, Redis/Hangfire where used.

## Playwright E2E
1. Profile → skill test → verified badge.
2. Client creates project → publishes → sees Top 3 → invites.
3. Freelancer receives invite → counters → client accepts → contract active.
4. Milestone submit → accept → contract completion → review.

Every production bug should gain a regression test where practical.

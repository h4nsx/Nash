# Product Specification

## Goal
Reduce low-signal proposal spam and shorten the path from a client requirement to an accepted contract through verified capabilities and explainable matching.

## Roles
**Freelancer:** profile, skills, tests, verified badges, matches, invitations, counter offers, milestones, reviews.

**Client:** profile, jobs, requirements, Top 3 matches, match explanations, invitations, contracts, milestones, reviews.

**Admin:** users, skills, tests, moderation, CMS, reports, platform configuration.

## Core workflow
`Freelancer Profile → Verified Skill → Job Published → Smart Match → Top 3 → Direct Invite → Contract Draft → Accept/Counter → Contract → Milestones → Delivery → Review`

## Smart Match
MVP is deterministic and explainable. Default weights: Skill Match 40%, Verified Skills 25%, Experience 15%, Budget Fit 10%, Availability 10%. Eligibility filters run before scoring. A candidate failing a mandatory requirement is not recommended. Return up to 3 eligible candidates and structured reasons.

Example reasons: Python — Required; Python verified; 3+ years relevant experience; budget fits; available for dates.

## Skill verification
`Test Available → Attempt Started → Submitted → Passed/Failed → Verified Skill`. Tests are versioned; historical attempts keep their test version.

## Invitation/contract
Invitation: `DRAFT → SENT → VIEWED → ACCEPTED/COUNTERED/DECLINED/EXPIRED`. Contract drafts are immutable versions. Counter offers create a new version. Before acceptance, show budget, dates, milestones and material terms and require explicit confirmation.

## Milestones
`PENDING → IN_PROGRESS → SUBMITTED → ACCEPTED`; `SUBMITTED → CHANGES_REQUESTED → IN_PROGRESS` is allowed.

## Reviews
After contract completion, both parties may review each other according to product rules.

## CMS/SEO
Pages, articles, categories, skills, media and SEO metadata.

## MVP non-goals
Payment escrow, complex tax/invoicing, black-box AI matching, microservices, full realtime collaboration.

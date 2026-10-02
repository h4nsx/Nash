# AI Coding Rules

Priority: explicit task → product spec → domain contracts → architecture → security → API/database contracts → code conventions.

Never invent business rules. If ambiguity affects money, authorization, contracts or irreversible state, ask or document a safe assumption.

Preserve Clean Architecture/module boundaries. Keep controllers thin and domain independent from EF/Redis/R2.

Matching: no hidden ML, no random ranking, mandatory eligibility before scoring, score versioning, explanations and snapshots.

Contracts: no mutation of historical drafts, no accepting expired invitations, no trusting client state, no duplicate contracts under concurrency, explicit material-term confirmation.

Every business-rule change needs tests and relevant documentation. Avoid unrelated refactors and heavy infrastructure without an ADR.

AI response before coding: goal, modules, files, assumptions, plan. After: changes, tests, docs, risks.

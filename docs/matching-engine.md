# Smart Match Engine

## Pipeline
`Project Requirements → Candidate Retrieval → Eligibility → Features → Weighted Score → Reasons → Stable Tie-break → Top 3 → Snapshot`.

## Eligibility
Active account/profile, sufficient data, no suspension/block, mandatory requirements satisfied, no explicit availability conflict. Eligibility is a hard filter.

## Score v1
`Skill Match 40% + Verified Skills 25% + Experience 15% + Budget Fit 10% + Availability 10% = 100%`. Weights are configuration.

## Explainability
Persist stable reason codes such as `required_skill`, `verified_skill`, `experience`, `budget_fit`, `availability`. Never expose only an opaque score.

## Ranking
Tie-break: higher score → mandatory skill coverage → verified coverage → availability fit → stable candidate ID. No randomness.

## Top 3
Return up to 3 eligible candidates. Never manufacture candidates to fill the list.

## Versioning
Example `match-v1`; material scoring changes create `match-v2`. Historical snapshots remain reproducible.

## Recalculation
Allowed after requirement/profile/verification changes, expiry or explicit refresh. Do not silently overwrite historical reviewed/accepted snapshots.

MVP is deterministic, not ML. ML requires training/evaluation data, measurable metrics, explainability and a new ADR.

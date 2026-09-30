# ADR-004 — PostgreSQL

## Status
Accepted

## Context
NASH has highly relational entities: users, projects, proposals, contracts, milestones, reviews, skills and categories.

## Decision
Use PostgreSQL with Entity Framework Core.

## Consequences
- relational integrity
- transactions
- indexing
- mature SQL capabilities
- straightforward scaling path

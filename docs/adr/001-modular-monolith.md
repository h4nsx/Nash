# ADR-001 — Modular Monolith

## Status
Accepted

## Context
NASH has several business domains but does not initially require independent service deployment.

## Decision
Use one ASP.NET Core deployable application with strong module boundaries.

## Consequences
Positive:
- simpler deployment
- easier local development
- lower operational cost
- clear domain boundaries
- future extraction remains possible

Negative:
- modules share deployment lifecycle
- boundaries must be enforced through code conventions

## Rejected
Microservices at project start because operational complexity is not justified.

# ADR-008 — Redis as Optional Infrastructure

## Status
Accepted

## Decision
Redis is available for caching and infrastructure needs, but is not required by the core domain.

## Rule
Do not make basic marketplace workflows depend on Redis unless there is a concrete requirement.

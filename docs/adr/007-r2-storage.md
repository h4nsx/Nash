# ADR-007 — Cloudflare R2 for Object Storage

## Status
Accepted

## Context
NASH needs external object storage for portfolio media and attachments without depending on local disk.

## Decision
Use an object-storage abstraction with Cloudflare R2 as the production provider.

## Design
Application code talks to a storage interface rather than R2 directly.

Possible providers:
- local filesystem for development
- R2 for production

## Consequence
Storage can be replaced without rewriting business logic.

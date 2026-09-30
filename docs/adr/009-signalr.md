# ADR-009 — SignalR for Realtime

## Status
Accepted

## Decision
Use SignalR only for realtime features such as chat and notifications.

## Rule
Normal CRUD and workflow operations remain REST APIs.

## Reason
Realtime transport should not complicate standard business operations.

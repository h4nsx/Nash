# NASH Testing Strategy

## Test Pyramid

```text
             E2E
            /   \
      Integration
        /       \
      Unit Tests
```

## Unit Tests

Use xUnit for:
- domain rules
- state transitions
- validators
- application services/use cases
- authorization policies where practical

Examples:
- freelancer cannot propose to own project
- invalid project transition rejected
- duplicate proposal rejected
- contract creation only after accepted proposal

## Integration Tests

Test:
- API endpoints
- authentication
- authorization
- EF Core persistence
- transaction behavior
- database constraints

Use an isolated test database strategy.

## E2E

Use Playwright for critical journeys:

### Journey 1
Register → Login → Freelancer profile

### Journey 2
Client creates project → publishes project

### Journey 3
Freelancer discovers project → submits proposal

### Journey 4
Client accepts proposal → contract created

### Journey 5
Contract → milestone → completion → review

### Journey 6
Admin → CMS content → public page

## Test Naming

Use behavior-oriented names.

Example:

```text
AcceptProposal_ShouldCreateContractAndMoveProjectToInProgress
```

## Definition of Done

A feature is not complete when only the happy path works.

It must cover:
- success
- validation error
- unauthorized access
- not found
- business conflict
- loading/empty/error UI states
- automated tests where applicable

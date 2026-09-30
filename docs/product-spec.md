# NASH Product Specification

## 1. Product

NASH is a freelance marketplace with an integrated CMS.

It provides:
- client project publishing
- freelancer discovery
- proposal submission
- candidate selection
- contracts
- milestones
- reviews
- administration and CMS
- content and SEO management

## 2. Roles

### CLIENT
Can:
- manage own profile
- create and manage projects
- review proposals for own projects
- select a freelancer
- manage contracts and milestones
- review completed work

### FREELANCER
Can:
- manage own profile
- manage skills and portfolio
- browse public projects
- submit proposals
- manage accepted contracts
- update milestone work
- receive reviews

### ADMIN
Can:
- manage users
- moderate projects and proposals where applicable
- manage categories and skills
- manage reviews/reports
- manage media
- manage CMS content
- manage SEO metadata
- inspect operational data

## 3. Core Features

### Authentication
- registration
- login
- logout
- refresh session
- password hashing
- account state
- role assignment

### Freelancer
- public profile
- skills
- portfolio items
- project discovery
- proposal creation
- proposal history
- contracts
- milestones

### Client
- project CRUD
- draft/published/closed lifecycle
- proposal management
- freelancer selection
- contracts
- milestones
- reviews

### CMS
- categories
- skills
- site pages/content
- media metadata
- SEO metadata
- moderation/reports
- admin dashboard

## 4. Non-Goals

The initial release does NOT implement:
- real-money payment processing
- escrow
- tax/invoicing engine
- advanced recommendation engine
- Elasticsearch
- microservices
- Kubernetes
- Kafka
- complex bidding/auction logic
- enterprise billing

These can be future extensions.

## 5. Functional Requirements

### Project
A project must have:
- title
- slug
- description
- category
- budget
- status
- client
- timestamps

Project statuses:
`DRAFT`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`, `CANCELLED`

Only the owner can edit a draft/published project.
Only valid state transitions are allowed.

### Proposal
A freelancer can submit one active proposal per project.

Proposal contains:
- cover letter
- proposed budget
- estimated duration
- freelancer
- project
- status

Statuses:
`PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`

### Contract
A contract is created when a client accepts a proposal.

A contract belongs to:
- one client
- one freelancer
- one project
- one accepted proposal

Statuses:
`ACTIVE`, `COMPLETED`, `CANCELLED`

### Milestone
A contract can contain multiple milestones.

Statuses:
`PENDING`, `IN_PROGRESS`, `SUBMITTED`, `APPROVED`, `REJECTED`

### Review
A completed contract can receive reviews according to the product review policy.

## 6. Acceptance Criteria

Every feature must have:
1. authorization rules
2. validation rules
3. persistence behavior
4. API behavior
5. frontend state behavior
6. tests
7. error states
8. loading states
9. documentation update if architecture/API/domain changes

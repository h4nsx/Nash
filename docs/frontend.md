# NASH Frontend Engineering Guide

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

## Route Groups

Suggested structure:

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── projects/
│   ├── freelancers/
│   └── categories/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── dashboard/
│   ├── proposals/
│   ├── contracts/
│   └── settings/
└── admin/
    ├── users/
    ├── projects/
    ├── cms/
    └── reports/
```

## Rendering Strategy

Use:
- Server rendering/static generation for public SEO-sensitive content where useful
- client components only when interactivity requires them
- TanStack Query for authenticated/client-side API state
- route-level loading and error states

Do not make the entire application a client component unnecessarily.

## API Layer

Do not call `fetch()` directly from every component.

Create a typed API layer:

```text
lib/
  api/
    client.ts
    auth.ts
    projects.ts
    proposals.ts
    contracts.ts
```

## Components

Prefer:

```text
components/
├── ui/
├── layout/
├── project/
├── proposal/
├── contract/
├── freelancer/
└── admin/
```

Keep domain-specific components close to their domain.

## Forms

Use:
- React Hook Form
- Zod schemas
- server-side validation as the final authority

Client validation improves UX but is never a security boundary.

## SEO

Public pages should support:
- dynamic metadata
- canonical URLs
- Open Graph
- sitemap
- robots
- structured data where appropriate
- semantic HTML

Private dashboard/admin pages should not be indexed.

## UX Requirements

Every asynchronous operation should have:
- loading state
- success state
- error state
- empty state where applicable

Destructive actions require confirmation.

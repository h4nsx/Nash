# Frontend

Use Next.js/TypeScript, Tailwind, shadcn/ui, TanStack Query, React Hook Form and Zod.

Route groups: `(public)`, `(auth)`, `(marketplace)`, `(freelancer)`, `(client)`, `(admin)`.

Public marketplace/profile/CMS pages should use SSR/SSG where useful for SEO. Authenticated workflows use TanStack Query for server state. Centralize API calls; avoid scattered raw fetches.

Smart Match cards show score, verified skills, relevant experience and reason codes; do not show score without explanation.

Contract screens show the current immutable draft version and material terms before acceptance. Counter UI clearly highlights changes.

Use Next metadata, canonical URLs, sitemap, robots, Open Graph and appropriate structured data. Keep UI minimal and information-dense.

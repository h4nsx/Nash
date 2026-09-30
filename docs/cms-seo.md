# NASH CMS & SEO

## CMS Scope

Admin can manage:

- homepage content
- public pages
- categories
- skills
- FAQ/content blocks where implemented
- media metadata
- SEO metadata
- moderation/reports

## Content Model

CMS content should have:
- id
- key/slug
- title
- body/content
- status
- locale if internationalization is introduced
- createdAt
- updatedAt
- publishedAt

## SEO Model

Public resources can have:
- meta title
- meta description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- robots directives

## Public SEO Routes

```text
/
 /projects
 /projects/{slug}
 /freelancers
 /freelancers/{username}
 /categories
 /categories/{slug}
 /content/{slug}
```

## Non-Indexed Routes

```text
/dashboard
/settings
/messages
/admin
/auth/*
```

Use appropriate `noindex` behavior.

## Next.js Requirements

Use Next.js Metadata APIs.

Generate:
- `sitemap.xml`
- `robots.txt`
- dynamic metadata
- canonical URLs

Use structured data where it genuinely describes the page.

## CMS Rule

CMS content must not allow administrators to inject arbitrary unsafe scripts.

Rich text must be sanitized before rendering.

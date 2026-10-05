# NASH UI/UX & Design System Guidelines

This document outlines the visual language, design patterns, and aesthetic standards for the NASH frontend. The goal is to create an enterprise-grade, modern, and highly responsive user interface that builds trust for both freelancers and clients.

## 1. Core Aesthetic Principles

Based on the baseline setup in `page.tsx`, the design emphasizes:
1. **Glassmorphism & Depth:** Soft shadows, translucent backgrounds (`bg-zinc-50/50`, `backdrop-blur`), and subtle borders.
2. **Minimalist Contrast:** Deep dark modes (`bg-zinc-900`) and crisp light modes (`bg-white`) using the `zinc` color palette for a professional, unopinionated foundation.
3. **Micro-Interactions:** Subtle animations (`animate-pulse`, `animate-spin`, `hover:bg-zinc-100`, `transition-all`) to make the interface feel alive and responsive.
4. **Typography Driven:** Using `Geist` and `Geist Mono` fonts. Generous whitespace, tight tracking on headings (`tracking-tight`), and relaxed tracking on subheadings (`tracking-wide`).

## 2. Color Palette

We rely heavily on Tailwind's default palette, specifically tailored to the following semantics:
- **Base/Neutral:** `zinc` (Zinc-50 to Zinc-900). Used for all backgrounds, borders, and main text.
- **Brand/Primary:** We avoid generic primary colors. Use `emerald` (Emerald-500) for success states, active pulses, and primary call-to-actions.
- **Warning/Pending:** `amber` (Amber-400 to Amber-600) for pending contracts, warnings, and missing information.
- **Destructive/Error:** `rose` (Rose-500) for destructive actions (e.g., rejecting a contract, deleting an account).

## 3. Typography Hierarchy (Geist)

- **Hero Headings:** `text-4xl font-extrabold tracking-tight sm:text-6xl text-zinc-900 dark:text-white`
- **Section Headers:** `text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white`
- **Body Text:** `text-base text-zinc-600 dark:text-zinc-400`
- **Monospace Data:** `font-mono text-sm` (Used for timestamps, IDs, code snippets)

## 4. UI Components Library

### 4.1. Buttons
Avoid flat, featureless buttons. All buttons should have slight borders, shadows, and hover transitions.
```tsx
// Primary Button
<button className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
  Primary Action
</button>

// Secondary / Outline Button
<button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
  Secondary Action
</button>
```

### 4.2. Cards & Containers
Containers should use soft borders and a subtle difference in background color from the main page body.
```tsx
<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  {/* Content */}
</div>
```

### 4.3. Status Badges
Used heavily in the Contract and Milestone systems to denote state.
```tsx
// Active / Success (Emerald)
<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  Active
</span>

// Pending (Amber)
<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
  Pending
</span>
```

## 5. Iconography
We strictly use **Lucide React** (`lucide-react`).
- Icons should always be sized predictably: `h-4 w-4` or `h-5 w-5`.
- Icons should inherit color contextually (`text-zinc-500` generally, or matching the text color inside a button).

## 6. TipTap Editor Integration (CMS & Contracts)

NASH uses **TipTap** to render rich text for Contracts and CMS Articles. 

### Styling TipTap Content (`Prose`)
When rendering TipTap HTML (via `dangerouslySetInnerHTML`), we must wrap it in a typography plugin or custom CSS class to ensure it respects the `Geist` font and Tailwind theme.

```tsx
<div 
  className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-emerald-600"
  dangerouslySetInnerHTML={{ __html: article.contentHtml }} 
/>
```

### Editor UI
The actual Editor interface (for Admins and Clients modifying contracts) should resemble a modern notion-like interface. 
- A floating or fixed minimal toolbar.
- No heavy borders around the text area. Let the text breathe.

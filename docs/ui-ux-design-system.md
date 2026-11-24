# NASH UI/UX & Design System Guidelines

This document outlines the visual language, design system tokens, and UI patterns for the NASH frontend (`apps/web`). The design system emphasizes clarity, high contrast, restrained elegance, and enterprise trust.

---

## 1. Design Philosophy

1. **Restraint & Purpose**: Avoid visual noise. Use badges and status indicators only where they convey critical business state (e.g., Verified Skills, Match score, Contract negotiation stage).
2. **High-Contrast Legibility**: Rely on deep obsidian slate navy (`#0F172A`) for typography paired with crisp neutral borders (`#E2E8F0`) and luminous light slate backgrounds (`#F8FAFC`).
3. **Precision Blue Brand Accent**: Core interactive elements use vibrant Precision Cobalt / Sapphire Blue (`#2563EB` with `#1D4ED8` hover) instead of washed-out or muddy grays.
4. **Show, Don't Tell**: Favor tangible product preview cards and realistic interface representations over generic icon grids.

---

## 2. Design Tokens (`:root` Specification)

```css
:root {
  /* Brand (Precision Cobalt / Sapphire) */
  --brand-50: #EFF6FF;
  --brand-100: #DBEAFE;
  --brand-200: #BFDBFE;
  --brand-300: #93C5FD;
  --brand-400: #60A5FA;
  --brand-500: #3B82F6;
  --brand-600: #2563EB;
  --brand-700: #1D4ED8;
  --brand-800: #1E40AF;
  --brand-900: #1E3A8A;

  /* Navy (Deep Slate Hierarchy) */
  --navy-50: #F8FAFC;
  --navy-100: #F1F5F9;
  --navy-200: #E2E8F0;
  --navy-300: #CBD5E1;
  --navy-400: #94A3B8;
  --navy-500: #64748B;
  --navy-600: #475569;
  --navy-700: #334155;
  --navy-800: #1E293B;
  --navy-900: #0F172A;
  --navy-950: #080E18;

  /* Background & Surface */
  --background: #F8FAFC;
  --surface: #FFFFFF;
  --surface-subtle: #F1F5F9;
  --surface-muted: #E2E8F0;

  /* Text & Typography */
  --foreground: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --text-disabled: #94A3B8;

  /* Borders & Dividers */
  --border: #E2E8F0;
  --border-strong: #CBD5E1;

  /* Primary Interactive Actions */
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-active: #1E40AF;
  --primary-foreground: #FFFFFF;
  --primary-soft: #EFF6FF;
  --focus-ring: rgba(37, 99, 235, 0.2);

  /* Semantic Feedback */
  --success: #059669;
  --success-bg: #ECFDF5;

  --warning: #D97706;
  --warning-bg: #FFFBEB;

  --danger: #DC2626;
  --danger-bg: #FEF2F2;

  --info: #0284C7;
  --info-bg: #F0F9FF;

  /* Geometry & Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

---

## 3. Tailwind CSS v4 Theme Mapping

The tokens are registered via `@theme inline` in `apps/web/styles/globals.css`:

| Utility Category | Classes Available |
| :--- | :--- |
| **Brand Colors** | `bg-brand-50` ... `bg-brand-900`, `text-brand-600`, `border-brand-300` |
| **Navy Slate** | `bg-navy-900`, `text-navy-950`, `border-navy-200` |
| **Surfaces** | `bg-background`, `bg-surface`, `bg-surface-subtle`, `bg-surface-muted` |
| **Text** | `text-foreground`, `text-text-secondary`, `text-text-muted`, `text-text-disabled` |
| **Borders** | `border-border`, `border-border-strong` |
| **Actions** | `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground`, `bg-primary-soft` |
| **Semantics** | `bg-success-bg`, `text-success`, `bg-warning-bg`, `text-warning`, `bg-danger-bg`, `text-danger`, `bg-info-bg`, `text-info` |

---

## 4. UI Patterns & Guidelines

### 4.1. Buttons
Keep action buttons sleek and intentional:
```tsx
// Primary CTA
<button className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98]">
  Đăng Dự Án
</button>

// Secondary Outline
<button className="inline-flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-subtle px-4 py-2 text-sm font-medium text-foreground shadow-2xs transition-all">
  Xem Thêm
</button>
```

### 4.2. Cards & Elevation
Containers use clean white surfaces (`bg-surface`), crisp neutral borders (`border-border`), and minimal shadows (`shadow-xs` or `shadow-sm`):
```tsx
<div className="rounded-xl border border-border bg-surface p-6 shadow-xs transition-colors hover:border-brand-300">
  <h3 className="text-base font-bold text-foreground">Tiêu Đề Thẻ</h3>
  <p className="mt-1 text-sm text-text-secondary">Mô tả ngắn gọn, dễ đọc.</p>
</div>
```

### 4.3. Status Badges (Use Sparingly)
Only display status badges when communicating domain status:
```tsx
// Verified Skill (Success)
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success">
  Kỹ Năng Đã Xác Thực
</span>

// Smart Match Percentage (Info / Brand)
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info-bg text-info">
  96% Phù Hợp
</span>
```

### 4.4. Iconography
* Always use **Lucide React** (`lucide-react`).
* Restrict icons to purposeful anchors (`h-4 w-4` for button labels, `h-5 w-5` for card headers).
* Avoid repetitive icon bullets on every line to preserve clean visual scanning.

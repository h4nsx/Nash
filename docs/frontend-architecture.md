# NASH Frontend Architecture & Technical Specification

This document details the architectural foundation for the NASH Next.js frontend (`apps/web`). It bridges the UI with our .NET 8 backend, enforcing strict patterns for maintainability, performance, and security.

## 1. Tech Stack Overview
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS (via `@import "tailwindcss";`)
- **Icons:** `lucide-react`
- **API Client:** Axios (configured with interceptors)
- **State Management:** React Context (for local/auth state) & SWR or React Query (for server state caching)
- **Real-Time:** `@microsoft/signalr`
- **Rich Text Editor:** TipTap (for Contract Drafts and CMS content)

## 2. Folder Structure
The Next.js app router uses route groups to isolate contexts:

```text
apps/web/
├── app/
│   ├── (auth)/             # Login, Register, Password Reset
│   ├── (dashboard)/        # Client and Freelancer Dashboards (Requires Auth)
│   ├── (public)/           # Landing page, Blog, Public Profiles
│   ├── admin/              # CMS, Skill Verification, Contracts Management
│   ├── globals.css         # Tailwind directives and CSS variables
│   └── layout.tsx          # Root layout (Geist fonts applied here)
├── components/
│   ├── ui/                 # Reusable dumb components (Buttons, Inputs, Modals)
│   ├── forms/              # React Hook Form wrappers
│   ├── layout/             # Sidebar, Navbar, Footers
│   └── tiptap/             # Custom TipTap editor components
├── lib/
│   ├── api/                # Axios client (`client.ts`), interceptors, API services
│   ├── signalr/            # SignalR connection manager and hooks
│   └── utils/              # Helper functions (date formatting, currency)
├── types/                  # Global TypeScript interfaces mapping to Backend DTOs
└── middleware.ts           # Next.js Middleware for Route Protection
```

## 3. Connecting to the .NET Backend

### 3.1. Axios Client (`lib/api/client.ts`)
To ensure the `HttpOnly` JWT cookie is passed automatically, the Axios client must be configured with `withCredentials: true`.

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // CRITICAL: Enables HttpOnly Cookie transmission
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'; // Redirect to auth route
    }
    return Promise.reject(error);
  }
);
```

### 3.2. Server Components (SSR) Data Fetching
When fetching data from a Server Component (e.g., `app/(dashboard)/projects/page.tsx`), you must manually forward the `X-Access-Token` cookie from the incoming request.

```typescript
import { cookies } from 'next/headers';

async function getProjects() {
  const cookieStore = cookies();
  const token = cookieStore.get('X-Access-Token')?.value;

  const res = await fetch('http://localhost:5000/api/v1/projects', {
    headers: {
      Cookie: `X-Access-Token=${token}`
    }
  });
  return res.json();
}
```

## 4. SignalR Real-Time Integration

We will wrap SignalR in a custom React Hook (`lib/signalr/useNotifications.ts`) that initializes the connection only when the user is logged in. 

```typescript
import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_HUB_URL!, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (payload) => {
      setNotifications(prev => [payload, ...prev]);
      // Optional: Trigger a toast notification here
    });

    connection.start().catch(err => console.error("SignalR Connection Error: ", err));

    return () => { connection.stop(); };
  }, []);

  return notifications;
}
```

## 5. Security & Middleware

Create `middleware.ts` at the root of `apps/web/`. It intercepts every route change.
- If the user tries to access `/dashboard` or `/admin` without the `X-Access-Token` cookie, redirect them to `/login`.
- If the user tries to access `/admin` but their decoded role is not `Admin`, redirect to `/403`.

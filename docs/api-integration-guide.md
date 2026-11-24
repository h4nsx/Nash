# NASH Backend API Integration Guide

This document serves as the technical contract between the Next.js Frontend and the .NET 8 Backend. It details how to authenticate, handle standard responses, connect to real-time WebSockets, and interact with the core domain endpoints.

## 1. Global Configurations

- **Base URL (Local):** `http://localhost:5000` or `https://localhost:5001` (Check your `.NET` launch settings)
- **Content-Type:** All requests with a body must use `Content-Type: application/json`.
- **Localization:** All backend string responses and error messages are natively returned in **Vietnamese**.

## 2. Authentication (HttpOnly Cookies)

For security against XSS attacks, the backend **does not** return the JWT in the JSON body. Instead, it attaches the JWT as an `HttpOnly, Secure, SameSite=Strict` cookie named `X-Access-Token`.

### Critical Frontend Rule
Whenever you make a request using `fetch` or `axios`, you **MUST** include credentials so the browser automatically attaches the cookie:
- **Axios:** `axios.defaults.withCredentials = true;`
- **Fetch:** `fetch(url, { credentials: 'include', ... })`

### Endpoints
- `POST /api/v1/auth/register` (Body: `Email`, `Password`, `FirstName`, `LastName`, `Role` [Client/Freelancer/Admin])
- `POST /api/v1/auth/login` (Body: `Email`, `Password`) - *Returns user info and sets the cookie.*
- `POST /api/v1/auth/logout` - *Clears the secure cookie.*

## 3. Standard Response Formats

The API strictly adheres to a unified response wrapper. You will never receive raw data.

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    // Your requested payload here (e.g., an array, object, or simple message)
  }
}
```

### Error Response (HTTP 400, 401, 403, 404)
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "code": "SPECIFIC_ERROR_CODE",
    "message": "Lỗi bằng tiếng Việt cho người dùng.",
    "errors": {
      "Field1": ["Chi tiết lỗi 1"],
      "Field2": ["Chi tiết lỗi 2"]
    }
  }
}
```

## 4. Real-Time WebSockets (SignalR)

The backend pushes real-time notifications for milestone updates, contract approvals, and messages.

- **Hub URL:** `/hubs/notifications`
- **Connection:** Because we use an HttpOnly cookie, the SignalR client will automatically authenticate if `withCredentials` is enabled.
- **Listen for Event:** `ReceiveNotification`

**Example (JavaScript/TypeScript):**
```typescript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:5001/hubs/notifications", {
        withCredentials: true
    })
    .withAutomaticReconnect()
    .build();

connection.on("ReceiveNotification", (payload) => {
    console.log("New Notification:", payload.title, payload.message, payload.timestamp);
});

await connection.start();
```

## 5. Core API Endpoints Reference

### Projects
- `POST /api/v1/projects` - Create a project (Client only).
- `GET /api/v1/projects` - List active projects.

### Smart Match (Rate Limited)
- `POST /api/v1/projects/{projectId}/matches/generate` - Runs the deterministic matching engine (Client only). **Strictly rate-limited (5 requests/minute).**
- `GET /api/v1/projects/{projectId}/matches` - Fetch previously generated matches.

### Direct Handshake
- `POST /api/v1/handshake/invitations` - Send an invitation (Client -> Freelancer).
- `POST /api/v1/handshake/invitations/{id}/accept` - Freelancer accepts, generating a `ContractDraft`.
- `POST /api/v1/handshake/drafts/{id}/submit-negotiation` - Submit a negotiated draft.
- `POST /api/v1/handshake/drafts/{id}/approve` - Approves the draft and converts it into a binding `Contract`.

### Work & Milestones
- `POST /api/v1/work/contracts/{contractId}/milestones` - Client defines a milestone and budget.
- `PUT /api/v1/work/milestones/{id}/submit` - Freelancer submits work. *(Triggers SignalR to Client)*
- `PUT /api/v1/work/milestones/{id}/accept` - Client approves work. *(Triggers SignalR to Freelancer)*
- `PUT /api/v1/work/milestones/{id}/request-changes` - Client requests revisions. *(Triggers SignalR to Freelancer)*
- `POST /api/v1/work/contracts/{contractId}/complete` - Client marks the whole contract as finished (requires all milestones to be accepted).

### CMS & SEO (Admin & Public)
- `GET /api/v1/cms/articles` (Public) - List all published blog articles.
- `GET /api/v1/cms/articles/{slug}` (Public) - Fetch article by slug. Contains `seoTitle`, `seoDescription`.
- `POST /api/v1/cms/articles` (Admin) - Create TipTap powered article.
- `GET /api/v1/cms/sitemap.xml` (Public) - Dynamic sitemap generator for Google Search Console.

### System Settings (Analytics)
- `GET /api/v1/settings` (Public, Cached 30m) - Fetch global settings. Ideal for Next.js to fetch Google Analytics IDs `GoogleAnalyticsId` on mount.
- `PUT /api/v1/settings` (Admin) - Update keys/values.

## 6. Implementation Tips for Next.js

1. **Next.js Server Components:** If you fetch data from the backend inside a Server Component (`app/page.tsx`), you must manually forward the `X-Access-Token` cookie from the Next.js request headers to the backend `fetch` call.
2. **Error Handling:** Create a global Axios interceptor that catches `401 Unauthorized` and redirects the user to `/login`.
3. **TipTap Rendering:** The `ContentHtml` field from Articles/Pages can be directly injected into a `div` using `dangerouslySetInnerHTML`. Ensure you sanitize it if you ever allow user-generated content, though currently it is Admin-only.

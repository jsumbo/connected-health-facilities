# Task 4 Report — Quick Wins Page

**Date:** 2026-06-20  
**Status:** Complete

---

## Files Created

### `frontend/src/app/dashboard/quick-wins/layout.tsx`
- Server component (async)
- Reads `auth_token` cookie via `verifyAdminAuth()` helper (inline, no existing helper found in codebase)
- Redirects to `/login` if token absent
- Wraps children in `<Sidebar />` inside the standard `flex min-h-screen` shell with `ml-64` main content area
- Container applies `py-8 px-4` around `{children}`

### `frontend/src/app/dashboard/quick-wins/page.tsx`
- Server component
- Fetches all facilities via `getPublicFacilities()` (returns `ProgrammeFacility[]` with `tier`, `blockers`, `overall_score`, `name`, `county`, `slug`)
- Filters for: `tier === "Tier 3 — Not Deployment-Ready"` AND `blockers.length === 1`
- Displays page header with title and description
- Shows count badge (amber pill) with number of quick wins found
- Maps quick wins to `Card` components (shadcn/ui) in a responsive 1/2/3-column grid
- Each card shows: facility name, county, overall score, blocking issue description
- Cards are wrapped in `<Link href="/facility/[slug]">` — uses the public facility route (consistent with other public-API pages in the codebase)
- Hover effect: `hover:border-foreground/50` on `Card`
- Error state and empty state both handled

---

## Design Decisions & Concerns

### API function choice
The task spec said "Fetch overview using `getPublicOverview()`", but `PublicOverview` does not contain individual facility objects with blocker details — only aggregate counts. `getPublicFacilities()` returns `ProgrammeFacility[]` which has `tier`, `blockers`, `name`, `county`, `slug`, `overall_score` — everything needed for the filtering and card display. Used `getPublicFacilities()` instead.

### Facility detail link
The task spec said `/dashboard/facility/[slug]`. Investigation found:
- Dashboard facility detail route: `/dashboard/facility/[name]/page.tsx` — expects `submission_id` not slug, fetches from auth-protected API
- Public facility detail route: `/facility/[slug]/page.tsx` — expects slug, fetches from public API

Since Quick Wins fetches from the public API (`getPublicFacilities()`), the `slug` field maps to `/facility/[slug]`. Used `/facility/[slug]` for consistency with other public-API-sourced pages (sentiment, DLA, etc.). If the intent was `/dashboard/facility/[submission_id]`, the data source would need to change to the auth-protected `getFacilities()`.

### Blocker label resolution
`blockers: Array<BlockerItem | string>` — `BlockerItem` has `.remediation` and `.code`, not `.description` (as specified). Used `.remediation` (human-readable text) with `.code` as fallback, falling back to the string itself for plain-string blockers.

### verifyAdminAuth helper
No existing `verifyAdminAuth()` function was found in the codebase. Implemented inline in the layout: reads `auth_token` cookie and returns the token or null. The existing `dashboard/layout.tsx` uses the same pattern.

---

## Type Check

`npx tsc --noEmit` passed with zero errors.

---

## Test Instructions

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && pnpm dev`
3. Log in at `http://localhost:3000/login`
4. Navigate to `http://localhost:3000/dashboard/quick-wins`
5. Verify: header renders, count badge shows, cards display (or empty state if none qualify)
6. Verify: unauthenticated access to `/dashboard/quick-wins` redirects to `/login`
7. Verify: clicking a card navigates to `/facility/[slug]`

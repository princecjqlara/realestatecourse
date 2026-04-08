# Lead Generation Funnel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a simple landing page that captures leads, unlocks a gated free Facebook Ads course, and gives admin users visibility into leads, watch behavior, and retention.

**Architecture:** Use Next.js App Router for the web app, signed cookies for lead and admin sessions, a local JSON datastore for immediate development, and a Supabase-ready schema for future production data migration and magic-link resume access.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Vitest, optional Supabase Auth.

---

### Task 1: Domain rules and analytics

**Files:**
- Create: `src/lib/funnel/schema.ts`
- Create: `src/lib/funnel/analytics.ts`
- Test: `src/lib/funnel/schema.test.ts`
- Test: `src/lib/funnel/analytics.test.ts`

**Step 1:** Write failing tests for lead parsing and analytics rollups.

**Step 2:** Run `npm test` and verify the imports fail first.

**Step 3:** Implement the minimal parser and analytics helpers.

**Step 4:** Run `npm test` and confirm green.

### Task 2: Session handling

**Files:**
- Create: `src/lib/auth/session.ts`
- Test: `src/lib/auth/session.test.ts`

**Step 1:** Write failing token round-trip and tamper-detection tests.

**Step 2:** Run `npm test` and verify the module is missing.

**Step 3:** Implement signed cookie payload helpers.

**Step 4:** Run `npm test` and confirm green.

### Task 3: Funnel app shell

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.module.css`
- Modify: `src/app/globals.css`
- Create: `src/components/funnel/lead-form.tsx`
- Create: `src/app/course/page.tsx`
- Create: `src/app/resume/page.tsx`

**Step 1:** Replace the default starter page with a simple landing page and lead form.

**Step 2:** Add a gated course page and resume page.

**Step 3:** Style the funnel to stay simple and mobile-safe.

**Step 4:** Run `npm run lint`.

### Task 4: Actions, tracking, and admin

**Files:**
- Create: `src/app/actions.ts`
- Create: `src/app/api/watch-events/route.ts`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/proxy.ts`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/dashboard/page.tsx`
- Create: `src/app/admin/content/page.tsx`

**Step 1:** Implement lead submit, resume, admin login, and logout server actions.

**Step 2:** Implement watch-event ingestion and optional magic-link callback.

**Step 3:** Add protected admin pages and analytics views.

**Step 4:** Run `npm run lint` and `npm test`.

### Task 5: Persistence and deployment handoff

**Files:**
- Create: `src/lib/funnel/repository.ts`
- Create: `src/lib/funnel/default-course.ts`
- Create: `src/lib/funnel/types.ts`
- Create: `supabase/schema.sql`
- Create: `.env.example`
- Modify: `README.md`

**Step 1:** Add the local development datastore.

**Step 2:** Add the Supabase-ready schema for production.

**Step 3:** Document environment variables and local-vs-production behavior.

**Step 4:** Run `npm run build`.

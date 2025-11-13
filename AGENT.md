# Gabriel Family Clinic MVP – AI Coding Agent Briefing (Single Source of Truth)

Author: Kilo Code (AI Technical Partner)  
Audience:
- AI coding agents handling this repo.
- Senior engineers reviewing/merging PRs.

Purpose:
- Provide one authoritative mental model of:
  - What this product is.
  - How it is architected.
  - How the codebase is supposed to look in this repo (current + near-term).
  - How to make changes safely with minimal mistakes.
- Any future AI agent must read this file before touching code.
- Keep this document in sync when architecture or contracts change.

---

## 1. Product Summary

Tagline:
- One clinic. One simple system. One happy patient.

Problem:
- A single neighborhood GP clinic in Singapore needs:
  - Simple online booking.
  - A calm, visible queue.
  - Minimal ops overhead.
  - PDPA-conscious data handling.

Non-negotiable constraints:
- One clinic (no multi-tenant complexity).
- One developer can build and maintain.
- 4–6 week MVP to dependable production.
- Zero DevOps:
  - Next.js (Pages Router) on Vercel.
  - Supabase (Postgres + Auth + RLS).
  - Twilio for SMS (and optional WhatsApp).
- Senior-first UX:
  - Large touch targets.
  - Clear language.
  - Minimal steps.
- Compliance-aware:
  - NRIC is hashed + masked; never used raw as an identifier.
  - RLS enforced at DB with `auth.uid()`.
  - Least-privilege everywhere.

MVP Scope (this repo implements the backbone):
- Patients:
  - Login via Supabase Auth (magic link / OTP).
  - Create/manage exactly one `patient_profile` per `auth.uid()`.
  - Book appointment (doctor, date, slot).
  - View upcoming appointments (own only).
- Staff/Doctors:
  - Login via Supabase Auth.
  - Identified via `staff_profiles` (`staff|doctor|admin`).
  - View today’s appointments.
  - Update status:
    - `booked → arrived → in_consultation → completed / no_show`.
  - Queue numbers auto-assigned on arrival (per doctor/day).
- System:
  - All critical access governed by schema + RLS.
  - Notifications:
    - SMS confirmations and reminders are best-effort, future phases.

Non-Goals for MVP:
- Multi-clinic.
- Full EMR.
- Payments.
- Heavy analytics.
- Any “clever” infra or abstractions that add risk or complexity.

Agents:
- Always optimize for:
  - Safety, clarity, and operational simplicity over cleverness.

---

## 2. Canonical Architecture (How It Fits Together)

High-level stack:
- Next.js 14+ (Pages Router, TypeScript).
- Mantine UI as primary component library, plus small custom primitives.
- Supabase Postgres + Supabase Auth.
- Twilio for notifications (future phases).

Key principles:
- Identity:
  - Supabase `auth.users` is the single source of truth.
  - Every patient and staff row links to `auth.users.id`.
- RLS:
  - Enforced on all sensitive tables, using `auth.uid()`.
  - Staff access mediated via `staff_profiles`.
- API:
  - Next.js API Routes under `src/pages/api/`.
  - Use server-side Supabase client (`supabaseServer`) with service role key.
  - Use `requireAuth` + `requireStaff` for all protected routes.
- Frontend:
  - Pages (`src/pages`) orchestrate flows.
  - Components (`src/components`) provide presentational/logical units.
  - Client-side Supabase only for auth and safe reads; business logic in API routes.

Agents:
- Must treat this architecture as normative for all changes.
- Must not introduce new infra (Prisma, App Router, tRPC, etc.) unless explicitly requested.

---

## 3. Database Model (Authoritative)

Canonical schema:
- [`database_schema.sql`](database_schema.sql:1) (mirrored in [`supabase/schema.sql`](supabase/schema.sql:1)).

Core tables:

### `patient_profiles`

- `id` UUID PK
- `user_id` (FK → `auth.users.id`, unique)
- `full_name`
- `nric_hash` (deterministic)
- `nric_masked`
- `dob`
- `language`
- `chas_tier`
- RLS:
  - Patient can see/update own row (`auth.uid() = user_id`).
  - Staff (via `staff_profiles`) can read for ops.

### `staff_profiles`

- `id` UUID PK
- `user_id` (FK → `auth.users.id`, unique)
- `display_name`
- `role` in `staff|doctor|admin`
- RLS:
  - Self can see own row.
  - Admins can see all.

### `doctors`

- `id` UUID PK
- `staff_profile_id` (optional FK → `staff_profiles.id`)
- `name`
- `photo_url`
- `languages` (text[])
- `is_active` boolean
- RLS:
  - Public SELECT of active doctors.

### `clinic_settings`

- Single-row configuration:
  - Clinic info, timezone, `slot_duration_min`, `booking_window_days`
- RLS:
  - Public SELECT.

### `appointments`

- `id` UUID PK
- `patient_id` FK → `patient_profiles`
- `doctor_id` FK → `doctors`
- `scheduled_start` timestamptz
- `status` in `booked|arrived|in_consultation|completed|no_show|cancelled`
- `queue_number` text (e.g. `A001`)
- `reason` text (optional)
- RLS:
  - Patients: select only those where `patient_id` is theirs.
  - Staff/Doctors/Admin: select/update via `staff_profiles`.
  - Insert allowed only when `patient_id` belongs to `auth.uid()`.

### `notifications` (future)

- Records SMS/WhatsApp notifications.
- `type` in `confirmation|reminder|queue_alert`.
- RLS:
  - Patients see their own.
  - Staff see all.

Security rules:
- RLS enabled everywhere.
- Policies explicitly defined in `database_schema.sql`.
- Agents:
  - MUST respect these rules.
  - MUST NOT bypass with direct service-role reads that contradict RLS intent.

---

## 4. Core Runtime Utilities (Use These Correctly)

Location:
- `src/lib/`

### 4.1 Supabase Server Client

File:
- [`src/lib/supabaseServer.ts`](src/lib/supabaseServer.ts:1)

Rules:
- Uses `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- `auth: { persistSession: false }`.
- Only import in:
  - API routes under `src/pages/api/`.
  - Server-only scripts.
- Never leak service key to client.

### 4.2 Supabase Browser Client

File:
- [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts:1)

Rules:
- Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- For:
  - Login/logout via Supabase Auth.
  - Safe client-side reads.
- For business logic, prefer internal API routes.

### 4.3 Auth Helpers

File:
- [`src/lib/auth.ts`](src/lib/auth.ts:1)

Functions:
- `getUserFromRequest(req)`:
  - Reads `Authorization: Bearer <token>` or `sb-access-token` cookie.
  - Uses `supabaseServer.auth.getUser(token)`.
- `requireAuth(req)`:
  - Wraps `getUserFromRequest`.
  - Throws/propagates `UNAUTHORIZED` if no user.
- `requireStaff(req)`:
  - Calls `requireAuth`.
  - Confirms `staff_profiles` row with role in `['staff', 'doctor', 'admin']` for `user_id`.
  - Throws/propagates `FORBIDDEN` if not staff.
  - MUST be used by all `/api/staff/*` routes.

Agents:
- MUST reuse `requireAuth` and `requireStaff`, not re-implement.

### 4.4 Domain Utilities

Expected/implemented:

- `src/lib/validation.ts`:
  - Zod schemas:
    - Profile input.
    - Booking input.
- `src/lib/slots.ts`:
  - `getAvailableSlots(doctorId, date)`:
    - Uses `clinic_settings.slot_duration_min` and booking window.
    - Filters out booked `appointments`.
- `src/lib/queue.ts`:
  - `getNextQueueNumber(doctorId, datetime)`:
    - Per doctor/day.
    - Monotonic sequence like `A001`, `A002`, ...
- `src/lib/notifications.ts` (future):
  - Wraps Twilio:
    - `sendBookingConfirmation`
    - `sendAppointmentReminder`
  - Must be best-effort; must not break booking.

Agents:
- MUST reuse these helpers.
- MUST NOT duplicate auth, slots, or queue logic.

---

## 5. Page & API Surface (This Repo’s Target)

All below are Next.js Pages Router routes under `src/pages`.

### 5.1 Public / Patient

Pages:

- `/` → `src/pages/index.tsx`
  - Dynamic landing page mirroring static mockup.
  - CTAs:
    - `/book`
    - `/profile`
    - `/staff/appointments` (for staff).
- `/login` → `src/pages/login.tsx`
  - Entry to Supabase Auth (OTP / magic link).
- `/profile` → `src/pages/profile.tsx`
  - Authenticated.
  - Loads via `/api/patient/profile.get`.
  - Submits via `/api/patient/profile.put`.
- `/book` → `src/pages/book.tsx`
  - Authenticated + profile required.
  - Uses:
    - `/api/doctors/index.get`
    - `/api/slots/index.get`
    - `/api/appointments/book.post`
  - Shows upcoming appointments via `/api/appointments/mine.get`.

Key APIs (patient-facing):

- `/api/patient/profile.get`
- `/api/patient/profile.put`
- `/api/doctors/index.get`
- `/api/slots/index.get`
- `/api/appointments/book.post`
- `/api/appointments/mine.get`

### 5.2 Staff / Doctor

Pages:

- `/staff/appointments` → `src/pages/staff/appointments.tsx`
  - Staff dashboard:
    - Today’s appointments.
    - Status controls.
    - Queue indicators.

APIs:

- `/api/staff/appointments.get`
  - GET.
  - Require `requireStaff`.
  - Returns today’s appointments:
    - Patient name,
    - Doctor name,
    - Status,
    - Queue number.
- `/api/staff/appointment-status.post`
  - POST.
  - Require `requireStaff`.
  - Input: `appointment_id`, `status`.
  - On `arrived`:
    - Assign queue number via `getNextQueueNumber` if missing.
  - Update `appointments` row.

### 5.3 Cron / Notifications (Future)

- `/api/cron/reminders.post`
  - POST.
  - Auth via `CRON_SECRET`.
  - Finds `booked` appointments in next 24h.
  - Sends reminders via `notifications.ts`.
  - Records results in `notifications`.

Agents:
- When implementing/altering APIs:
  - Preserve HTTP methods and status codes.
  - Use Zod for validation.
  - Map:
    - `UNAUTHORIZED` → 401,
    - `FORBIDDEN` → 403,
    - Validation errors → 400,
    - Unknown → 500.
  - Keep handlers thin; delegate to `lib` where possible.

---

## 6. Frontend Design System Expectations

Baseline:
- Mantine as primary UI library.
- `src/styles/globals.css`:
  - Global resets.
  - Uses `src/styles/tokens.css` for:
    - Colors, typography, radii, spacing, etc.
- Ticket:
  - Dynamic landing page should visually align with `static/index.html` and `static/styles/globals.css`.

Core UI primitives:
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/section.tsx`

UX rules:
- Senior-friendly:
  - Large text, touch targets, high contrast.
- Simple:
  - Minimal steps, no confusing navigation.
- Predictable:
  - No hidden state; server-driven where possible.

Agents:
- Use these primitives and Mantine.
- Do not add a second UI framework.

---

## 7. Testing & QA Expectations

Planned tooling:
- Jest:
  - Unit tests:
    - `lib/slots.ts`
    - `lib/queue.ts`
  - Integration tests:
    - API handlers, mocked Supabase/Twilio.
- Playwright:
  - E2E:
    - Landing loads.
    - `/book` flow.
    - Staff sees appointments.

Guidelines:
- No live Supabase/Twilio calls in unit/integration.
- Use mocks/stubs.
- Focus on critical flows:
  - Patient profile + booking.
  - Staff viewing and updating appointments.
  - RLS/role separation.

Agents:
- When adding/changing behavior:
  - Mirror changes in tests.
  - Keep tests small and focused.

---

## 8. Operational & Security Rules For Agents

1) Environment Variables

Public:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLINIC_*`

Server-only:
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL` (if used)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_SMS_FROM`
- `CRON_SECRET`
- `NRIC_HASH_SECRET`

Never:
- Log secrets.
- Expose server-only keys in client bundles.

2) Auth & RLS

Always:
- Use `requireAuth` for patient-specific routes.
- Use `requireStaff` for staff routes.
- Align with `database_schema.sql` RLS design.

Never:
- Bypass RLS with arbitrary service-role queries.
- Query or filter by plain NRIC.

3) Error Handling

API handlers:
- 405: wrong method.
- 401: unauthenticated.
- 403: unauthorized (e.g., not staff).
- 400: validation failures (Zod errors).
- 500: unexpected errors (log non-sensitive context).

Notifications (future):
- Failures must not break bookings.
- Log to `notifications` and continue.

4) Code Style

- TypeScript everywhere.
- Keep modules small, focused.
- Use import aliases (`@/lib/...`, `@/components/...`) as configured.
- Avoid:
  - New frameworks (tRPC, Prisma, NextAuth, etc.) unless specifically requested.

---

## 9. How To Safely Handle Future Work (Agent Checklist)

Before making any change:

1. Read:
   - [`AGENT.md`](AGENT.md:1) (use `AGENT_new.md` content once applied).
   - [`docs/project_review_and_codebase_understanding.md`](docs/project_review_and_codebase_understanding.md:1)
   - [`docs/master_execution_todo_checklist.md`](docs/master_execution_todo_checklist.md:1)
   - Relevant phase doc(s).

2. Verify:
   - Alignment with:
     - Single-clinic assumption.
     - RLS/PDPA requirements.
     - Senior-first, staff-friendly UX.
     - Current file/route conventions.

3. When editing:
   - Reuse `auth.ts`, `supabaseServer.ts`, `supabaseClient.ts`, `slots.ts`, `queue.ts`.
   - Keep API contracts consistent unless explicitly updating spec.
   - Ensure DB queries match `database_schema.sql`.

4. After editing:
   - For APIs:
     - Methods, status codes, error mapping.
   - For components:
     - Imports valid, no broken routes.
   - For DB interactions:
     - Table/column names correct.
   - For queue/slots:
     - Deterministic, no racey logic.

5. Prefer minimal diffs:
   - Focused, testable changes.
   - Update docs/tests accordingly.

If uncertain:
- Choose simpler, more explicit behavior.
- Do not introduce new concepts without anchoring in:
  - PRD
  - PAD
  - This AGENT guide.

---

## 10. Summary

If you are an AI coding agent working on this repo:

- Treat `AGENT.md` (once updated from `AGENT_new.md`) as your operating manual.
- Combine it with:
  - `Project_Requirements_Document.md`
  - `Project_Architecture_Document.md`
  - `database_schema.sql`
  - `docs/master_execution_todo_checklist.md`
- Your priorities:
  1) Do not break core patient or staff flows.
  2) Do not weaken security/RLS/PDPA posture.
  3) Maintain senior-friendly, staff-friendly simplicity.
  4) Keep implementation aligned with the documented architecture.
  5) Make small, well-reasoned, well-documented changes.

If you follow these rules, you can implement features and fixes with high confidence and minimal supervision.
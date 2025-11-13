# Gabriel Family Clinic MVP – AI Coding Agent Briefing (Single Source of Truth)

Audience:
- AI coding agents handling this repo.
- Senior engineers reviewing/merging PRs.

Purpose:
- Provide one authoritative mental model of:
  - What this product is.
  - How it is architected.
  - How the codebase is supposed to look when fully implemented.
  - How to make changes safely with minimal mistakes.
- Any future AI agent should read this file before touching code.

Keep this document in sync when architecture or contracts change.

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

Constraints (non-negotiable):
- 1 clinic (no multi-tenant complexity).
- 1 developer can build/maintain.
- 4–6 week MVP to production.
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

MVP Scope:
- Patients:
  - Login via Supabase Auth (email magic link or phone OTP).
  - Create one `patient_profile` per user.
  - Book appointment (doctor, date, slot).
  - View upcoming appointments.
- Staff/Doctors:
  - Login via same Supabase Auth.
  - Identified via `staff_profiles` (role in `staff|doctor|admin`).
  - View today’s appointments.
  - Update status:
    - `booked → arrived → in_consultation → completed / no_show`.
  - Queue numbers auto-assigned on arrival.
- System:
  - All critical access governed by schema + RLS.
  - Notifications:
    - SMS confirmations (best-effort).
    - Optional 24h reminders via cron endpoint.

Non-Goals for MVP:
- Multi-clinic.
- Full EMR.
- Payments.
- Heavy analytics.
- Anything “clever” that risks reliability or complexity.

---

## 2. Canonical Architecture (How It All Fits Together)

High-level stack:
- Next.js 14+ (Pages Router, TypeScript).
- Mantine UI as primary component library.
- Light custom UI primitives (Shadcn-inspired) layered via CSS.
- Supabase Postgres + Supabase Auth.
- Twilio for SMS.

Key principles:
- Identity:
  - Supabase `auth.users` is the single source of truth.
  - Every patient and staff row links to `auth.users.id`.
- RLS:
  - Enforced on all sensitive tables.
  - Uses `auth.uid()`; staff access controlled via `staff_profiles`.
- API:
  - Next.js API Routes under `src/pages/api/`.
  - Use server-side Supabase client with service role key.
  - Use `requireAuth` + role helpers for all protected routes.
- Frontend:
  - Pages (`src/pages`) orchestrate flows.
  - Components (`src/components`) handle presentational and local interaction.
  - Client-side Supabase only for auth (login/logout) and limited reads; prefer internal APIs.

---

## 3. Database Model (Authoritative)

File:
- [database_schema.sql](database_schema.sql:1) (and mirrored [supabase/schema.sql](supabase/schema.sql:1))

Core tables:

- `patient_profiles`
  - `id` UUID PK
  - `user_id` (FK → `auth.users.id`, unique)
  - `full_name`
  - `nric_hash`
  - `nric_masked`
  - `dob`
  - `language`
  - `chas_tier`
  - RLS:
    - Patient can see/update own row.
    - Staff (via `staff_profiles`) can read for clinic ops.

- `staff_profiles`
  - `id` UUID PK
  - `user_id` (FK → `auth.users.id`, unique)
  - `display_name`
  - `role` in `staff|doctor|admin`
  - RLS:
    - Self can see self.
    - Admins see all.

- `doctors`
  - `id` UUID PK
  - `staff_profile_id` (optional FK)
  - `name`
  - `photo_url`
  - `languages` (text[])
  - `is_active` boolean
  - RLS:
    - Public SELECT for active doctors.

- `clinic_settings`
  - Single-row configuration:
    - clinic info, timezone, `slot_duration_min`, `booking_window_days`
  - RLS:
    - Public SELECT.

- `appointments`
  - `id` UUID PK
  - `patient_id` FK → `patient_profiles`
  - `doctor_id` FK → `doctors`
  - `scheduled_start` timestamptz
  - `status` in `booked|arrived|in_consultation|completed|no_show|cancelled`
  - `queue_number` text (e.g., A001)
  - `reason` text (optional)
  - RLS:
    - Patients: can select only those linked to their `patient_profile`.
    - Staff/Doctors/Admin: can select/update via `staff_profiles` role.
    - Insert:
      - Allowed when `patient_id` matches caller’s `patient_profile`.

- `notifications`
  - Records of SMS/WhatsApp notifications.
  - `type` in `confirmation|reminder|queue_alert`.
  - RLS:
    - Patients see their own.
    - Staff see all.

Security rules:
- All relevant tables have RLS enabled.
- Policies explicitly defined in `database_schema.sql`.
- Agents MUST ensure new code respects these policies; never bypass with arbitrary service-role operations that contradict them.

---

## 4. Core Runtime Utilities (Use These Correctly)

Location:
- `src/lib/`

Key files:

1) Supabase Server Client
- [src/lib/supabaseServer.ts](src/lib/supabaseServer.ts:1)
- Uses:
  - URL from `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`.
  - Key from `SUPABASE_SERVICE_ROLE_KEY` (server only).
- Rules:
  - ONLY use in server-side contexts (API routes, scripts).
  - NEVER expose service key to browser.
  - `auth: { persistSession: false }`.

2) Supabase Browser Client
- [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts:1)
- Uses:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Use cases:
  - Login/logout (Supabase Auth).
  - Limited client-side reads where safe.
  - Prefer calling internal APIs for business logic.

3) Auth Helpers
- [src/lib/auth.ts](src/lib/auth.ts:1)
- Functions:
  - `getUserFromRequest(req)`:
    - Reads `Authorization: Bearer <token>` or `sb-access-token` cookie.
    - Uses `supabaseServer.auth.getUser(token)`.
  - `requireAuth(req)`:
    - Wraps `getUserFromRequest`.
    - Throws `Error('UNAUTHORIZED')` if missing.
- Expected extension:
  - `requireStaff(req)`:
    - Check `staff_profiles` for roles in `['staff', 'doctor', 'admin']`.
    - Throw/return forbidden if not staff.

4) Domain Utilities (to be present)
- `src/lib/validation.ts`
  - Zod schemas for:
    - `ProfileSchema`
    - `BookAppointmentSchema`
- `src/lib/slots.ts`
  - `getAvailableSlots(doctorId, date)`:
    - Uses `clinic_settings.slot_duration_min`.
    - Computes working hours (e.g., 09-12, 14-17).
    - Filters out booked slots via `appointments`.
- `src/lib/queue.ts`
  - `getNextQueueNumber(doctorId, datetime)`:
    - For all appointments same day, pick max `queue_number` and increment A001 → A002…
- `src/lib/notifications.ts`
  - Wraps Twilio:
    - `sendBookingConfirmation`
    - `sendAppointmentReminder`
  - Uses `notifications` table.
  - Must be best-effort; never break booking if Twilio fails.

Agents:
- MUST reuse these helpers.
- MUST NOT reimplement auth or Supabase logic ad hoc.

---

## 5. Page & API Surface (Target End State)

All paths below are Pages Router style under `src/pages`.

### 5.1 Public / Patient

Pages:
- `/` → `src/pages/index.tsx`
  - Hero, Why Us, How It Works, Seniors, Staff, CTA.
  - CTAs:
    - `/book`
    - `/profile`
    - `/staff/appointments`
  - Uses Mantine + custom UI primitives to mirror static mockup.
- `/login` → `src/pages/login.tsx`
  - Uses Supabase client for magic-link/OTP.
- `/profile` → `src/pages/profile.tsx`
  - Authenticated.
  - Loads via `/api/patient/profile.get`.
  - Renders `ProfileForm`.
- `/book` → `src/pages/book.tsx`
  - Authenticated.
  - Renders `BookingForm`.
  - Uses `/api/doctors`, `/api/slots`, `/api/appointments/book.post`.
  - Shows success and may include `UpcomingAppointmentsList`.

Patient APIs:
- `/api/patient/profile.get`
  - GET.
  - Require auth.
  - Returns current patient profile or null.
- `/api/patient/profile.put`
  - PUT.
  - Require auth.
  - Validate via `ProfileSchema`.
  - Hash + mask NRIC.
  - Upsert `patient_profiles` with `user_id = auth user`.
- `/api/doctors/index.get`
  - GET.
  - Public.
  - Returns active doctors.
- `/api/slots/index.get`
  - GET.
  - Query: `doctor_id`, `date`.
  - Uses `getAvailableSlots`.
- `/api/appointments/book.post`
  - POST.
  - Require auth.
  - Validate via `BookAppointmentSchema`.
  - Ensure `patient_profile` exists.
  - Insert appointment.
  - (Phase 4) Fire-and-forget Twilio confirmation.
- `/api/appointments/mine.get`
  - GET.
  - Require auth.
  - Return appointments for current patient.

### 5.2 Staff / Doctor

Pages:
- `/staff/login`
  - Staff login form (Supabase magic link).
- `/staff/appointments`
  - Staff dashboard:
    - Today’s appointments.
    - Uses `TodayAppointmentsTable` + `QueueControls`.

Staff APIs:
- `/api/staff/appointments.get`
  - GET.
  - Require auth + staff role.
  - Returns today’s appointments with:
    - `patient_full_name`
    - `doctor_name`
    - `status`
    - `queue_number`
- `/api/staff/appointment-status.post`
  - POST.
  - Require auth + staff role.
  - Input: `appointment_id`, `status`.
  - On `arrived`:
    - Assign queue number via `getNextQueueNumber` if missing.
  - Update appointment.

### 5.3 Cron / Notifications

- `/api/cron/reminders.post`
  - POST.
  - Auth via `CRON_SECRET` (e.g., `Authorization: Bearer <CRON_SECRET>`).
  - Finds `booked` appointments in next 24h.
  - Sends reminders via `sendAppointmentReminder`.
  - Records in `notifications`.

Agents:
- When implementing/altering APIs:
  - Preserve method semantics, status codes, and validation.
  - Prefer explicit Zod schemas.
  - Always wrap `requireAuth` in try/catch and map to 401/403.

---

## 6. Frontend Design System Expectations

Baseline:
- Mantine is primary UI library.
- `src/styles/globals.css`:
  - Includes resets.
  - Imports `tokens.css` defining:
    - Colors, fonts, radii, shadows.

UI Components (as per `phaseX-static-app`):
- `src/components/ui/button.tsx` → `UiButton`
- `src/components/ui/card.tsx` → `UiCard`
- `src/components/ui/badge.tsx` → `UiBadge`
- `src/components/ui/section.tsx` → `Section`
- Optional `/style-guide` page to visualize tokens/components.

UX rules:
- Senior-friendly:
  - Large font sizes for primary flows.
  - High contrast.
  - Clear affordances.
- Minimal JS:
  - Prefer server-driven / API-driven data.
  - Avoid obfuscated client state.

Agents:
- For new UI:
  - Use Mantine + these primitives.
  - Match the tone of the landing mockup.
  - Avoid introducing competing UI frameworks.

---

## 7. Testing & QA Expectations

Planned tooling:
- Jest for:
  - Unit tests:
    - `lib/slots.ts`
    - `lib/queue.ts`
  - Integration tests:
    - API handlers with mocked `supabaseServer`, `requireAuth`, etc.
- Playwright for:
  - Minimal E2E:
    - Landing loads.
    - `/book` accessible.
    - (Extended) Happy path: login → profile → book → staff view.

Key points:
- Tests must:
  - Use module mocks (no real Supabase/Twilio in unit/integration).
  - Respect architecture (no hitting production services).
- Manual QA scripts:
  - Defined in docs; cover:
    - Patient flow.
    - Staff flow.
    - RLS and role separation.

Agents:
- When adding/changing behavior:
  - Update or add tests in `tests/` following existing patterns.
  - Do not add heavy frameworks or complex test infra.

---

## 8. Operational & Security Rules For Agents

1) Environment Variables:
- Public:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_CLINIC_*`
- Server-only:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL` (if used)
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_SMS_FROM`
  - `CRON_SECRET`
  - `NRIC_HASH_SECRET`
- Never:
  - Log secrets.
  - Expose server-only keys to client bundles.

2) Auth & RLS:
- Always:
  - Use `requireAuth` for patient-specific or staff-specific APIs.
  - For staff routes, assert `staff_profiles` role.
- Never:
  - Bypass with raw service-role queries that ignore RLS intent.
  - Query by plain NRIC; always via `patient_profiles` + `auth.uid()` pattern.

3) Error Handling:
- API handlers:
  - 405 for wrong methods.
  - 401 if no/invalid auth.
  - 403 if not staff.
  - 400 for validation failures (with details).
  - 500 for unexpected errors (logged, non-sensitive).
- Notifications:
  - Fail silently (log & `notifications` record) without breaking main flow.

4) Code Style:
- TypeScript everywhere.
- Keep files small and focused.
- Use consistent imports:
  - `@/lib/...`, `@/components/...`, `@/pages/api/...` as configured.
- Avoid:
  - Introducing new core infrastructure (Prisma, tRPC, NextAuth, etc.) unless explicitly requested.

---

## 9. How To Safely Handle Future PRs (Agent Checklist)

Before making any change:
1) Read:
   - This file: [AGENT.md](AGENT.md:1)
   - [docs/project_review_and_codebase_understanding.md](docs/project_review_and_codebase_understanding.md:1)
   - [docs/master_execution_todo_checklist.md](docs/master_execution_todo_checklist.md:1)
   - Relevant phase doc(s) for the area you’re modifying.

2) Verify context:
   - Does the change align with:
     - Single clinic assumption?
     - RLS and PDPA constraints?
     - Senior-first simplicity?
     - Existing file/route conventions?

3) When editing:
   - Respect existing helper libraries; do not duplicate logic.
   - Keep API contracts backward-compatible unless spec says otherwise.
   - Ensure schema usage matches `database_schema.sql`.

4) After editing:
   - For APIs:
     - Check for correct HTTP methods, status codes, try/catch.
   - For components:
     - Ensure imports are valid.
     - No reference to undefined routes.
   - For DB interactions:
     - Confirm table/column names match schema.
   - For queue/slots:
     - Maintain deterministic behavior; avoid “smart” logic.

5) Prefer minimal diffs:
   - Make focused, well-scoped changes.
   - Update corresponding docs/tests if behavior changes.

If uncertain:
- Default to simpler, more explicit behavior.
- Do not introduce new concepts without grounding them in:
  - PRD
  - PAD
  - This AGENT guide

---

## 10. Summary

If you are an AI coding agent:

- Treat this AGENT.md as your operating manual.
- Combine it with the existing docs and schema; they are consistent by design.
- Your priorities:
  1) Do not break core patient/staff flows.
  2) Do not weaken security/RLS/PDPA posture.
  3) Maintain senior-friendly, staff-friendly simplicity.
  4) Keep the implementation aligned with the existing architectural blueprint.

Follow these rules, and you can implement features and fixes with minimal supervision and high confidence.
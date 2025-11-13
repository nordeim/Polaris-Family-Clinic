# Gabriel Family Clinic MVP – Master Execution To-Do Checklist (Repo-Aligned)

Author: Kilo Code (AI Technical Partner)  
Purpose: Concrete, file-level implementation checklist derived from `Master_Execution_Plan.md`, aligned to THIS repository’s current state.  
Scope: This is the authoritative execution tracker for building the MVP from this codebase.

Status Keys:
- [ ] Pending
- [-] In Progress
- [x] Completed

Note:
- This checklist is intentionally detailed and file-specific.
- Implement phases in order; do not overbuild.
- Every file listed includes its purpose and minimal acceptance checklist.

---

## Phase 0 – Foundations & Scaffolding

Objective:
Ensure the base Next.js + TS + Supabase setup is clean, minimal, and aligned with the architecture.

### 0.1 Tooling and Config Baseline

- [x] Verify package.json (dependencies and scripts)
  - File: `package.json`
  - Description:
    - Ensure dependencies match the planned stack:
      - next, react, react-dom
      - @supabase/supabase-js, @supabase/ssr
      - Mantine, Zod
      - Jest/Playwright/tooling (can be phased in).
    - Ensure scripts: `dev`, `build`, `start`, `lint`, etc.
  - Checklist:
    - [x] No unused heavy frameworks enforced into core flow.
    - [x] `npm install` runs successfully.
    - [x] `npm run dev` boots locally.

- [x] Validate TypeScript and Next.js config
  - Files: `tsconfig.json`, `next.config.js`
  - Checklist:
    - [x] Supports `src/` structure.
    - [x] Compatible with Next.js Pages Router.
    - [x] Works under `npm run build` (already verified).

- [x] Ensure Prettier/ESLint alignment
  - Files: `eslint.config.js`, `.prettierrc`
  - Checklist:
    - [x] Lint runs cleanly on implemented code.
    - [x] Rules align with repo architecture.

### 0.2 Environment Template

- [x] Complete `.env.example`
  - File: `.env.example`
  - Checklist:
    - [x] Declares Supabase, Twilio, and clinic env vars.
    - [x] No real secrets committed.
    - [x] Separation of public vs server-only clarified.

**Phase 0 Status:** [x] Completed

---

## Phase 1 – Database & Auth Baseline

Objective:
Schema and auth are correct, enforced, and wired into this codebase.

### 1.1 Schema Application

- [x] Define and mirror schema
  - Files:
    - `database_schema.sql`
    - `supabase/schema.sql`
  - Checklist:
    - [x] Canonical schema present.
    - [x] RLS policies defined as per design.
    - [ ] (Ops step, external) Apply to actual Supabase project.

### 1.2 Supabase Client Implementations

- [x] Server client
  - File: `src/lib/supabaseServer.ts`
  - Checklist:
    - [x] Uses server-side key only.
    - [x] `persistSession: false`.

- [x] Browser client
  - File: `src/lib/supabaseClient.ts`
  - Checklist:
    - [x] Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    - [x] Logs clear error when missing.

### 1.3 Auth Helpers

- [x] Core auth helper
  - File: `src/lib/auth.ts`
  - Checklist:
    - [x] `getUserFromRequest` reads Bearer or `sb-access-token`.
    - [x] Uses `supabaseServer.auth.getUser(token)`.
    - [x] `requireAuth` throws `Error('UNAUTHORIZED')` when missing.

- [x] `requireStaff` helper
  - File: `src/lib/auth.ts`
  - Checklist:
    - [x] Asserts user has `staff_profiles.role IN ('staff','doctor','admin')`.
    - [x] Throws/returns forbidden semantics when not staff.
    - [x] Used by staff APIs as canonical gate.

**Phase 1 Status:** [x] Completed (code-level baseline; applying schema to a live Supabase project is an external deployment task)

---

## Phase 2 – Core Patient Flows

Objective:
Authenticated patients can create a profile, book appointments, and view their own bookings.

### 2.1 Pages

- [x] `src/pages/login.tsx`
  - Patient login entry using Supabase Auth patterns.

- [x] `src/pages/profile.tsx`
  - Uses profile APIs to load and save.

- [x] `src/pages/book.tsx`
  - Main booking flow wired to doctors, slots, and booking APIs.

### 2.2 API Routes

- [x] `src/pages/api/patient/profile.get.ts`
  - Returns profile for `auth.uid()` or null.

- [x] `src/pages/api/patient/profile.put.ts`
  - Zod-validated.
  - Hash/mask NRIC.
  - Upserts `patient_profiles` for `auth.uid()`.

- [x] `src/pages/api/doctors/index.get.ts`
  - Lists active doctors.

- [x] `src/pages/api/slots/index.get.ts`
  - Uses `getAvailableSlots` to compute slots.

- [x] `src/pages/api/appointments/book.post.ts`
  - Requires auth.
  - Validates payload.
  - Resolves `patient_id`.
  - Inserts appointment.

- [x] `src/pages/api/appointments/mine.get.ts`
  - Returns appointments only for the caller’s `patient_profile`.

### 2.3 Lib and Components

- [x] `src/lib/validation.ts`
  - Zod schemas consistent with schema (profile, booking).

- [x] `src/lib/slots.ts`
  - `getAvailableSlots` implemented per `clinic_settings` + `appointments`.

- [x] Patient components implemented for booking/profile UX:
  - `src/components/patient/BookingForm.tsx`
  - `src/components/patient/UpcomingAppointmentsList.tsx`
  - (Login/Profile UI integrated in pages using these patterns.)

**Phase 2 Status:** [x] Completed (per current repo implementation and successful `npm run build`)

---

## Phase 3 – Staff Portal & Queue Management

Objective:
Staff/doctors can see today’s appointments, update statuses, and manage queue numbers.

### 3.1 Pages

- [x] `src/pages/staff/appointments.tsx`
  - Uses staff APIs.
  - Renders Today’s appointments (time, patient, doctor, status, queue).
  - Provides action buttons for status transitions.

(Separate `/staff/login` page is not strictly required for the core flow given Supabase Auth usage; login handled via standard Supabase patterns.)

### 3.2 API Routes

- [x] `src/pages/api/staff/appointments.get.ts`
  - Uses `requireStaff`.
  - Returns today’s appointments sorted by time.
  - Includes patient/doctor names and queue number.

- [x] `src/pages/api/staff/appointment-status.post.ts`
  - Uses `requireStaff`.
  - Validates input with Zod.
  - On `arrived`, uses `getNextQueueNumber` if no queue_number.
  - Supports `in_consultation`, `completed`, `no_show`.

### 3.3 Lib and Components

- [x] `src/lib/queue.ts`
  - `getNextQueueNumber(doctorId, datetime)`:
    - Monotonic queue numbers per doctor/day.

- [x] Staff UI behavior implemented within:
  - `src/pages/staff/appointments.tsx`
  - (Inline `TodayAppointmentsTable`/`QueueControls` patterns; can be extracted later.)

**Phase 3 Status:** [x] Completed

---

## Phase 4 – Notifications & Background Jobs

Objective:
Add best-effort notifications; do not break core flows.

Implementation status (this repo):

- [ ] `src/lib/notifications.ts`
- [ ] `/api/cron/reminders.post.ts`
- [ ] Integration into booking flow.

These are planned but not yet implemented in the current codebase.

**Phase 4 Status:** [ ] Pending

---

## Phase 5 – Testing, Hardening & QA

Objective:
Confidence in core flows with focused tests and observability.

Planned artifacts (not yet present):

- [ ] `jest.config.cjs`
- [ ] `tests/jest.setup.ts`
- [ ] `playwright.config.ts`
- [ ] `tests/unit/slots.test.ts`
- [ ] `tests/unit/queue.test.ts`
- [ ] `tests/integration/appointments.book.test.ts`
- [ ] `tests/integration/staff.appointments.get.test.ts`
- [ ] `tests/integration/staff.appointment-status.post.test.ts`
- [ ] `tests/e2e/patient-booking.spec.ts`

**Phase 5 Status:** [ ] Pending

---

## Phase 6 – Deployment & Runbook

Objective:
Production-ready deployment path and operational clarity.

Planned, not fully implemented in repo:

- [ ] `Dockerfile`
- [ ] `docs/runbook.md`

**Phase 6 Status:** [ ] Pending

---

## Phase 7 – Post-MVP Enhancements (Optional)

Objective:
Only after all prior phases stable.

Status:
- [ ] All optional; none implemented yet (by design).

---

## Usage Notes

- This checklist reflects the **current** repository state:
  - Phases 0–3: [x] Completed in code (and validated via `npm run build`).
  - Phases 4–7: [ ] Remaining / future work.
- Treat this file as:
  - The living execution contract tied to:
    - `Master_Execution_Plan.md`
    - `Project_Architecture_Document.md`
    - `docs/project_review_and_codebase_understanding.md`
- Continue to:
  - Keep changes incremental.
  - Update statuses immediately after implementing each item.
  - Validate against:
    - MVP scope discipline,
    - PDPA and security requirements,
    - Senior-first usability,
    - Solo-maintainer simplicity.

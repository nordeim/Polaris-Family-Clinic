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

- [ ] Verify package.json (dependencies and scripts)
  - File: `package.json`
  - Description:
    - Ensure dependencies match the planned stack:
      - next, react, react-dom
      - @supabase/supabase-js, @supabase/ssr
      - Mantine, Zod, React Hook Form
      - Jest/Playwright/tooling as per docs (can be phased in).
    - Ensure scripts: `dev`, `build`, `start`, `lint`, `test`, etc.
  - Checklist:
    - [ ] No unused heavy frameworks (Prisma, tRPC, NextAuth, etc.) unless explicitly decided.
    - [ ] `npm install` runs successfully.
    - [ ] `npm run dev` boots locally.

- [ ] Validate TypeScript and Next.js config
  - Files: `tsconfig.json`, `next.config.js`
  - Description:
    - Configs support `src/` structure, strict TS, and align with documented paths.
  - Checklist:
    - [ ] `tsc --noEmit` passes (post-implementation).
    - [ ] Next-specific options compatible with Pages Router.

- [ ] Ensure Prettier/ESLint alignment
  - Files: `eslint.config.js`, `.prettierrc`
  - Checklist:
    - [ ] Lint runs cleanly on new code.
    - [ ] Style rules support current architecture (no conflicting assumptions).

### 0.2 Environment Template

- [ ] Complete `.env.example`
  - File: `.env.example`
  - Description:
    - Must declare all required keys:
      - `NEXT_PUBLIC_SUPABASE_URL`
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - `SUPABASE_SERVICE_ROLE_KEY`
      - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM`
      - `NEXT_PUBLIC_CLINIC_NAME`, `NEXT_PUBLIC_CLINIC_ADDRESS`, `NEXT_PUBLIC_CLINIC_PHONE`
  - Checklist:
    - [ ] No secrets or real keys committed.
    - [ ] Comments clarify which keys are server-only vs public.

---

## Phase 1 – Database & Auth Baseline

Objective:
Schema and auth are correct, enforced, and wired into this codebase.

### 1.1 Schema Application

- [ ] Apply and validate schema
  - Files:
    - `database_schema.sql`
    - `supabase/schema.sql`
  - Checklist:
    - [ ] Schema applied to Supabase project without errors.
    - [ ] RLS enabled as per file.
    - [ ] Test data:
      - [ ] At least one test patient_profile (via Supabase UI for now).
      - [ ] At least one staff_profile and doctor for later phases.

### 1.2 Supabase Client Implementations

- [x] Server client (present, verify)
  - File: `src/lib/supabaseServer.ts`
  - Description:
    - Server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY`.
  - Checklist:
    - [x] Uses non-public key only.
    - [x] `persistSession: false`.
    - [ ] Document usage constraints in comments/doc.

- [x] Browser client (present, verify)
  - File: `src/lib/supabaseClient.ts`
  - Checklist:
    - [x] Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    - [x] Logs clear error when missing.

### 1.3 Auth Helpers

- [x] Core auth helper (present, verify)
  - File: `src/lib/auth.ts`
  - Description:
    - `getUserFromRequest(req)` and `requireAuth(req)`.
  - Checklist:
    - [x] Reads Bearer token or `sb-access-token`.
    - [x] Uses `supabaseServer.auth.getUser(token)`.
    - [ ] Document usage for all future API handlers.

- [ ] Add `requireStaff` helper
  - File: `src/lib/auth.ts`
  - Description:
    - Helper to assert user is in `staff_profiles` with role in (`staff`, `doctor`, `admin`).
  - Checklist:
    - [ ] Throws or returns 403-style signal on non-staff.
    - [ ] Reused across staff API endpoints.

---

## Phase 2 – Core Patient Flows

Objective:
Authenticated patients can create a profile, book appointments, and view their own bookings.

### 2.1 Pages

- [ ] `src/pages/login.tsx`
  - Description:
    - Entry point for patient login/register (via Supabase Auth).
    - Simple UX: input phone/email → OTP/magic link (exact method determined by final auth choice).
  - Checklist:
    - [ ] On success, redirects user to `/profile` or `/book`.
    - [ ] Very large, senior-friendly UI.

- [ ] `src/pages/profile.tsx`
  - Description:
    - Shows and edits patient profile.
  - Checklist:
    - [ ] Calls `/api/patient/profile` GET to load.
    - [ ] Calls `/api/patient/profile` PUT to save.
    - [ ] Enforces required fields (full name, NRIC, DOB).

- [ ] `src/pages/book.tsx`
  - Description:
    - Main booking experience.
  - Checklist:
    - [ ] If not authenticated → prompt to login.
    - [ ] If no profile → link/redirect to `/profile`.
    - [ ] Renders booking form (doctor/date/slot).

### 2.2 API Routes

Each handler:
- Uses `requireAuth`.
- Returns typed JSON.
- Avoids leaking sensitive data.

- [ ] `src/pages/api/patient/profile.get.ts`
  - Checklist:
    - [ ] Fetch `patient_profiles` by `auth.uid()`.
    - [ ] Return 404 or empty if not exists.

- [ ] `src/pages/api/patient/profile.put.ts`
  - Checklist:
    - [ ] Validate input with Zod.
    - [ ] Compute `nric_hash` and `nric_masked`.
    - [ ] Upsert `patient_profiles` for `auth.uid()`.
    - [ ] Respect RLS constraints.

- [ ] `src/pages/api/doctors/index.get.ts`
  - Checklist:
    - [ ] Public list of `doctors` where `is_active = true`.
    - [ ] Return minimal info (id, name, languages, photo_url).

- [ ] `src/pages/api/slots/index.get.ts`
  - Checklist:
    - [ ] Accept `doctor_id`, `date`.
    - [ ] Use `getAvailableSlots` (Phase 2.3).
    - [ ] Return Booker-friendly slot list.

- [ ] `src/pages/api/appointments/book.post.ts`
  - Checklist:
    - [ ] Auth required.
    - [ ] Validate payload (doctor_id, scheduled_start).
    - [ ] Resolve `patient_id` from `patient_profiles`.
    - [ ] Check slot availability (via `slots.ts`).
    - [ ] Insert appointment; rely on DB/RLS.
    - [ ] No queue_number yet.

- [ ] `src/pages/api/appointments/mine.get.ts`
  - Checklist:
    - [ ] Returns only appointments for the current user’s `patient_profile`.
    - [ ] Confirm RLS + query restrictions are consistent.

### 2.3 Lib and Components

- [ ] `src/lib/validation.ts`
  - Description:
    - Zod schemas: profile, booking input, etc.
  - Checklist:
    - [ ] Mirrors `database_schema.sql` constraints.
    - [ ] Reused across API handlers.

- [ ] `src/lib/slots.ts`
  - Description:
    - `getAvailableSlots(doctorId, date)` reading `clinic_settings` and `appointments`.
  - Checklist:
    - [ ] Deterministic and timezone-aware.
    - [ ] Prevents double-booking.

- [ ] `src/components/patient/LoginForm.tsx`
- [ ] `src/components/patient/ProfileForm.tsx`
- [ ] `src/components/patient/BookingForm.tsx`
- [ ] `src/components/patient/UpcomingAppointmentsList.tsx`
  - Checklist (shared):
    - [ ] Mobile-first, large touch targets.
    - [ ] Clear error and loading states.
    - [ ] No unnecessary complexity.

---

## Phase 3 – Staff Portal & Queue Management

Objective:
Staff and doctors can run the clinic day: see appointments, update statuses, manage queue numbers.

### 3.1 Pages

- [ ] `src/pages/staff/login.tsx`
  - Checklist:
    - [ ] Uses Supabase Auth.
    - [ ] On success, redirects to `/staff/appointments`.

- [ ] `src/pages/staff/appointments.tsx`
  - Checklist:
    - [ ] Calls `/api/staff/appointments` to fetch today’s appointments.
    - [ ] Renders table with `TodayAppointmentsTable`.
    - [ ] Integrates `QueueControls` for status changes.

### 3.2 API Routes

- [ ] `src/pages/api/staff/appointments.get.ts`
  - Checklist:
    - [ ] Uses `requireAuth` + `requireStaff`.
    - [ ] Returns today’s appointments sorted by time.
    - [ ] Includes masked patient info where appropriate.

- [ ] `src/pages/api/staff/appointment-status.post.ts`
  - Checklist:
    - [ ] Requires staff role.
    - [ ] Validates new status.
    - [ ] On `arrived`, assigns queue number if missing using `getNextQueueNumber`.

### 3.3 Lib and Components

- [ ] `src/lib/queue.ts`
  - Description:
    - `getNextQueueNumber(doctorId, datetime)` using that doctor’s appointments for the day.
  - Checklist:
    - [ ] Monotonic sequence (e.g., A001, A002…).
    - [ ] Safe under concurrent calls.

- [ ] `src/components/staff/StaffLoginForm.tsx`
- [ ] `src/components/staff/TodayAppointmentsTable.tsx`
- [ ] `src/components/staff/QueueControls.tsx`
  - Checklist:
    - [ ] Clear and minimal UI.
    - [ ] No over-styling; focus on usability and correctness.

---

## Phase 4 – Notifications & Background Jobs

Objective:
Add best-effort Twilio notifications; ensure they never break core flows.

- [ ] `src/lib/notifications.ts`
  - Description:
    - Twilio client wrapper.
    - Functions like `sendBookingConfirmation(...)`, `sendReminder(...)`.
  - Checklist:
    - [ ] Reads Twilio creds from env.
    - [ ] Logs failures; does not throw in a way that breaks bookings.

- [ ] Integrate in `book.post.ts`
  - Checklist:
    - [ ] After successful appointment creation, enqueue/log notification.
    - [ ] Handle failure as non-fatal.

- [ ] `src/pages/api/cron/reminders.post.ts`
  - Checklist:
    - [ ] Authenticated via secret/header or Supabase scheduler.
    - [ ] Selects upcoming appointments within next 24h.
    - [ ] Sends reminders via `notifications.ts`.
    - [ ] Idempotent behavior.

---

## Phase 5 – Testing, Hardening & QA

Objective:
Confidence in core flows with focused tests and observability.

- [ ] `jest.config.cjs`
- [ ] `tests/jest.setup.ts`
- [ ] `playwright.config.ts`
- [ ] `tests/unit/slots.test.ts`
- [ ] `tests/unit/queue.test.ts`
- [ ] `tests/integration/appointments.book.test.ts`
- [ ] `tests/integration/staff.appointments.get.test.ts`
- [ ] `tests/integration/staff.appointment-status.post.test.ts`
- [ ] `tests/e2e/patient-booking.spec.ts`

Checklists (global):

- [ ] Unit tests cover `slots.ts`, `queue.ts`, `validation` logic.
- [ ] Integration tests exercise booking and staff APIs with mocked Supabase.
- [ ] E2E test validates full happy path:
  - Login → profile → booking → staff view → status update.

---

## Phase 6 – Deployment & Runbook

Objective:
Production-ready deployment path and operational clarity.

- [ ] `Dockerfile`
  - Multi-stage build, aligned with Next.js best practices.

- [ ] `docs/runbook.md`
  - Contains:
    - How to configure Supabase and Vercel.
    - How to create staff profiles and doctors.
    - How to verify RLS.
    - Fallback procedures (paper, phone) for outages.

Checklists:

- [ ] Deployment to Vercel using environment variables.
- [ ] Supabase project secured (no leaked service role).
- [ ] One full E2E test executed on production environment.

---

## Phase 7 – Post-MVP Enhancements (Optional)

Only after all previous checklists are green.

Potential files (not mandatory for MVP):

- `src/pages/api/consult-notes/*`
- `src/pages/api/mc/*`
- `src/pages/reports/*`
- Additional tables/migrations for MC PDFs, SOAP notes, analytics, etc.

Checklists:

- [ ] Each enhancement gated by explicit decision.
- [ ] Each implemented as isolated, reversible migrations and modules.
- [ ] Core MVP flows remain simple and stable.

---

## Usage Notes

- Treat this document as the living execution contract tied to:
  - `Master_Execution_Plan.md`
  - `Project_Architecture_Document.md`
  - `project_review_and_codebase_understanding.md`
- Update statuses as phases are implemented.
- Keep changes incremental and reviewable:
  - Prefer small PRs focused on one checklist area.
- Always validate against:
  - MVP scope discipline,
  - PDPA and security requirements,
  - Senior-first usability,
  - Solo-maintainer simplicity.

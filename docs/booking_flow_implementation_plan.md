# Gabriel Family Clinic – Core Booking Flow Design & Implementation Plan

Author: Kilo Code (AI Technical Partner)  
Scope: Define an end-to-end, production-grade booking experience for `/_book` and related APIs, aligned with PRD, PAD, AGENT.md, and `database_schema.sql`. This document is the execution spec for implementing the booking flows in this repo.

---

## 1. Booking Model: What “Good” Looks Like

### 1.1 Real-World Goals

For patients (Mdm Tan & caregivers):

- Discoverable:
  - Clear entry from `/` (“Book an Appointment”).
- Frictionless auth:
  - Login via Supabase Auth (OTP/magic link).
  - No passwords or confusing redirects.
- Single profile:
  - Create/update `patient_profile` exactly once; reused for all bookings.
- Confident booking:
  - See:
    - Active doctors.
    - Only valid days (within booking window).
    - Only valid slots (respecting clinic hours, no double booking).
  - Get clear confirmation with date/time/doctor.
- Ownership:
  - View upcoming appointments at any time.

For staff:

- Predictable data:
  - Appointments created only when:
    - Patient is authenticated.
    - Patient has a `patient_profile`.
    - Slot is actually available.
- Simple queues:
  - Queue number assigned on arrival (staff flow), not at booking.
- No manual cleanups:
  - No duplicate phantom appointments.
  - No inconsistent time formats.

### 1.2 Core Invariants (Must Always Hold)

Aligned with `database_schema.sql` and AGENT.md:

- Identity:
  - `auth.users.id` is the root identity.
- Patient:
  - `patient_profiles.user_id` = `auth.uid()`.
- Booking:
  - Every appointment row:
    - Has valid `patient_id` (FK to `patient_profiles`).
    - Has valid `doctor_id` (FK to `doctors`).
    - `scheduled_start` is within clinic hours and booking window.
    - Is unique per (doctor, timeslot) → no double-booking for same slot.
- Access:
  - Patients:
    - Can only see their own appointments (via RLS).
  - Staff:
    - Can see all appointments (via `staff_profiles` + policies).

---

## 2. End-to-End Booking Flow (Happy Path)

1) Patient lands on `/` (already implemented).
   - Clicks “Book an Appointment” → go to `/book`.

2) `/book`:
   - If not authenticated:
     - Shows a clear prompt:
       - “Please sign in with your mobile/email to book.”
       - CTA → `/login` (or embedded Supabase auth flow).
     - No booking form yet.
   - If authenticated:
     - Checks via `/api/patient/profile`:
       - If no profile:
         - Prompt to complete profile (name, NRIC, DOB, etc.).
       - If exists:
         - Show booking form.

3) Booking form (for authenticated + profiled user):
   - Steps (on one page, minimal friction):
     1. Select Doctor:
        - List from `/api/doctors` (active doctors only).
     2. Select Date:
        - Calendar/selector limited to `booking_window_days` from `clinic_settings`.
     3. Select Time Slot:
        - Slots from `/api/slots?doctor_id=...&date=...`
        - Only free slots; disabled otherwise.
     4. Optional Short Reason:
        - Simple textarea (e.g., “cough, fever 3 days”).
   - Submit:
     - POST `/api/appointments/book` with `doctor_id`, `scheduled_start`, optional `reason`.
   - On success:
     - Show appointment summary and link to:
       - “View my appointments” (`/appointments` or integrated on `/book`).

4) Appointment storage:
   - `appointments` row inserted:
     - `patient_id` from `patient_profiles` (auth-bound).
     - `doctor_id` as chosen.
     - `scheduled_start` as ISO string.
     - `status = 'booked'`.
   - Notification:
     - Best-effort SMS/WhatsApp (Phase 4; does not block booking).

5) Staff view:
   - On day-of:
     - Staff sees booking in `/staff/appointments` via `/api/staff/appointments.get`.
     - On arrival:
       - Staff marks `arrived` via `/api/staff/appointment-status.post` and queue number assigned.

---

## 3. Edge Cases & Failure Modes

We design the APIs and UI to handle:

1) Unauthenticated user:
   - `/book` must not show a working booking form.
   - Shows prompt + CTA to login.

2) Missing profile:
   - Authenticated but no `patient_profiles` row:
     - `/book` must require profile creation first.
   - Prevents orphan appointments.

3) Slot race conditions:
   - Two users pick same slot:
     - `/api/appointments/book` validates at insert time:
       - Check no existing appointment for `(doctor_id, scheduled_start)` (within small tolerance).
       - If conflict, 409/400 with “slot taken” message.

4) Invalid input:
   - All API inputs validated via Zod:
     - Doctor ID is UUID of active doctor.
     - `scheduled_start` is ISO string, aligned with allowed slots.
     - Reason length capped.

5) Out-of-window bookings:
   - If user tries to POST a date outside `booking_window_days` or outside clinic hours:
     - Reject with 400.

6) RLS / identity failures:
   - If auth token missing/invalid:
     - `/api/patient/*`, `/api/appointments/book`, `/api/appointments/mine` return 401.
   - If `patient_profile` not linked:
     - Book endpoint returns 400 (“Profile not found”).

7) Robustness:
   - If `/api/doctors` or `/api/slots` fail:
     - UI shows friendly error and no partial submission.

---

## 4. Implementation Plan (Phased, Repo-Aligned)

This repo currently has:

- Core APIs for:
  - `/api/patient/profile.get|put`
  - `/api/doctors/index.get`
  - `/api/slots/index.get`
  - `/api/appointments/book.post`
  - `/api/appointments/mine.get`
  - `/api/staff/*`
- No `/book` page, no `/login` page, and no shared booking components yet.

We now define a concrete implementation plan.

### Phase 1 – Booking Page Shell & Navigation

Objective:
- Create `/book` page route and ensure it is reachable from landing and behaves safely (no form for unauthenticated users).

Files:

1) `src/pages/book.tsx`
   - Description:
     - Booking entry page.
     - Renders:
       - Auth gating.
       - Profile check.
       - BookingForm once prerequisites are met.
   - Checklist:
     - [ ] If user not authenticated → show hero-like card:
       - “Please sign in to book” + CTA link to `/login` or Supabase auth flow.
     - [ ] If authenticated but profile missing → show message + CTA to `/profile` (to be implemented) or inline ProfileForm (later phase).
     - [ ] If authenticated + profile OK → render `<BookingForm />`.
     - [ ] Use layout/typography consistent with landing page.

2) Update navigation hooks:
   - Ensure:
     - Landing page CTAs that intend to book:
       - use `href="/book"` (already for primary CTA).
   - Checklist:
     - [ ] All “Book an Appointment” / “Try booking experience” CTAs correctly target `/book`.

### Phase 2 – Booking Components (Patient UI)

Objective:
- Encapsulate booking UX in reusable components.

Files:

1) `src/components/patient/BookingForm.tsx`
   - Description:
     - Core booking form (used by `/book`).
   - Behavior:
     - On mount:
       - Fetch doctors via `/api/doctors`.
       - Once doctor & date selected:
         - Fetch slots via `/api/slots`.
     - Show:
       - Select doctor dropdown.
       - Date picker (or simple date-select).
       - Slot picker.
       - Optional reason text field.
     - On submit:
       - Call `/api/appointments/book`.
       - Handle success:
         - Show confirmation UI (inline, no redirect required).
       - Handle errors gracefully:
         - Slot taken, validation errors, network errors.
   - Checklist:
     - [ ] Uses Mantine components + ui primitives.
     - [ ] Disables submission until doctor, date, slot are set.
     - [ ] Displays loading and error states.
     - [ ] Accessible (labels, focus states, large targets).

2) `src/components/patient/UpcomingAppointmentsList.tsx`
   - Description:
     - Shows upcoming appointments via `/api/appointments/mine`.
   - Checklist:
     - [ ] Only rendered for authenticated users.
     - [ ] Renders status, date/time, doctor, with clear typography.
     - [ ] Handles empty state.

(Phase 2 assumes `/login` and `/profile` will exist or be added; see later phases.)

### Phase 3 – Supporting Libs & Validation

Objective:
- Ensure the booking APIs enforce our invariants and are easy to consume.

Files:

1) `src/lib/validation.ts`
   - Schemas:
     - `ProfileSchema`:
       - `full_name`, `nric`, `dob`, `language`, `chas_tier`.
     - `BookAppointmentSchema`:
       - `doctor_id` (UUID).
       - `scheduled_start` (ISO string).
       - Optional `reason`.
   - Checklist:
     - [ ] Schemas mirror `database_schema.sql`.
     - [ ] Export types for handler use.

2) `src/lib/slots.ts`
   - `getAvailableSlots(doctorId: string, date: string)`:
     - Reads:
       - `clinic_settings` for slot_duration_min, working window, booking_window_days.
       - `appointments` for existing bookings.
     - Returns:
       - Array of available datetime strings.
   - Checklist:
     - [ ] Deterministic.
     - [ ] No double-bookings.
     - [ ] Considers timezone (Asia/Singapore).

3) Validation in APIs:
   - `src/pages/api/appointments/book.post.ts`:
     - Use `BookAppointmentSchema`.
     - Enforce:
       - Patient has `patient_profile`.
       - Chosen slot is still free via `appointments` check.
   - `src/pages/api/slots/index.get.ts`:
     - Uses `getAvailableSlots`.

### Phase 4 – Auth & Profile Integration

Objective:
- Ensure `/book` experience works with real auth & profile.

Files:

1) `src/pages/login.tsx`
   - Simple page using Supabase Auth (magic link / OTP).
   - Checklist:
     - [ ] On success, send user back to `/book` or `/profile`.

2) `src/pages/profile.tsx`
   - Uses:
     - `/api/patient/profile.get`
     - `/api/patient/profile.put`
   - Renders:
     - ProfileForm (to be added).
   - Checklist:
     - [ ] Must exist before production booking.

3) `src/components/patient/ProfileForm.tsx`
   - Inputs:
     - full_name, NRIC, DOB, language, CHAS (optional).
   - Checklist:
     - [ ] Validates NRIC and masks on display.
     - [ ] On submit, hits `/api/patient/profile.put`.

Integration with `/book`:

- [ ] `/book`:
  - If no profile → show clear prompt to complete profile first.

### Phase 5 – UX & Edge-Case Hardening

Objective:
- Make the booking experience resilient and senior-friendly.

Actions:

- [ ] Add loading indicators in BookingForm for:
  - Fetching doctors.
  - Fetching slots.
  - Submitting booking.
- [ ] Handle slot refresh:
  - If booking fails due to conflict, refetch slots and prompt user.
- [ ] Make date & slot selectors finger-friendly:
  - Large clickable elements.
- [ ] Ensure error messages plain-language:
  - “This time has just been taken. Please choose another slot.”

### Phase 6 – Testing

Objective:
- Critical path coverage.

Files:

1) `tests/unit/slots.test.ts`
   - Tests:
     - Slot generation for:
       - Basic day.
       - When some slots already booked.
       - Out-of-window.

2) `tests/integration/appointments.book.test.ts`
   - Tests:
     - Happy path booking with mocked Supabase.
     - Double-booking rejection.

3) `tests/e2e/patient-booking.spec.ts`
   - Flow:
     - Login (mocked/dev).
     - Create profile.
     - Book appointment.
     - Assert success message and presence in “mine” list.

Checklist:
- [ ] No real Supabase/Twilio calls in tests.
- [ ] All critical branches covered.

---

## 5. Validation of Plan Against PRD/PAD/Schema

- Aligned with PRD:
  - Single clinic.
  - Senior-first, OTP-based auth.
  - Simple booking, no over-features.
- Aligned with PAD:
  - Uses:
    - `/book` page.
    - `/api/doctors`, `/api/slots`, `/api/appointments/book`, `/api/appointments/mine`.
    - `slots.ts`, `validation.ts`.
- Aligned with `database_schema.sql`:
  - Uses `patient_profiles`, `doctors`, `appointments`, `clinic_settings`.
  - Respects RLS via auth-linked `patient_profiles` and staff roles.
- Operationally realistic:
  - Small set of pages and APIs.
  - Clear separation of concerns.
  - Easy for a solo developer to maintain.

---

## 6. Execution Note

This document is now the authoritative blueprint for implementing `/book` and the end-to-end booking experience in this repository.

Next phases to execute (in code), in order:

1) Create `src/pages/book.tsx` wired to auth/profile/BookingForm.
2) Implement `src/components/patient/BookingForm.tsx`.
3) Add `src/lib/validation.ts` and `src/lib/slots.ts` and wire into existing APIs.
4) Add `/login`, `/profile`, `ProfileForm` for full flow.
5) Harden UX and add tests.

Each step must:
- Reuse existing Supabase helpers.
- Respect RLS and schema.
- Maintain senior-friendly UX.

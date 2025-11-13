# Gabriel Family Clinic MVP v1.0 – Project Architecture Document (Updated)

Author: Kilo Code (AI Technical Partner)  
Audience: Solo/full-stack developer(s), AI coding agents, senior reviewers

This document is the canonical Project Architecture Document (PAD) for this repository.  
It is aligned with:

- [`README_new.md`](README_new.md:1)
- [`AGENT_new.md`](AGENT_new.md:1)
- [`database_schema.sql`](database_schema.sql:1)
- [`docs/master_execution_todo_checklist.md`](docs/master_execution_todo_checklist.md:1)
- The current implemented code under `src/`

Use this PAD as the day-to-day architectural reference.

---

## 1. Purpose & Scope

This PAD defines the practical, implementable architecture for the Gabriel Family Clinic MVP.

Optimized for:

- One neighborhood clinic (no multi-tenant complexity).
- One careful developer (or supervised AI agent).
- A 4–6 week path to a safe, working MVP.
- Zero DevOps: Vercel + Supabase (+ Twilio later).
- Senior-first usability.
- PDPA-conscious data handling.

This document is the single source of truth for:

- Tech stack
- Folder structure
- Data model
- API contracts
- Auth + RLS strategy
- How all parts fit together

If a decision is not in this document, choose the simplest option that respects:

- Single clinic
- RLS/PDPA
- Senior-first UX
- Operational simplicity

---

## 2. High-Level Architecture Overview

### 2.1 Core Principles

- **One clinic**
  - No `clinic_id` in v1. All logic assumes a single clinic.
- **One identity**
  - Supabase Auth `auth.uid()` is the root identity.
- **One patient profile per user**
  - `patient_profiles.user_id = auth.uid()` (unique).
- **Few roles**
  - `staff_profiles.role IN ('staff','doctor','admin')`.
- **RLS everywhere**
  - Patients see only their data.
  - Staff/doctor/admin see only what they need.
- **Boring, proven tools**
  - Next.js (Pages Router) + Supabase + Twilio.
- **Minimal MVP**
  - v1 is: login → profile → book → staff view → status/queue.

### 2.2 System Components

**Client (Next.js)**

- Patient-facing:
  - Landing page aligned with static mockup.
  - Login, profile, booking, upcoming appointments.
- Staff-facing:
  - Today’s appointments.
  - Status updates.
  - Queue indicators.

**Backend (Next.js API Routes)**

- API routes under `src/pages/api`:
  - Use `supabaseServer` (service role) server-side only.
  - Use `requireAuth` / `requireStaff` for protected endpoints.
  - Implement business rules (slots, queue, notifications).

**Data (Supabase Postgres)**

- Tables:
  - `patient_profiles`, `staff_profiles`, `doctors`,
  - `clinic_settings`, `appointments`, `notifications`.
- RLS:
  - Implemented per `database_schema.sql`.

**Integrations**

- Supabase Auth:
  - Email magic link or phone OTP.
- Twilio:
  - SMS / WhatsApp planned for confirmations/reminders (best-effort).

---

## 3. Project Structure (Current & Target)

This reflects the actual repo structure and intended target.

```text
Polaris-Family-Clinic/
  README.md                      # Replace with README_new.md
  AGENT.md                       # Replace with AGENT_new.md
  Project_Architecture_Document.md
  Project_Requirements_Document.md
  Master_Execution_Plan.md
  database_schema.sql
  package.json
  tsconfig.json
  next.config.js
  .env.example

  /src
    /pages
      _app.tsx
      index.tsx                  # Dynamic landing, uses layout + ui primitives
      login.tsx                  # Patient login (Supabase Auth integration)
      profile.tsx                # Patient profile page
      book.tsx                   # Booking flow

      /staff
        appointments.tsx         # Staff console (today’s appointments & queue)

      /api
        /patient
          profile.get.ts         # GET current patient profile
          profile.put.ts         # PUT/UPSERT profile (NRIC hash/mask)
        /doctors
          index.get.ts           # GET active doctors
        /slots
          index.get.ts           # GET available slots
        /appointments
          book.post.ts           # POST book appointment
          mine.get.ts            # GET current user’s appointments
        /staff
          appointments.get.ts    # GET today’s appointments (staff only)
          appointment-status.post.ts # POST update status/queue (staff only)
        # (Future) /cron
        #   reminders.post.ts    # POST for reminder cron

    /components
      /layout
        PublicHeader.tsx         # Landing / shell header
      /ui
        button.tsx               # Primary button primitive
        card.tsx                 # Card primitive
        badge.tsx                # Badge primitive
        section.tsx              # Layout section primitive
      /patient
        BookingForm.tsx
        UpcomingAppointmentsList.tsx
      # Staff table/controls may be inline in staff/appointments for now

    /lib
      supabaseClient.ts          # Browser Supabase (anon)
      supabaseServer.ts          # Server Supabase (service role)
      auth.ts                    # getUserFromRequest, requireAuth, requireStaff
      validation.ts              # Zod schemas (profile, booking)
      slots.ts                   # Slot calculation helpers
      queue.ts                   # Queue number helpers
      # notifications.ts (planned)

    /styles
      globals.css                # Global styles
      tokens.css                 # Design tokens (colors, typography, spacing)

  /supabase
    schema.sql                   # Migration-friendly schema

  /docs
    project_review_and_codebase_understanding.md
    master_execution_todo_checklist.md
    project_scaffold_config.md
    phase1_safety-critical_backbone.md
    phase2-superbase-login.md
    phase3-staff-console.md
    phase5-notifications.md
    staff_portal_and_queue_management_plan.md
    README_plan.md

  /static
    index.html                   # Static mockup
    styles/globals.css
    js/landing.js
```

Key points:

- This PAD, `README_new.md`, and `AGENT_new.md` are consistent.
- `docs/master_execution_todo_checklist.md` tracks which parts are implemented.

---

## 4. Data Model & Auth/RLS Strategy

The source of truth is [`database_schema.sql`](database_schema.sql:1). Summary:

### 4.1 Identity & Roles

- Supabase Auth:
  - `auth.users.id` is primary identity.
- `patient_profiles`:
  - One row per `auth.uid()`.
  - Linked via `user_id`.
- `staff_profiles`:
  - One row per staff user.
  - `role` in `staff|doctor|admin`.
- Roles:
  - Determine which APIs/features are accessible.

### 4.2 Row-Level Security

Key patterns:

- Patients:
  - Can select/update their own `patient_profile`.
  - Can select their own `appointments` and `notifications`.
- Staff:
  - Verified by `staff_profiles`.
  - Can select appointments and patient records required for operations.
- Public:
  - Can select `doctors` (active) and `clinic_settings`.

Agent rules:

- Never bypass RLS intent with raw service-role reads exposed to clients.
- Always reason from `auth.uid()`; never from raw NRIC.

---

## 5. Core Runtime Modules

All under `src/lib`. These are canonical; do not duplicate.

### 5.1 supabaseServer.ts

- Creates Supabase client with `SUPABASE_SERVICE_ROLE_KEY`.
- Only used in:
  - `src/pages/api/**/*`
  - Server-only utilities.
- `persistSession: false`.
- Always treat service role key as secret.

### 5.2 supabaseClient.ts

- Creates browser Supabase client from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Used for:
  - Login/logout via Supabase Auth.
  - Limited safe reads.
- Heavy business logic belongs in API routes.

### 5.3 auth.ts

Responsibilities:

- `getUserFromRequest(req)`:
  - Reads JWT from `Authorization: Bearer <token>` or `sb-access-token` cookie.
  - Uses `supabaseServer.auth.getUser(token)`.
- `requireAuth(req)`:
  - Uses `getUserFromRequest`.
  - Throws/indicates `UNAUTHORIZED` if missing/invalid.
- `requireStaff(req)`:
  - Uses `requireAuth`.
  - Verifies `staff_profiles` row with `role IN ('staff','doctor','admin')`.
  - Throws/indicates `FORBIDDEN` if not staff.
  - MUST be used for `/api/staff/*`.

### 5.4 validation.ts

- Zod schemas for:
  - Patient profile inputs (name, NRIC, DOB, language, CHAS tier).
  - Booking inputs (doctor_id, scheduled_start).
- Ensures API handlers have consistent validation.

### 5.5 slots.ts

- `getAvailableSlots(doctorId, date)`:
  - Uses `clinic_settings.slot_duration_min` and configured window.
  - Reads `appointments` to filter booked slots.
  - Returns deterministic slot list.

### 5.6 queue.ts

- `getNextQueueNumber(doctorId, datetime)`:
  - Scope: given doctor + day.
  - Reads existing `queue_number`s.
  - Returns next sequential (e.g. A001 → A002).
- Used only by staff status API to assign queue numbers on `arrived`.

### 5.7 notifications.ts (Planned)

- To be implemented when Phase 4 is reached.
- Wrap Twilio:
  - `sendBookingConfirmation`
  - `sendAppointmentReminder`
- Best-effort only; must not break booking.

---

## 6. Page & API Contracts

This section defines how pages and APIs fit together.

### 6.1 Patient Flows

**Pages**

- `/` (`src/pages/index.tsx`)
  - Dynamic landing aligned with `/static/index.html`.
  - Clear CTAs: Book, Manage Profile, Staff Portal.

- `/login` (`src/pages/login.tsx`)
  - Integrates Supabase Auth for email/OTP login.

- `/profile` (`src/pages/profile.tsx`)
  - Requires auth.
  - Uses `/api/patient/profile.get` to load.
  - Uses `/api/patient/profile.put` to save.

- `/book` (`src/pages/book.tsx`)
  - Requires auth + existing `patient_profile`.
  - Allows doctor + date + slot selection.
  - Submits to `/api/appointments/book.post`.
  - Shows upcoming appointments via `/api/appointments/mine.get`.

**APIs**

- `/api/patient/profile.get`
  - GET, auth required.
  - Returns profile for current `auth.uid()` or 404/null.

- `/api/patient/profile.put`
  - PUT, auth required.
  - Validates input.
  - Hashes + masks NRIC.
  - Upserts `patient_profiles` row for `auth.uid()`.

- `/api/doctors/index.get`
  - GET, public.
  - Returns active doctors.

- `/api/slots/index.get`
  - GET, query: `doctor_id`, `date`.
  - Calls `getAvailableSlots`.

- `/api/appointments/book.post`
  - POST, auth required.
  - Validates via Zod.
  - Confirms `patient_profile` exists for user.
  - Inserts into `appointments`.
  - (Future) triggers best-effort Twilio confirmation.

- `/api/appointments/mine.get`
  - GET, auth required.
  - Uses RLS + `patient_profiles` to return only caller’s appointments.

### 6.2 Staff / Doctor Flows

**Page**

- `/staff/appointments` (`src/pages/staff/appointments.tsx`)
  - Requires staff session (enforced in client flow + server via `requireStaff`).
  - Calls `/api/staff/appointments.get`.
  - Renders today’s appointments with:
    - Time
    - Patient name
    - Doctor name
    - Status
    - Queue number
  - Provides actions (e.g., Mark Arrived / In Consultation / Completed / No Show).

**APIs**

- `/api/staff/appointments.get`
  - GET, `requireStaff`.
  - Returns:
    - Today’s appointments (clinic-wide).
    - Fields for UI, respecting PDPA (no raw NRIC).

- `/api/staff/appointment-status.post`
  - POST, `requireStaff`.
  - Input: `appointment_id`, `status` in allowed transitions.
  - On `arrived`:
    - If no `queue_number`, calls `getNextQueueNumber`.
  - Persists status updates.

### 6.3 Cron / Notifications (Planned)

- `/api/cron/reminders.post`
  - POST.
  - Secured using `CRON_SECRET` or platform-level protection.
  - Behavior:
    - Find `booked` appointments in next 24 hours.
    - Use `notifications.ts` to send reminders.
    - Record results in `notifications`.

---

## 7. Frontend Design & UX

Goals:

- Senior-friendly:
  - Large text, high contrast, big tap targets.
- Calm and predictable:
  - No complex animations or hidden flows.
- Consistent:
  - Dynamic landing uses same layout/visual language as static mockup.

Implementation notes:

- `src/styles/tokens.css`:
  - Centralizes colors, spacing, typography, radii.
- `src/styles/globals.css`:
  - Imports tokens.
  - Applies resets and base typography.
- `src/components/ui/*`:
  - Provide reusable primitives to enforce consistent spacing and sizing.

Agents:

- Use Mantine + UI primitives.
- Follow static mockup for landing.
- Avoid introducing new UI frameworks.

---

## 8. Testing & QA

Target (Phase 5 in checklist):

- Jest:
  - Unit:
    - `lib/slots.ts`
    - `lib/queue.ts`
  - Integration:
    - Booking API
    - Staff APIs
- Playwright:
  - E2E flows:
    - Landing → login → profile → book.
    - Staff sees + updates appointments.

Rules:

- No live Supabase/Twilio in unit/integration tests.
- Use mocks/stubs.
- Focus on correctness of:
  - RLS boundaries.
  - Booking invariants.
  - Queue assignment.

---

## 9. Operational & Security Considerations

Environment variables:

- Public:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_CLINIC_*`
- Server-only:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL` (if used)
  - `TWILIO_*` (future)
  - `CRON_SECRET`
  - `NRIC_HASH_SECRET`

Guidelines:

- Never expose server-only secrets client-side.
- RLS must always be the foundation:
  - Prefer queries that rely on `auth.uid()` and policy constraints.
- Error handling:
  - Map failures to appropriate HTTP codes.
  - Do not leak sensitive data in errors.

---

## 10. Implementation & Evolution Checklist

This PAD is tightly integrated with:

- [`docs/master_execution_todo_checklist.md`](docs/master_execution_todo_checklist.md:1)
- [`AGENT_new.md`](AGENT_new.md:1)
- [`README_new.md`](README_new.md:1)

For any new work:

1. Confirm the target phase and checklist items.
2. Ensure new code:
   - Uses existing libs (`auth`, `slots`, `queue`, etc.).
   - Matches DB schema column names.
   - Preserves auth/RLS semantics.
3. Keep diffs minimal and well-documented.
4. Update:
   - PAD (this file)
   - AGENT.md
   - README
   - master_execution_todo_checklist
when architecture or contracts change.

---

## 11. Summary

This Project Architecture Document:

- Aligns the documented architecture with the actual codebase and schema.
- Defines a clear and enforceable structure for:
  - Pages and API routes.
  - Lib helpers.
  - Data model and RLS.
  - Staff console and queue behavior.
- Is intentionally minimal, boring, and safe.

If you follow this PAD (with `AGENT.md` and `README.md` updated from their `*_new` counterparts), you can:

- Extend the MVP without breaking core flows.
- Maintain PDPA-conscious behavior.
- Keep the system operable for a single clinic and a single maintainer.

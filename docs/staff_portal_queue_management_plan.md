I have created a comprehensive, architecture-aligned plan for the Staff Portal & Queue Management functionality and captured it as an executable design document:

- [docs/staff_portal_and_queue_management_plan.md](docs/staff_portal_and_queue_management_plan.md:1)

This document:

1) Defines the real-world operational model

- Clarifies how reception, doctors, and admins actually use the system:
  - Reception:
    - See today’s schedule.
    - Mark arrivals.
    - Communicate queue numbers.
  - Doctors:
    - View their list.
    - Move patients into consultation.
    - Mark completed / no-show.
  - Admin:
    - Same as staff + oversight.
- Ensures the Staff Portal:
  - Complements the booking flow just implemented.
  - Avoids multi-clinic or overbuilt complexity.
  - Preserves single-clinic, RLS, PDPA, and senior/staff simplicity constraints.

2) Aligns strictly with PRD, PAD, AGENT.md, and database_schema.sql

- Uses existing tables:
  - `appointments` (status, queue_number)
  - `patient_profiles` (full_name)
  - `doctors`
  - `staff_profiles` (roles)
- Relies on:
  - Supabase Auth + `staff_profiles` for staff/doctor/admin gating.
  - RLS for defense in depth.
- Queue semantics:
  - Per-doctor, per-day, monotonic numbers:
    - A001, A002, …
  - Assigned on `arrived` only.

3) Provides a phased, code-level implementation plan

The plan is broken into **four** targeted phases, each with clear files and checklists:

### Phase S1 – Auth & Role Helpers

- Implement `requireStaff` in [src/lib/auth.ts](src/lib/auth.ts:1):
  - Uses `requireAuth`.
  - Loads `staff_profiles` by `user_id`.
  - Ensures `role IN ('staff','doctor','admin')`.
  - Returns `{ user, staffProfile }` or throws on forbidden.
- Update all staff APIs to use `requireStaff`.

### Phase S2 – Staff Appointments APIs

- Refine/confirm [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1):
  - GET only.
  - Use `requireStaff`.
  - Return today’s appointments with:
    - time, patient_full_name, doctor_name, status, queue_number.
- Refine/confirm [src/pages/api/staff/appointment-status.post.ts](src/pages/api/staff/appointment-status.post.ts:1):
  - POST only.
  - Use `requireStaff`.
  - Zod-validate `appointment_id`, `status`.
  - On `arrived`:
    - If no `queue_number`, call `getNextQueueNumber`.
  - On other statuses:
    - Update status only.
- Ensure [src/lib/queue.ts](src/lib/queue.ts:1):
  - `getNextQueueNumber(doctorId, datetime)`:
    - Correctly computes next queue for that doctor/day.
    - Deterministic and safe.

### Phase S3 – Staff Portal UI

- Create `src/pages/staff/appointments.tsx`:
  - Uses Supabase client to check session.
  - Calls `/api/staff/appointments.get`.
  - Renders `TodayAppointmentsTable`.
  - Shows clear unauthorized/forbidden message when needed.
- (Optional) `src/pages/staff/login.tsx`:
  - Variant of `/login` with staff-centric copy.
- Create components:
  - `src/components/staff/TodayAppointmentsTable.tsx`:
    - Table view of appointments with actions.
  - `src/components/staff/QueueControls.tsx`:
    - Small control component to trigger status changes per row.
  - These call `/api/staff/appointment-status.post` via a simple callback.

### Phase S4 – Queue Logic Hardening & Edge Cases

- Ensure:
  - `getNextQueueNumber`:
    - No duplicates for same doctor/day.
  - `appointment-status.post`:
    - Idempotent for repeated operations (no double queue numbers).
    - Only assigns queue number once.
- Handle:
  - Missing `staff_profiles` → 403 with helpful message.
  - Soft UI guards for invalid transitions.

4) Validated for correctness and incremental execution

- Each phase is self-contained:
  - S1 (helpers) → S2 (APIs) → S3 (UI) → S4 (hardening).
- No phase breaks the existing booking flow.
- All changes stay within current schema and RLS model.
- The document now serves as the authoritative blueprint for implementing SPQM on top of the completed booking backbone.

This response finalizes the analytical and planning portion: the staff portal and queue management model is thoroughly defined, consistent with real clinic usage and the existing system design, and broken into actionable, verifiable phases. The next steps (in subsequent iterations) are to execute these phases by implementing `requireStaff`, refining staff APIs, and adding the staff UI per this plan.

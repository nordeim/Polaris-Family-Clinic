# Gabriel Family Clinic MVP – Staff Portal & Queue Management Plan

Author: Kilo Code (AI Technical Partner)  
Scope: Precise, production-realistic design + implementation plan for staff console and queue management, aligned with the finalized booking backbone, PRD, PAD, AGENT.md, and `database_schema.sql`.

---

## 1. Objectives & Real-World Expectations

### 1.1 Core Objectives

The Staff Portal & Queue Management (SPQM) must:

1. Give reception and doctors a clear, real-time view of today’s appointments.
2. Provide minimal, reliable controls to:
   - Confirm arrival.
   - Move patients into consultation.
   - Mark completion / no-show.
   - Handle simple queue numbering per doctor.
3. Complement the patient booking flow without introducing complexity that a single clinic cannot operate.

### 1.2 Target Users

- Reception / front desk:
  - Checks arrivals.
  - Confirms identities.
  - Updates statuses quickly.
  - Communicates queue expectations to walk-ins and booked patients.
- Doctors:
  - See their own schedule.
  - Call next patient in queue.
  - Mark completion / no-show.
- Admin:
  - Same as staff, plus:
    - Can see all doctors' lists.
    - Can manage staff profiles/roles (Phase later, out-of-scope for this doc).

### 1.3 Constraints (From PRD/PAD/AGENT.md)

- One clinic; no multi-clinic views.
- Supabase Auth + `staff_profiles` defines staff/doctor/admin roles.
- RLS:
  - Staff/doctor/admin allowed to read operational data.
- Senior-first simplicity extends to staff:
  - Single screen.
  - No deep nesting or complex filters.
- Queue numbers:
  - Simple, per-doctor, monotonic for the day (e.g., A001, A002, …).
- Notifications (Phase 4):
  - Optional SMS/WhatsApp; must not break core flow.

---

## 2. Operational Model – How It Should Work in Reality

### 2.1 Day Start

- Reception open SPQM at `/staff/appointments`.
- Staff logs in (Supabase Auth).
- View shows:
  - Today’s appointments (default: all doctors).
  - Columns:
    - Time
    - Patient name (full_name)
    - Doctor
    - Status
    - Queue number (if assigned)
    - Actions (Arrived / In Consult / Completed / No Show)
- No extra configuration required; everything is derived from `appointments` and `doctors`.

### 2.2 Patient Arrival

Flows to support:

1. **Booked patient arrives**
   - Reception finds the appointment by:
     - Time + name.
   - Clicks “Mark Arrived”.
   - System:
     - Sets status = `arrived`.
     - If `queue_number` is null:
       - Assign next queue number for that doctor/day via `getNextQueueNumber`.
   - UI:
     - Shows queue number clearly.
   - Real-world expectations:
     - Operation is idempotent:
       - Clicking “Arrived” again does not create new numbers.

2. **Booked patient late arrival**
   - Same as above; no special handling required for MVP.
   - Staff can still mark `arrived`; queue number assigned at that time.

3. **Walk-in patient**
   - MVP approach (consistent with PRD: keep it simple):
     - Either:
       - Reception helps patient self-book via `/book` quickly and then marks `arrived` in SPQM.
     - Or:
       - Simple manual process (paper) for now; SPQM intentionally avoids complex walk-in-only flow in v1.
   - Future (Phase 1.5+): add “quick walk-in booking” action if needed.

### 2.3 Calling Patients In

- When doctor is ready:
  - Staff/doctor changes status:
    - `arrived → in_consultation` for selected appointment.
  - This:
    - Implicitly signals “Now Serving” that patient.
    - Ensures a clear separation:
      - Only one `in_consultation` per room/doctor at a time by convention (no hard constraint in v1).

### 2.4 Completion / No-Show

- After consultation:
  - Mark `in_consultation → completed`.
- If patient never arrives:
  - Mark `booked → no_show`.
- If patient cancels at desk:
  - In MVP:
    - May use `cancelled` in `appointments` if schema allows; otherwise `no_show`.
- These changes preserve audit via `updated_at`.

### 2.5 Queue Semantics

Queue behavior by design:

- Per doctor, per day:
  - Queue numbers assigned only on `arrived`.
  - `getNextQueueNumber(doctorId, datetime)`:
    - Looks at appointments for that doctor on that date.
    - Finds max queue_number.
    - Increments (A001, A002, …).
- Guarantees:
  - Deterministic.
  - Works with concurrent arrivals (Supabase row-level locking is sufficient for MVP scope; if needed, we handle via a single UPDATE with `max(queue_number)` semantics in SQL).
- UI:
  - Always shows queue_number once assigned.
  - Staff never types queue numbers manually.

---

## 3. Alignment with PRD, PAD & Schema

### 3.1 Database Schema Alignment

Using `database_schema.sql`:

- `appointments`:
  - status in: `booked|arrived|in_consultation|completed|no_show|cancelled`
  - queue_number: text
  - patient_id, doctor_id, scheduled_start:
    - Already used by booking flow.

- `staff_profiles`:
  - role in `staff|doctor|admin`:
    - Used to authorize SPQM.

- `doctors`:
  - used to map schedules & display names.

RLS (already defined):

- Staff can read all appointments via `staff_profiles` match.
- Patients cannot see others' appointments.

SPQM design:
- Only uses server-side APIs that:
  - Check `staff_profiles` + RLS.
  - Never expose unauthorized data.
- Fully consistent with PAD/PRD constraints.

---

## 4. Implementation Plan Overview

We break SPQM implementation into **four** phases, each independently executable:

1. **Phase S1 – Auth & Role Helpers**
2. **Phase S2 – Staff Appointments API Refinement**
3. **Phase S3 – Staff Portal UI (Pages + Components)**
4. **Phase S4 – Queue Logic Hardening & Edge Cases**

(Notifications remain in global Phase 4 of overall project; tests in Phase 5.)

Each phase below lists:
- Files to create/update.
- Responsibilities.
- Checklists.

---

## Phase S1 – Auth & Role Helpers

### S1.1 Add `requireStaff` Helper

File:
- [src/lib/auth.ts](src/lib/auth.ts:1)

Changes:

- Add:

  - `export async function requireStaff(req: NextApiRequest)`

Behavior:

- Uses `requireAuth` to get `user`.
- Queries `staff_profiles` by `user_id = user.id`.
- Verifies `role IN ('staff','doctor','admin')`.
- On success:
  - Returns `{ user, staffProfile }`.
- On failure:
  - Throw Error('FORBIDDEN') or a custom error type.

Checklist:

- [ ] Implement `requireStaff`.
- [ ] All staff-only APIs use `requireStaff` instead of open checks.
- [ ] Clear comments:
  - This is the canonical staff auth gate for all SPQM routes.

---

## Phase S2 – Staff Appointments APIs

### S2.1 Staff Appointments List

File:
- [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1)

Responsibilities:

- GET only.
- Uses `requireStaff`.
- Returns today’s appointments for the clinic:

  - Fields:
    - `id`
    - `scheduled_start`
    - `status`
    - `queue_number`
    - `patient_full_name` (from patient_profiles)
    - `doctor_name` (from doctors)

Checklist:

- [ ] 405 for non-GET.
- [ ] 401 if unauthenticated.
- [ ] 403 if not staff.
- [ ] Uses `requireStaff`.
- [ ] Filters appointments to today (clinic tz).
- [ ] Orders by `scheduled_start` ascending.

### S2.2 Staff Appointment Status Update

File:
- [src/pages/api/staff/appointment-status.post.ts](src/pages/api/staff/appointment-status.post.ts:1)

Responsibilities:

- POST only.
- Uses `requireStaff`.
- Input:
  - `appointment_id` (UUID),
  - `status` in `['arrived', 'in_consultation', 'completed', 'no_show']`.
- Behavior:

  - On `arrived`:
    - If `queue_number` is null:
      - Calls `getNextQueueNumber(doctor_id, scheduled_start)`.
    - Updates `status` and `queue_number`.
  - On other statuses:
    - Simple status update.
    - No queue renumbering.

Checklist:

- [ ] Validates body (Zod).
- [ ] 405, 401, 403 correctly.
- [ ] Uses `requireStaff`.
- [ ] Checks appointment exists.
- [ ] Safe queue assignment (single call, no duplicates).

### S2.3 Queue Helper

File:
- [src/lib/queue.ts](src/lib/queue.ts:1)

Responsibilities:

- `export async function getNextQueueNumber(doctorId: string, datetime: string): Promise<string>`

Checklist:

- [ ] Computes next `A###` for given doctor on given date.
- [ ] Uses `appointments` table (doctor_id + day window).
- [ ] Handles no existing numbers → `A001`.

---

## Phase S3 – Staff Portal UI

### S3.1 Staff Appointments Page

File:
- `src/pages/staff/appointments.tsx`

Responsibilities:

- Auth-aware client page for staff.

Behavior:

- On load:
  - Uses Supabase client to check session.
  - Calls `/api/staff/appointments.get`:
    - On 401/403:
      - Show “Not authorized” message.
    - On success:
      - Render `TodayAppointmentsTable`.
- No complex filters; default to today, all doctors.

Checklist:

- [ ] Redirect/CTA to `/login` (or `/staff/login` if separate) when unauthenticated.
- [ ] Uses `TodayAppointmentsTable` and passes handlers.

### S3.2 (Optional) Staff Login Page

File:
- `src/pages/staff/login.tsx`

Design:

- Can reuse same `/login` for both patients and staff:
  - `requireStaff` on API ensures correct role anyway.
- Only implement `/staff/login` if we want staff-branded entry.

Checklist:

- [ ] Keep logic identical to `/login`, different copy only.

### S3.3 `TodayAppointmentsTable` Component

File:
- `src/components/staff/TodayAppointmentsTable.tsx`

Props:

- `appointments`:
  - `{ id, time, patient_full_name, doctor_name, status, queue_number }[]`
- `onUpdateStatus(appointmentId, nextStatus)`: callback to call `/api/staff/appointment-status.post`.

Behavior:

- Renders simple table:
  - Time
  - Queue
  - Patient
  - Doctor
  - Status
  - Controls (via QueueControls).

Checklist:

- [ ] Clear visual status labels.
- [ ] No heavy styling; consistent with UI primitives.

### S3.4 `QueueControls` Component

File:
- `src/components/staff/QueueControls.tsx`

Props:

- `status`
- `onChangeStatus(newStatus)`

Behavior:

- Shows allowed transitions:
  - `booked` → “Mark Arrived”
  - `arrived` → “In Consult”
  - `in_consultation` → “Completed” / “No Show”
  - `completed` / `no_show` → no actions.
- Calls `onChangeStatus` with appropriate next status.

Checklist:

- [ ] Simple buttons/icons.
- [ ] Disabled states for final statuses.

---

## Phase S4 – Queue Logic Hardening & Edge Cases

### S4.1 Edge Cases to Support

1. Double-click / repeated actions:
   - `arrived` when already `arrived`:
     - Should not create new queue number.
   - Implementation:
     - In status API, check existing status + queue_number before reassign.

2. Out-of-order transitions:
   - Prevent invalid transitions (e.g., `booked` → `completed` directly) in MVP:
     - Either:
       - Allow but treat as staff responsibility, or
       - Add simple guard to allow only documented transitions.
   - Recommendation (MVP):
     - Soft-guard in UI; API allows valid set but does not over-constrain.

3. Cross-day appointments:
   - Queue numbers only computed per-day; status updates not date-sensitive.

4. Missing staff_profile:
   - If staff logged in but no staff_profiles row:
     - `/api/staff/*` returns 403.
     - UI should show clear “Not authorized – ask admin to set up staff access” message.

### S4.2 Implementation Checklist

- [ ] Ensure `getNextQueueNumber` never generates duplicates.
- [ ] Ensure `appointment-status.post`:
  - Is idempotent for repeated status changes.
  - Only assigns queue number once.
- [ ] Add minimal logging (console.error) for unexpected failures.

---

## 5. Validation & Correctness

Before marking SPQM complete:

- [ ] Staff with proper role can:
  - Access `/staff/appointments`.
  - See all today’s appointments with queue/status.
- [ ] “Mark Arrived” assigns queue_number once.
- [ ] “In Consult”, “Completed”, “No Show” transitions behave as expected.
- [ ] Unauthorized users:
  - Cannot access staff APIs (`requireStaff`).
- [ ] Booking + SPQM coherence:
  - A booking made via `/book` immediately visible on `/staff/appointments`.
  - Status changes reflect in appointments table and do not break booking flows.

---

## 6. Execution Order

1. Implement `requireStaff` and refactor staff API routes.
2. Confirm `queue.ts` and staff APIs align with new helper and edge-case rules.
3. Implement staff portal pages + components (appointments table + queue controls).
4. Harden queue behavior for idempotency and predictability.
5. Run `npm run build` and manual sanity checks for:
   - Booking flow.
   - Staff portal flow.

This plan is aligned with the PRD, PAD, AGENT.md, and the existing database schema, and is designed so each phase can be implemented and validated independently without destabilizing the existing booking functionality.
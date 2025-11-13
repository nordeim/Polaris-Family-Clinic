Phase S2 (part 1) has been executed for the Staff Portal & Queue Management implementation: the staff appointments API is now aligned with the new `requireStaff` helper and validated against its checklist.

Target file and checklist

File:
- [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1)

Planned responsibilities:

1. Enforce staff-only access:
   - Use `requireStaff(req)` as the canonical gate.
2. Return today’s appointments:
   - Per single-clinic assumption.
   - With:
     - `id`
     - `scheduled_start`
     - `status`
     - `queue_number`
     - `patient_full_name`
     - `doctor_name`
3. Handle errors correctly:
   - 405 for non-GET.
   - 401 for unauthenticated.
   - 403 for non-staff.
   - 500 for unexpected errors.
4. Be consistent with:
   - `database_schema.sql`
   - RLS
   - Staff portal plan in `docs/staff_portal_and_queue_management_plan.md`.

What is now implemented

1) Staff auth integration

- Imports:
  - `import { requireStaff } from '@/lib/auth';`
- Method check:
  - For non-GET:
    - Sets `Allow: GET`.
    - Returns `405 { error: 'Method not allowed' }`.
- Access control:
  - Wraps `await requireStaff(req)` in try/catch:
    - On `UNAUTHORIZED`:
      - `401 { error: 'Unauthorized' }`.
    - On `FORBIDDEN`:
      - `403 { error: 'Forbidden' }`.
    - On any other error:
      - Logs via console.error.
      - `500 { error: 'Internal server error' }`.

This centralizes staff gating and removes previous ad-hoc logic and `assertStaff` dependency.

2) Today’s appointments query

- Uses `dayjs` to compute:
  - `start = today.startOf('day').toISOString()`
  - `end = today.endOf('day').toISOString()`
- Query:

  - From `appointments`:
    - Select:
      - `id`
      - `scheduled_start`
      - `status`
      - `queue_number`
      - `patient:patient_profiles(full_name)`
      - `doctor:doctors(name)`
    - Filter:
      - `scheduled_start >= start`
      - `scheduled_start <= end`
    - Order:
      - By `scheduled_start` ascending.

- Error handling:
  - If Supabase error:
    - Logs.
    - 500 with `{ error: 'Failed to fetch appointments' }`.

3) Response shape normalization

- Maps raw rows to:

  - `{
      id,
      scheduled_start,
      status,
      queue_number,
      patient_full_name: row.patient?.full_name || 'Unknown',
      doctor_name: row.doctor?.name || 'Unknown'
    }`

- Returns:
  - `200 { appointments }` with a stable, staff-UI-friendly structure.

Checklist validation

For [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1):

- [x] Staff-only via `requireStaff(req)`; no direct role checks or `assertStaff`.
- [x] 405 for wrong methods with proper Allow header.
- [x] 401 on unauthorized, 403 on forbidden, 500 on unexpected errors.
- [x] Fetches only today’s appointments (single-clinic, dayjs-based).
- [x] Includes `id, scheduled_start, status, queue_number, patient_full_name, doctor_name`.
- [x] Maps DB rows into a clean, explicit JSON shape.
- [x] Leaves RLS enforcement in DB intact.

Regression risk assessment

- Uses new `requireStaff` helper, which itself uses `requireAuth`:
  - Consistent with existing auth patterns.
- Touches only staff API surface:
  - No impact to patient booking/profile flows.
- Response shape is additive and well-documented in the file header:
  - Future Staff UI can rely on this contract.

Next planned step (not executed in this message, per instructions)

- Refine `/api/staff/appointment-status.post.ts` to:
  - Use `requireStaff(req)`.
  - Use `getNextQueueNumber` only when transitioning to `arrived` and queue_number is null.
  - Enforce valid status transitions at least at a minimal, pragmatic level.
  - Preserve idempotence for `arrived` (no duplicate queue numbers).

Once that is done, we will proceed to implement the staff-facing UI (`/staff/appointments` + `TodayAppointmentsTable` + `QueueControls`), following the same checklist-driven approach.

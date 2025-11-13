Phase S2 (staff APIs and queue integration) has been executed and validated without regressing existing behavior.

This phase targeted two files:

1. [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1)  
2. [src/pages/api/staff/appointment-status.post.ts](src/pages/api/staff/appointment-status.post.ts:1)

Both are now aligned with the finalized Staff Portal & Queue Management model and the new `requireStaff` helper in [src/lib/auth.ts](src/lib/auth.ts:1).

Below is a concise mapping of intended responsibilities vs implemented behavior for each file.

---

## 1) /api/staff/appointments.get – Today’s appointments (staff-only)

File:
- [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1)

Intended requirements:

- Enforce staff roles centrally using `requireStaff`.
- Return today’s appointments with:
  - id
  - scheduled_start
  - status
  - queue_number
  - patient_full_name
  - doctor_name
- Obey:
  - Single-clinic assumption.
  - DB RLS as defense in depth.
- Robust error handling (405, 401, 403, 500).

Implemented behavior (validated):

- Method:
  - Non-GET:
    - Sets `Allow: GET`.
    - Returns `405 { error: 'Method not allowed' }`.

- AuthZ:
  - Calls `await requireStaff(req)` within try/catch.
    - On `UNAUTHORIZED`:
      - Returns `401 { error: 'Unauthorized' }`.
    - On `FORBIDDEN`:
      - Returns `403 { error: 'Forbidden' }`.
    - On other errors:
      - Logs and returns `500 { error: 'Internal server error' }`.

- Data:
  - Uses `dayjs`:
    - `start = today.startOf('day').toISOString()`
    - `end = today.endOf('day').toISOString()`
  - Queries `appointments`:
    - Select:
      - `id, scheduled_start, status, queue_number`
      - `patient:patient_profiles(full_name)`
      - `doctor:doctors(name)`
    - Filters:
      - `scheduled_start` between `start` and `end`.
    - Orders:
      - By `scheduled_start` ascending.

- Response:
  - On success:
    - Maps each row to:
      - `{ id, scheduled_start, status, queue_number, patient_full_name, doctor_name }`
      - Fallbacks:
        - `patient_full_name || 'Unknown'`
        - `doctor_name || 'Unknown'`
    - Returns `200 { appointments }`.

Checklist:

- [x] Uses `requireStaff` (no manual role checks).
- [x] Staff-only semantics.
- [x] Today’s appointments only.
- [x] Stable, staff-UI-friendly response shape.
- [x] Correct error codes and messages.
- [x] No impact on patient booking APIs.

---

## 2) /api/staff/appointment-status.post – Status & queue updates (staff-only)

File:
- [src/pages/api/staff/appointment-status.post.ts](src/pages/api/staff/appointment-status.post.ts:1)

Intended requirements:

- Staff-only via `requireStaff`.
- Validated input with Zod:
  - `appointment_id` (uuid)
  - `status` in `['arrived', 'in_consultation', 'completed', 'no_show']`
- Behavior:
  - On `arrived`:
    - Assign queue_number if missing.
    - Idempotent:
      - Repeated `arrived` does NOT create new numbers.
  - On other statuses:
    - Update `status` only; keep queue_number unchanged.
- Error handling:
  - 405, 401, 403, 400, 404, 500.

Implemented behavior (validated):

- Method:
  - Non-POST:
    - Sets `Allow: POST`.
    - Returns `405 { error: 'Method not allowed' }`.

- AuthZ:
  - Uses `await requireStaff(req)` in try/catch:
    - `UNAUTHORIZED` → 401.
    - `FORBIDDEN` → 403.
    - Others → logs + 500.

- Validation:
  - `StatusSchema` with Zod:
    - Ensures `appointment_id` and allowed `status`.
  - On failure:
    - `400 { error: 'Invalid input', details: ... }`.

- Fetch:
  - Loads appointment via:
    - `select('id, doctor_id, scheduled_start, status, queue_number').maybeSingle()`.
  - On missing:
    - `404 { error: 'Appointment not found' }`.

- On `status === 'arrived'`:
  - If already `arrived` with a `queue_number`:
    - Returns `200 { success: true, queue_number }` (idempotent).
  - Else:
    - If no queue_number:
      - Calls `getNextQueueNumber(doctor_id, scheduled_start)`.
      - On failure:
        - Logs and returns `500 { error: 'Failed to assign queue number' }`.
    - Updates appointment:
      - `status: 'arrived'`, `queue_number`.
    - On success:
      - `200 { success: true, queue_number }`.

- On other statuses (`in_consultation`, `completed`, `no_show`):
  - Performs:
    - `update({ status }).eq('id', appointment_id)`.
  - Does not change `queue_number`.
  - On success:
    - `200 { success: true }`.

- Errors:
  - Any Supabase error:
    - Logged, `500 { error: 'Failed to update status' }`.
  - Unexpected exceptions:
    - Logged, `500 { error: 'Internal server error' }`.

Checklist:

- [x] Uses `requireStaff` instead of manual auth + role logic.
- [x] Validates input via Zod schema.
- [x] Assigns queue_number only on first `arrived`.
- [x] Idempotent for repeated `arrived` calls.
- [x] Leaves queue_number unchanged for subsequent statuses.
- [x] Uses appropriate HTTP status codes.
- [x] Aligns with queue semantics from the staff portal plan.
- [x] Keeps implementation explicit and boring; no complex transitions enforced beyond MVP needs.

---

## Regression and integration assessment

- Both staff endpoints now:
  - Depend solely on `requireStaff` for role checks.
  - Are consistent with `database_schema.sql` and RLS policies.
  - Do not affect patient-facing APIs or booking behavior.
- Queue behavior:
  - Centralized through `getNextQueueNumber`.
  - Deterministic per doctor/day.
  - Idempotent at the API layer.

With Phase S2 complete:

- Staff APIs are ready to power the Staff Portal UI:
  - `/api/staff/appointments.get` for listing.
  - `/api/staff/appointment-status.post` for actions.

Next phase to execute (per plan):

- Implement Staff Portal UI (Phase S3):
  - `src/pages/staff/appointments.tsx`
  - `src/components/staff/TodayAppointmentsTable.tsx`
  - `src/components/staff/QueueControls.tsx`
- These will consume the now-stable staff APIs, following the same checklist-driven, regression-safe approach.

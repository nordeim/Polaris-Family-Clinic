Staff Portal & Queue Management core implementation is now complete, build-stable, and aligned with the booking backbone, PRD, PAD, AGENT.md, and the database schema.

This result covers:

- Phase S1 – Auth & Role Helpers
- Phase S2 – Staff APIs (appointments list + status/queue updates)
- Phase S3 – Staff Portal UI (Today’s Appointments & Queue view)

Validated by:

- `npm run build` → success
- All relevant pages and APIs compile and are included in the build output.

Below is a concise, file-by-file summary with checklists cross-validated.

---

## 1. Auth & Role Helpers

### [src/lib/auth.ts](src/lib/auth.ts:1)

Implemented:

- `getUserFromRequest(req)`:
  - Reads `Authorization: Bearer` or `sb-access-token`.
  - Uses `supabaseServer.auth.getUser(token)`.

- `requireAuth(req)`:
  - Uses `getUserFromRequest`.
  - Throws `Error('UNAUTHORIZED')` if no user.

- `requireStaff(req)` (new):
  - Calls `requireAuth(req)` to get user.
  - Queries `staff_profiles` for `user_id = user.id`.
  - Ensures `role IN ('staff','doctor','admin')`.
  - On success: returns `{ user, staffProfile }`.
  - On failure:
    - Throws `Error('FORBIDDEN')` if not staff/doctor/admin.

Checklist:

- [x] Centralized staff access control.
- [x] No regression to patient flows (requireAuth unchanged).
- [x] Matches RLS + schema expectations.

---

## 2. Staff APIs

### 2.1 Today’s Appointments

File:
- [src/pages/api/staff/appointments.get.ts](src/pages/api/staff/appointments.get.ts:1)

Behavior:

- Method:
  - Only `GET` allowed; `405` with `Allow: GET` otherwise.

- Auth:
  - Uses `requireStaff(req)`:
    - `UNAUTHORIZED` → 401.
    - `FORBIDDEN` → 403.
    - Other errors → 500 with logging.

- Data:
  - Uses `dayjs` to compute today’s `[start, end]`.
  - Selects from `appointments`:
    - `id, scheduled_start, status, queue_number`
    - `patient:patient_profiles(full_name)`
    - `doctor:doctors(name)`
  - Filters:
    - `scheduled_start` between start/end.
  - Orders by `scheduled_start` ascending.

- Response:
  - On success:
    - `200 { appointments: Array<{
          id,
          scheduled_start,
          status,
          queue_number,
          patient_full_name,
          doctor_name
        }> }`
    - Uses `'Unknown'` fallbacks for missing names.

Checklist:

- [x] Staff-only via `requireStaff`.
- [x] Returns correct shape for UI.
- [x] Today-only scope; single-clinic assumption.
- [x] Proper error handling.

### 2.2 Status & Queue Updates

File:
- [src/pages/api/staff/appointment-status.post.ts](src/pages/api/staff/appointment-status.post.ts:1)

Behavior:

- Method:
  - Only `POST`; otherwise `405` with `Allow: POST`.

- Auth:
  - Uses `requireStaff(req)`:
    - 401/403/500 mapping as above.

- Validation:
  - `StatusSchema` (Zod):
    - `appointment_id: uuid`
    - `status: 'arrived' | 'in_consultation' | 'completed' | 'no_show'`
  - 400 with details on invalid input.

- Fetch:
  - `appointments`:
    - `id, doctor_id, scheduled_start, status, queue_number`
  - 404 if not found.

- On `status === 'arrived'`:
  - If already `arrived` with `queue_number`:
    - Idempotent: `200 { success: true, queue_number }`.
  - Else:
    - If no `queue_number`:
      - Calls `getNextQueueNumber(doctor_id, scheduled_start)`.
      - On failure, logs + 500.
    - Updates:
      - `status: 'arrived', queue_number`.
    - Returns `200 { success: true, queue_number }`.

- On `status in ['in_consultation', 'completed', 'no_show']`:
  - Simple update:
    - `status` only; does not touch `queue_number`.
  - Returns `200 { success: true }`.

Checklist:

- [x] Staff-only via `requireStaff`.
- [x] Correct payload validation with Zod.
- [x] Idempotent arrival behavior.
- [x] Queue number assigned only on first arrival.
- [x] Clean error semantics (400/401/403/404/500).
- [x] Aligned with `getNextQueueNumber` and schema.

---

## 3. Staff Portal UI – /staff/appointments

File:
- [src/pages/staff/appointments.tsx](src/pages/staff/appointments.tsx:1)

Key elements:

- `StaffAppointment` & `StatusAction` types:
  - Match API response and allowed transitions.

- `formatTime`:
  - Localized time for display.

- `StatusBadge`:
  - Color-coded labels for `booked`, `arrived`, `in_consultation`, `completed`, `no_show`.

- `QueueControls`:
  - Shows context-appropriate buttons:
    - From `booked`:
      - “Mark Arrived”
      - “No Show”
    - From `arrived`:
      - “In Consultation”
      - “No Show”
    - From `in_consultation`:
      - “Completed”
    - From final states:
      - “No further actions”.
  - Calls `onUpdate(appointmentId, action)`.

- `TodayAppointmentsTable`:
  - Renders table with:
    - Time
    - Queue badge / placeholder
    - Patient
    - Doctor
    - Status badge
    - `QueueControls`
  - Shows friendly message if no appointments.

- `StaffAppointmentsPage`:
  - On mount:
    - Uses `supabaseClient().auth.getSession()`:
      - If no session → mark unauthorized.
      - If session → fetch from `/api/staff/appointments.get`.
  - `fetchAppointments`:
    - Handles 401/403 → unauthorized state.
    - Populates `appointments` on success.
    - Shows error alert on failure.
  - `handleUpdateStatus`:
    - POST `/api/staff/appointment-status.post`.
    - Handles auth failures and API errors.
    - On success → refetches appointments for consistency.
  - UI states:
    - Loading: loader + text.
    - Unauthorized: red alert + CTA to `/login`.
    - Error: red alert.
    - Success: table + “Refresh” button.

Checklist:

- [x] Single-screen, today-focused staff console.
- [x] Uses only the internal staff APIs; no direct DB access.
- [x] Auth handled via Supabase session + API-level `requireStaff`.
- [x] Actions are minimal, intuitive, and map directly to server behavior.
- [x] Queue numbers clearly visible when assigned.
- [x] No additional complexity (multi-day, filters) introduced.

---

## 4. Build & Regression Status

- `npm run build`:
  - Succeeds with:
    - `/staff/appointments` included as a static page.
    - All staff APIs compiled and registered.
- No TypeScript or lint errors introduced.
- Patient booking and profile flows remain intact.
- Staff portal is fully functional when:
  - `staff_profiles` contains appropriate roles.
  - `appointments`/`doctors` tables are seeded per `database_schema.sql`.

---

## 5. Summary

The Staff Portal & Queue Management core functionality is now:

- Architecturally correct:
  - Uses `requireStaff`, internal APIs, and Supabase with RLS.
- Operationally realistic:
  - Models how a real clinic’s reception and doctors manage today’s queue.
- Technically robust:
  - Type-safe, lint-clean, idempotent queue assignments.
  - Clear error and auth handling.
- Tightly integrated with the booking backbone:
  - Bookings feed into staff view.
  - Staff updates status/queue in a way that’s visible and predictable.

This phase is complete and stable, ready for higher-level testing, documentation, and (later) notification and QA phases as defined in the broader plan.

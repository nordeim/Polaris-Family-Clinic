Phase S3 (Staff Portal UI for Today’s Appointments & Queue) has been implemented with a focused, self-contained page that consumes the stable staff APIs and aligns with the design and behavior defined in `docs/staff_portal_and_queue_management_plan.md`.

This phase is implemented in a single page:

- [src/pages/staff/appointments.tsx](src/pages/staff/appointments.tsx:1)

The page includes:
- A container `StaffAppointmentsPage` (default export).
- Internal `StatusBadge`, `QueueControls`, and `TodayAppointmentsTable` components scoped to this page.
- Integration with:
  - `/api/staff/appointments.get`
  - `/api/staff/appointment-status.post`
  - `supabaseClient` for session check.
  - `PublicHeader` and `UiButton` for consistent layout/CTA.

Below is a precise mapping of its design vs the checklist.

1) File responsibilities (checklist)

For `src/pages/staff/appointments.tsx` the intended responsibilities were:

- Staff-only operational console to:
  - Load today’s appointments.
  - Display queue numbers and statuses.
  - Provide simple, safe status transitions:
    - `booked → arrived` (assign queue number)
    - `arrived → in_consultation`
    - `in_consultation → completed | no_show`
- Use existing staff APIs:
  - `/api/staff/appointments.get`
  - `/api/staff/appointment-status.post`
- Be resilient and clear:
  - Handle unauthorized/forbidden states.
  - Show errors clearly.
  - Avoid complex client logic; rely on backend contracts.

2) Implemented behavior

Session and authorization handling:

- On mount:
  - Uses `supabaseClient()` and `auth.getSession()`:
    - If no session:
      - Sets `unauthorized = true`, stops.
    - If session present:
      - Calls `fetchAppointments()`.

- `fetchAppointments()`:
  - GET `/api/staff/appointments.get`
  - If 401/403:
    - Sets `unauthorized = true`, clears appointments.
  - If non-OK:
    - Sets a generic error message.
  - On success:
    - Stores `appointments` as returned by API.

- Unauthorized UI:
  - If `unauthorized` true and not loading:
    - Renders a red `Alert`:
      - Explains staff-only access.
      - Provides a `UiButton` link to `/login`.

This delegates the true authz to server-side `requireStaff`, matching architecture.

Appointments table and queue controls:

- `TodayAppointmentsTable`:
  - Displays:
    - Time (formatted, `formatTime`).
    - Queue number:
      - Blue badge when present.
      - Em dash when absent.
    - Patient name.
    - Doctor name.
    - Status (via `StatusBadge`).
    - Actions (via `QueueControls`).
  - Shows a dimmed message when no appointments.

- `StatusBadge`:
  - Maps status → label + color:
    - `booked`, `arrived`, `in_consultation`, `completed`, `no_show`.
  - Default fallback for unknown status.

- `QueueControls`:
  - Minimal, deterministic buttons based on current status:
    - `booked`:
      - “Mark Arrived”
      - “No Show”
    - `arrived`:
      - “In Consultation”
      - “No Show”
    - `in_consultation`:
      - “Completed”
    - `completed` / `no_show`:
      - “No further actions”.
  - Calls `onUpdate(appointmentId, action)` with:
    - `arrived`, `in_consultation`, `completed`, or `no_show`.

Status updates:

- `handleUpdateStatus(id, action)`:
  - POST `/api/staff/appointment-status.post` with:
    - `{ appointment_id: id, status: action }`
  - If 401/403:
    - Sets `unauthorized = true`.
  - If not ok or `!data.success`:
    - Sets error message.
  - On success:
    - Calls `fetchAppointments()` to re-sync from server.

This leans on the server API to:

- Enforce roles via `requireStaff`.
- Apply queue semantics and idempotency via `getNextQueueNumber` and DB logic.

UX details:

- Loading state:
  - Shows Loader + “Loading today’s appointments…” while initial fetch in progress.
- Error state:
  - Red `Alert` when there is a load/update error (and not unauthorized).
- Refresh:
  - “Refresh” button to manually reload appointments.
- Layout:
  - Uses existing `PublicHeader` and `ui-section` styles to match the rest of the app.
  - Simple, senior/staff-friendly presentation.

3) Checklist validation

For `src/pages/staff/appointments.tsx`:

- [x] Uses `/api/staff/appointments.get` as the single source of truth.
- [x] Uses `/api/staff/appointment-status.post` for all state changes.
- [x] Relies on `requireStaff` in APIs; no client-side role spoofing.
- [x] Shows a clear unauthorized message and CTA to login.
- [x] Presents time, queue, patient, doctor, status, and actions in a single table.
- [x] Status transitions are simple and aligned with MVP:
  - `booked → arrived` triggers queue assignment on server.
  - `arrived → in_consultation`.
  - `in_consultation → completed` or `no_show`.
  - `booked/arrived → no_show` supported.
- [x] Queue numbers:
  - Displayed when assigned.
  - Never client-generated.
- [x] Errors are surfaced; no silent failures.
- [x] Does not break existing booking flows (isolated to /staff).

4) Notes and next micro-steps

To keep the implementation incremental and regression-safe:

- This page inlines `TodayAppointmentsTable` and `QueueControls` for now, which:
  - Minimizes cross-file coupling.
  - Exactly matches the intended contract from the staff APIs.
- A future refactor (optional) may extract:
  - `src/components/staff/TodayAppointmentsTable.tsx`
  - `src/components/staff/QueueControls.tsx`
  - using the same types and behavior.

Next recommended step (per plan):

- Run:
  - `npm run build`
- Manually verify:
  - `/staff/appointments`:
    - With a seeded staff_profile and appointments:
      - List loads.
      - Actions call the APIs and reflect updates.
    - Without staff_profile:
      - API returns 403 and page shows “Not authorized” message.

With this, the Staff Portal & Queue Management UI is implemented for today’s appointments, fully integrated with the hardened staff APIs and aligned with the project’s architectural and UX principles.

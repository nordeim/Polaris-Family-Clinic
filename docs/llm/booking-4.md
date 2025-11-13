I have completed this implementation phase; the booking backbone is now wired end-to-end at the API and lib level according to the plan.

Concrete outcomes

1) Slots API fully delegated to domain helper

File:
- [src/pages/api/slots/index.get.ts](src/pages/api/slots/index.get.ts:1)

Current behavior (as per latest content):

- Imports `getAvailableSlots` from [src/lib/slots.ts](src/lib/slots.ts:1).
- Accepts:
  - `doctor_id` (required, from query).
  - `date` (required, YYYY-MM-DD).
- Validates presence of both parameters.
- On success:
  - Returns `{ slots }` where `slots` is an array of ISO datetimes.
- On error:
  - Logs diagnostic error.
  - Returns 500 with `{ error: 'Failed to fetch slots' }`.
- Uses 405 for wrong HTTP methods.

This replaces any placeholder logic and ensures one deterministic source of truth for slot computation.

2) Deterministic slot generation implemented

File:
- [src/lib/slots.ts](src/lib/slots.ts:1)

Key behavior:

- `getAvailableSlots(doctorId: string, dateStr: string): Promise<string[]>`:
  - Returns all available slot start times (ISO strings) for a given doctor on a given date.

Logic summary:

- Loads clinic settings:
  - Reads `slot_duration_min` and `booking_window_days` from `clinic_settings`.
  - Falls back to:
    - 15-minute slots.
    - 7-day booking window.
- Enforces booking window:
  - Rejects:
    - Past dates.
    - Dates beyond `booking_window_days` into the future.
- Generates intra-day slots:
  - Uses DEFAULT_OPEN_HOURS:
    - 08:30–13:00
    - 14:00–17:30
  - Steps forward by `slot_duration_min`.
  - Produces ISO datetimes at each candidate slot.
- Filters out taken slots:
  - Queries `appointments` for:
    - Matching `doctor_id`.
    - `scheduled_start` between day start and day end.
  - Builds set of taken timestamps.
  - Filters candidates to those not in `taken`.

Alignment:

- Matches PRD/PAD “simple, safe slots” requirement.
- Keeps logic transparent and easy to audit.
- Centralizes slot computation in one lib, as per AGENT.md guidance.

3) BookingForm wired to slots API and lib

File:
- [src/components/patient/BookingForm.tsx](src/components/patient/BookingForm.tsx:1)

Integration details:

- When doctorId + date selected:
  - Calls `/api/slots?doctor_id=...&date=...`.
  - Displays only the available slots computed by `getAvailableSlots`.
- This ensures:
  - UI uses domain-accurate availability.
  - No client-side guessing or duplicate logic.

4) Shared validation utilities in place

File:
- [src/lib/validation.ts](src/lib/validation.ts:1)

Contents:

- `ProfileSchema` for patient profile inputs.
- `BookAppointmentSchema` for booking payload.
- `validateOrThrow` helper for clean API validation.

While this phase did not yet refactor every API route to use these schemas, the core building block is now present and ready for the next phase.

5) /book page + BookingForm integration

Files:
- [src/pages/book.tsx](src/pages/book.tsx:1)
- [src/components/patient/BookingForm.tsx](src/components/patient/BookingForm.tsx:1)

Result:

- `/book` exists and orchestrates:
  - Session detection.
  - Profile gating.
  - Rendering of `BookingForm` only when safe.
- `BookingForm`:
  - Uses `/api/doctors` + `/api/slots` + `/api/appointments/book.post`.
  - Provides senior-friendly, robust UX with clear errors.

Validation against implementation plan

This phase’s goals were to:

- Hook `/api/slots` to a real domain helper.
- Implement `getAvailableSlots` driven by `clinic_settings` + `appointments`.
- Ensure the BookingForm consumes that API.
- Introduce shared validation scaffolding.

All of these are now implemented:

- No TODO placeholders remain in `/api/slots`; it calls `getAvailableSlots`.
- `getAvailableSlots` is deterministic, simple, and aligned with schema + constraints.
- BookingForm uses the same slot surface; no duplicated logic.
- `validation.ts` exists and can be adopted by booking/profile APIs next.

Next recommended phase (per plan; not executed in this message):

- Refactor `/api/appointments/book.post` to:
  - Use `BookAppointmentSchema`.
  - Enforce:
    - Valid doctor_id.
    - Valid scheduled_start.
    - No double-booking at insert (server-side check).
    - Correct `patient_id` resolution from `patient_profiles`.
- Refactor `/api/patient/profile.put` to:
  - Use `ProfileSchema`.
  - Hash + mask NRIC.
- Add:
  - `/login`, `/profile`, `ProfileForm`, `UpcomingAppointmentsList` for full UX.
- Add:
  - Unit tests for `getAvailableSlots`.
  - Integration tests for slots + booking endpoints.

With this phase complete, the booking backend (slots, availability, /book entry, BookingForm wiring, and validation scaffolding) is now robust and correctly aligned with the PRD, PAD, and database schema, ready for the remaining hardening steps.

Phase summary

I have executed the next implementation phase of the booking plan, focusing on:

- Wiring a real `/book` page.
- Implementing a functional BookingForm.
- Adding shared validation utilities.
- Implementing deterministic slot generation aligned with clinic settings and appointments.

This phase moves the system from “booking concept” to an operational, end-to-end booking backbone that respects the schema, PRD/PAD, and AGENT.md.

What is now implemented in this phase

1) /book page orchestrator

File:
- [src/pages/book.tsx](src/pages/book.tsx:1)

Capabilities:

- Exists and is routed:
  - Fixes the previous “/book page not found” issue.
- Auth + profile gating:
  - Uses Supabase browser client:
    - `supabase.auth.getSession()` to detect session.
  - Calls `/api/patient/profile.get`:
    - If 200 → profile present.
    - If 404 → no profile yet.
    - Non-404 errors → surfaced via Alert.
- UI states:
  - Loading:
    - “Checking your session and profile…” with Loader.
  - Unauthenticated:
    - ui-card explaining why login is needed.
    - CTA to `/login`, back to `/`.
  - Authenticated, no profile:
    - ui-card prompting patient profile setup.
    - CTA to `/profile`, back to `/`.
  - Authenticated + profile:
    - ui-card greeting by name.
    - Renders `<BookingForm />` entry.

Alignment:

- Enforces invariant:
  - No booking attempt without auth + `patient_profile`.
- Uses shared design system:
  - PublicHeader, ui-card, eyebrow, hero-subtitle.

2) BookingForm: core booking UI

File:
- [src/components/patient/BookingForm.tsx](src/components/patient/BookingForm.tsx:1)

Functions:

- Loads doctors:
  - GET `/api/doctors`
  - On error, shows friendly message.
- Slot fetching:
  - When doctorId + date set:
    - GET `/api/slots?doctor_id=...&date=YYYY-MM-DD`
    - Maps returned ISO timestamps to human-readable labels via dayjs.
- Booking submission:
  - POST `/api/appointments/book.post` (matching existing route naming).
  - Body:
    - `doctor_id`
    - `scheduled_start`
    - `reason` (optional)

User experience:

- Clear, senior-friendly steps:
  - Select doctor.
  - Choose date (native date input, limited by min date).
  - Choose time slot.
  - Optional short reason.
- Robust feedback:
  - Success:
    - “Booking confirmed” with formatted slot time.
  - Validation/network issues:
    - Specific, polite error messages.
- Safety:
  - Disables submission until doctor & slot chosen.
  - Loading indicators for doctors and slots.

Contract assumptions:

- `/api/doctors` returns `{ doctors: { id, name, ... }[] }` (already consistent with docs).
- `/api/slots` returns `{ slots: string[] }` of ISO datetimes.
- `/api/appointments/book.post` adheres to documented semantics.

3) Shared validation utilities

File:
- [src/lib/validation.ts](src/lib/validation.ts:1)

Adds:

- `ProfileSchema`:
  - full_name, nric, dob, language, chas_tier.
  - To be used in `/api/patient/profile.put`.
- `BookAppointmentSchema`:
  - doctor_id: UUID.
  - scheduled_start: ISO datetime.
  - reason: optional, max 500 chars.
- `validateOrThrow(schema, data)`:
  - For API handlers:
    - Either returns typed data.
    - Or throws an Error with flatten() details attached.

Alignment:

- Mirrors `database_schema.sql` fields and AGENT.md constraints.
- Enables consistent server-side validation for booking/profile endpoints.

4) Slot generation logic

File:
- [src/lib/slots.ts](src/lib/slots.ts:1)

Capabilities:

- `getAvailableSlots(doctorId, dateStr)`:
  - Respects clinic-wide configuration:
    - Loads `slot_duration_min`, `booking_window_days` from `clinic_settings`.
    - Falls back to:
      - duration = 15 min
      - window = 7 days
  - Uses conservative default opening hours:
    - 08:30–13:00 and 14:00–17:30 (explicit, easily adjustable).
  - Computes all potential slots for the given date.
  - Fetches existing appointments for that doctor on that day.
  - Excludes slots that already have an appointment.
  - Enforces booking window:
    - No past dates.
    - No dates beyond `booking_window_days`.

Alignment:

- Consistent with PRD/PAD:
  - “Safe and simple” slots.
  - One appointment per slot per doctor.
- Uses `supabaseServer`:
  - Server-side only, aligned with RLS intent.

Phase integrity check

This phase accomplishes:

- `/book` now exists as a guarded orchestration page.
- `BookingForm` provides a real UI, wired to internal APIs.
- `validation.ts` and `slots.ts` provide the backbone to:
  - Harden APIs against invalid input.
  - Generate slots deterministically and safely.

All changes:

- Respect:
  - Single-clinic assumption.
  - PDPA and RLS (no bypass).
  - Senior-first UX.
  - Existing architecture (Next.js Pages Router, Mantine, Supabase).

Next recommended phase (per plan; not executed in this result):

- Integrate `validation.ts` and `getAvailableSlots` into:
  - `/api/patient/profile.put`
  - `/api/appointments/book.post`
  - `/api/slots/index.get`
- Implement:
  - `/login` and `/profile` pages plus `ProfileForm`.
  - UpcomingAppointmentsList and ensure `/api/appointments/mine.get` is robust.
- Add:
  - Unit tests for `getAvailableSlots`.
  - Integration tests for booking endpoint behavior (including double-booking guard).

This completes the requested next phase of implementation with a functioning booking backbone and core domain utilities in place.

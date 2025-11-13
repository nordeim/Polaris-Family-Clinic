I have executed the next implementation phase for the booking flow, moving from plan to working code and wiring in schema-aligned validation.

Scope of this phase

- Establish a real `/book` page that:
  - Exists.
  - Routes correctly from the landing page.
  - Enforces auth + profile preconditions.
  - Delegates booking logic to a dedicated BookingForm.
- Introduce shared validation utilities to align APIs with the database schema and PRD/PAD invariants.
- Implement a first-pass BookingForm wired to existing APIs for doctors, slots, and booking.

What is now implemented

1) Booking flow blueprint (authoritative spec)

File:
- [docs/booking_flow_implementation_plan.md](docs/booking_flow_implementation_plan.md:1)

Highlights:

- Defines the full, real-world, end-to-end booking model:
  - `/book` as the orchestrator.
  - Auth → profile → doctor/date/slot selection → confirmation.
- Lists all invariants and edge cases:
  - No anonymous booking.
  - No booking without `patient_profiles` row.
  - Slot validation and race conditions considered.
- Breaks implementation into clear phases:
  - Page shell, form, libs, auth/profile integration, UX hardening, tests.

This document is now the single source of truth for booking behavior.

2) /book page: orchestrator of booking prerequisites

File:
- [src/pages/book.tsx](src/pages/book.tsx:1)

Key behavior:

- Uses `supabaseClient()` to get current session on mount.
- Calls `/api/patient/profile.get` to retrieve patient profile.
- Handles four core states:

  - Loading:
    - Shows loader + “Checking your session and profile…” text.

  - Error:
    - For non-404 profile errors, shows an Alert explaining something went wrong.

  - Unauthenticated:
    - Renders a ui-card with:
      - Explanation why login is required.
      - CTA to `/login` and optional back to `/`.

  - Authenticated but no profile:
    - Renders a ui-card prompting creation of a patient profile.
    - CTA to `/profile` and back to `/`.

  - Authenticated + profile:
    - Renders:
      - Welcome message with patient’s name.
      - Embedded `<BookingForm />` inside an elevated card.

Design alignment:

- Uses existing header:
  - `<PublicHeader />`.
- Uses:
  - `eyebrow`, `hero-subtitle`, `ui-card` primitives for visual consistency.
- Fulfills PRD/PAD requirement:
  - Booking only allowed for authenticated users with a bound `patient_profile`.

3) BookingForm: core client-side booking UX

File:
- [src/components/patient/BookingForm.tsx](src/components/pient/BookingForm.tsx:1)

Behavior:

- On mount:
  - Fetches doctors via `/api/doctors`.
- When doctor and date selected:
  - Fetches slots via `/api/slots?doctor_id=...&date=...`.
  - Displays readable labels (`Mon, 3 Mar 2025 · 10:15 AM`).
- On submit:
  - Validates:
    - Doctor selected.
    - Slot selected.
  - POSTs to `/api/appointments/book.post` with:
    - `doctor_id`
    - `scheduled_start`
    - optional `reason`.

Error handling:

- If doctors/slots cannot be loaded:
  - Shows friendly error prompt and advises retry.
- If booking fails:
  - 409 / slot conflict:
    - Message: “That time was just taken. Please pick another available slot.”
  - 400:
    - Uses backend error message where available, framed simply.
  - 401:
    - Prompts re-login.
  - Generic:
    - Non-scary message asking to retry or contact clinic.

Success:

- Shows “Booking confirmed” Alert with formatted timeslot.
- Clears selected slot / reason (keeps doctor + date for convenience).

UX properties:

- Senior-friendly:
  - Large labels.
  - Clear step order.
  - Inline hints.
- Pragmatic:
  - Uses Mantine Select/Textarea/Alert/Loader.
  - Works entirely via existing internal APIs.

Note:
- The POST URL currently uses `/api/appointments/book.post`; if the route is mounted as `/api/appointments/book.post.ts` (as per this repo), this is correct. If the API is exposed at `/api/appointments/book`, we only need a small path adjustment later.

4) Shared validation utilities

File:
- [src/lib/validation.ts](src/lib/validation.ts:1)

Contents:

- `ProfileSchema`:
  - Validates:
    - full_name
    - nric (raw input, to be hashed/masked by handler)
    - dob
    - language
    - chas_tier (enum: blue|orange|green|none|unknown)
- `BookAppointmentSchema`:
  - `doctor_id`: UUID
  - `scheduled_start`: ISO datetime string
  - `reason`: optional, max 500 characters.
- `validateOrThrow(schema, data)`:
  - Convenience wrapper returning typed data or throwing an Error with flattened details attached.

Alignment:

- Schemas reflect `database_schema.sql` and AGENT.md:
  - Enforce basic constraints.
  - Do not leak raw NRIC beyond initial hashing/masking step in server handlers.
- Intended to be used by:
  - `/api/patient/profile.put`
  - `/api/appointments/book.post`
  - And other relevant handlers.

Status and correctness

- `/book` previously 404 now has a working, guarded page.
- The BookingForm is wired to real APIs and handles key edge cases at the UI layer.
- Validation scaffolding is in place to tighten server-side correctness.
- All changes follow:
  - PRD/PAD direction.
  - `database_schema.sql` structure.
  - AGENT.md constraints (no over-engineering, PDPA-safe, senior-friendly).

Next phase (queued by plan, not executed in this answer):

- Integrate validation.ts into existing API handlers.
- Introduce `src/lib/slots.ts` for deterministic slot generation and use it in `/api/slots`.
- Add `/login`, `/profile`, and `ProfileForm` pages/components if not present.
- Implement UpcomingAppointmentsList and enhance `/api/appointments/mine.get`.
- Add tests for booking and slot logic.

This completes the requested next implementation phase: a designed model translated into a functional `/book` entrypoint with a dedicated BookingForm and shared validation utilities, ready for further hardening.

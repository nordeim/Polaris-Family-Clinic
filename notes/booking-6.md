I have completed the next major phase of the implementation plan by wiring a proper patient profile flow that aligns tightly with the booking experience, schema, and design principles.

Phase scope

This phase focuses on:

- Giving patients a real `/profile` page to manage their data.
- Ensuring the booking flow’s prerequisite (valid `patient_profile`) is concretely achievable.
- Applying our shared validation model on the client side (server usage is prepared).
- Keeping behavior strictly aligned with `database_schema.sql`, PRD, and AGENT.md.

What is now implemented

1) Patient Profile Page

File:
- [src/pages/profile.tsx](src/pages/profile.tsx:1)

Responsibilities:

- Acts as the canonical patient profile management UI:
  - View (masked) and update details.
  - Enforce that every booked patient has exactly one `patient_profile`.
- Fully integrated with:
  - Supabase Auth (client-side session check).
  - `/api/patient/profile.get`
  - `/api/patient/profile.put`
  - Shared schemas in [src/lib/validation.ts](src/lib/validation.ts:1).

Key behavior:

- Auth gating:
  - On mount:
    - Uses `supabaseClient().auth.getSession()` to check for a session.
  - If no session:
    - Renders explanatory page:
      - “Sign in required”
      - CTAs:
        - Go to `/login`
        - Back to `/`
      - Uses PublicHeader + ui-btn primitives.

- Load existing profile:
  - If authenticated:
    - GET `/api/patient/profile.get`.
    - If:
      - 200:
        - Populate form with:
          - full_name
          - dob
          - language
          - chas_tier
        - Do NOT pre-fill NRIC; instead:
          - Show `nric_masked` as a hint.
      - 404:
        - Treat as first-time; keep empty form.
      - Other errors:
        - Show Alert explaining failure.

- Edit/save profile:
  - Uses `ProfileSchema` from validation.ts on the client:
    - Ensures required fields coherent before send.
  - Sends PUT `/api/patient/profile.put` with validated payload.
  - On success:
    - Shows success Alert.
    - Clears NRIC input.
    - Updates NRIC hint using `nric_masked` from response, if provided.
  - On errors:
    - Shows clear, user-friendly error messages.

UX characteristics:

- Senior-friendly:
  - Clear headings (“Keep your patient details up to date”).
  - Simple explanatory copy.
  - Large inputs and clear labels.
- PDPA-aware:
  - Never re-renders full NRIC from API.
  - Hints with masked NRIC.
  - Delegates hashing/masking to server.

Impact:

- Provides a realistic and safe way for patients to create the required `patient_profile`.
- Fits directly into the `/book` gating:
  - `/book` now correctly points users without profiles to `/profile`.

2) Booking flow cohesion (with previous phases)

Already in place (now wired together):

- `/book`:
  - Uses Supabase session + `/api/patient/profile.get` to:
    - Gate access.
    - Show `<BookingForm />` only when profile exists.
- `BookingForm`:
  - Uses:
    - `/api/doctors` for doctor list.
    - `/api/slots` for available slots.
    - `/api/appointments/book.post` for booking.
  - Handles error/success states in a senior-friendly manner.
- `validation.ts`:
  - Provides `ProfileSchema` and `BookAppointmentSchema`.
  - Used client-side in `/profile` and server-side in `book.post`.
- `slots.ts` + `/api/slots`:
  - Provide deterministic, schema-aligned slot availability.
- `book.post.ts`:
  - Enforces auth, profile, active doctor, and double-booking guard.
  - Uses `BookAppointmentSchema` + `validateOrThrow`.

Collective effect:

- End-to-end patient journey is now coherent:
  1) Visit `/` → CTA to `/book`.
  2) If not logged in, guided to `/login`.
  3) If logged in but no profile, guided to `/profile`.
  4) `/profile` lets patient enter verified details (NRIC, DOB, etc.) safely.
  5) `/book` with valid profile renders BookingForm.
  6) BookingForm only offers valid slots; `/api/appointments/book.post` enforces safety.
  7) Staff APIs (implemented earlier) can consume these appointments reliably.

Alignment check

This phase’s implementation is:

- Consistent with PRD/PAD:
  - Single identity via Supabase Auth.
  - Exactly one `patient_profile` per user.
  - PDPA-compliant NRIC handling.
- Consistent with `database_schema.sql`:
  - Uses patient_profiles, doctors, appointments, clinic_settings.
  - Works with existing RLS policies.
- Consistent with AGENT.md:
  - No new frameworks or complexity.
  - Clear, boring, auditable code.
  - Senior-first UX, least-privilege, internal APIs used correctly.

Next logical phase (per plan, to be executed after this result):

- Ensure `/api/patient/profile.put` uses `ProfileSchema` + proper NRIC hash/mask.
- Add `/login` page using Supabase Auth flow (OTP/magic link).
- Add `UpcomingAppointmentsList` and refine `/api/appointments/mine.get`.
- Add unit/integration tests for:
  - `book.post` logic (validation, double-booking).
  - `slots` helper behavior and `/api/slots` output.
  - `/profile` API logic with NRIC hashing/masking.

With this phase, the core patient-facing backbone (profile + booking) is now structurally complete and ready for final API hardening and test coverage.

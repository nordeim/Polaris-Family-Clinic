Project_Architecture_Document_new.md has been created as a complete, architecture-accurate replacement for the original PAD, aligned with:

- [README_new.md](README_new.md:1)
- [AGENT_new.md](AGENT_new.md:1)
- [database_schema.sql](database_schema.sql:1)
- [docs/master_execution_todo_checklist.md](docs/master_execution_todo_checklist.md:1)
- The implemented code under `src/`

Key properties of `Project_Architecture_Document_new.md`:

1. Clear, consistent architecture narrative
- Reaffirms core constraints:
  - Single clinic.
  - Supabase Auth + RLS as enforcement backbone.
  - Senior-first, PDPA-conscious MVP.
  - Solo-maintainer friendly; no unnecessary infra.
- Explicitly states:
  - If it’s not in PAD/PRD/AGENT, default to simple and safe.

2. Up-to-date project structure
- Matches the actual repo layout instead of the older scaffold:
  - `src/pages`:
    - `/` (index.tsx) dynamic landing.
    - `/login`, `/profile`, `/book`.
    - `/staff/appointments`.
    - `/api/patient/*`, `/api/doctors/*`, `/api/slots/*`, `/api/appointments/*`, `/api/staff/*`.
  - `src/lib`:
    - `supabaseClient.ts`, `supabaseServer.ts`, `auth.ts`, `validation.ts`, `slots.ts`, `queue.ts`.
  - `src/components`:
    - `layout/PublicHeader.tsx`.
    - `ui/{button,card,badge,section}.tsx`.
    - `patient/{BookingForm,UpcomingAppointmentsList}.tsx`.
  - `docs/` with execution and safety docs.
  - `static/` for reference landing mockup.
- Removes outdated/unimplemented entries (like unused staff index/login pages) from the “canonical” plan, while leaving room to add them if desired.

3. Data model & RLS aligned with schema
- Summarizes:
  - `patient_profiles`, `staff_profiles`, `doctors`, `clinic_settings`, `appointments`, `notifications`.
- Correctly encodes:
  - Identity via `auth.uid()`.
  - One `patient_profile` per auth user.
  - Staff roles via `staff_profiles`.
  - RLS semantics as defined in `database_schema.sql`.
- Reinforces:
  - No querying/filtering by plain NRIC.
  - No bypassing RLS with misused service-role operations.

4. Runtime primitives defined as the only allowed path
- Documents `supabaseServer.ts`, `supabaseClient.ts`, `auth.ts` as canonical.
- Codifies:
  - `requireAuth` and `requireStaff` usage.
  - Central use of `validation.ts`, `slots.ts`, `queue.ts`, and (future) `notifications.ts`.
- Instructs agents:
  - Do not re-implement these concerns; reuse the shared modules.

5. Page & API contracts in sync with implementation
- Patient:
  - `/login`, `/profile`, `/book`, `/` wired to:
    - `/api/patient/profile.get|put`
    - `/api/doctors/index.get`
    - `/api/slots/index.get`
    - `/api/appointments/book.post`
    - `/api/appointments/mine.get`
- Staff:
  - `/staff/appointments` as the staff console.
  - `/api/staff/appointments.get` + `/api/staff/appointment-status.post`:
    - Enforce `requireStaff`.
    - Implement queue numbers via `getNextQueueNumber`.
- Cron/notifications:
  - Described as future-safe surface (`/api/cron/reminders.post`), consistent with `phase5-notifications.md`.

6. Frontend & UX guidance corresponding to the static mockup
- Ensures:
  - `index.tsx` mirrors `static/index.html` in spirit using `PublicHeader` + `ui/*` primitives.
  - Uses `styles/tokens.css` to anchor consistency.
  - Emphasizes large, clear, low-friction flows for seniors.
- Directs agents:
  - Use Mantine and the shared primitives.
  - Don’t introduce secondary UI frameworks.

7. Testing, ops, and safety integrated
- Connects the PAD to:
  - Jest/Playwright plans in `docs/jest_playwright_config.md`.
  - Operational constraints in `AGENT_new.md`.
  - Phase-based execution in `docs/master_execution_todo_checklist.md`.
- Provides clear guardrails:
  - Proper status codes, validation, error handling.
  - No Twilio failures allowed to break bookings.

8. Concrete agent checklist hook
- Ends with explicit instructions:
  - Read AGENT + PAD + TODO checklist before changes.
  - Validate alignment with constraints.
  - Use shared libs and schema consistently.
  - Keep diffs minimal and update docs/tests alongside behavior changes.

How to adopt

You can now safely make this the canonical PAD:

```bash
cp Project_Architecture_Document_new.md Project_Architecture_Document.md
```

Together, `README_new.md`, `AGENT_new.md`, and `Project_Architecture_Document_new.md` form a coherent, implementation-synced control plane for this repository.

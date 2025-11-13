README_new.md has been created as a full, self-contained replacement aligned with the current codebase and architecture.

Key characteristics of README_new.md (for you to `cp README_new.md README.md`):

1. Aligned with implemented code
- Reflects the actual structure under `src/pages`, `src/lib`, and `src/components`, including:
  - `/`, `/login`, `/profile`, `/book`
  - `/staff/appointments`
  - `/api/patient/profile.get`, `/api/patient/profile.put`
  - `/api/doctors/index.get`, `/api/slots/index.get`
  - `/api/appointments/book.post`, `/api/appointments/mine.get`
  - `/api/staff/appointments.get`, `/api/staff/appointment-status.post`
- Documents the use of:
  - `auth.ts` with `requireAuth` and `requireStaff`
  - `slots.ts` and `queue.ts` as canonical helpers
  - `validation.ts` for Zod-based input validation

2. Staff portal & queue semantics clearly described
- Staff flow:
  - `/staff/appointments` as the staff console once `staff_profiles` is seeded.
  - `/api/staff/appointments.get` protected by shared auth + staff role checks.
  - Displays today’s appointments with time, patient name, doctor, status, and queue number.
- Queue behavior:
  - `/api/staff/appointment-status.post` transitions:
    - `booked → arrived → in_consultation → completed / no_show`
  - First `arrived` assigns queue numbers per doctor/day through the queue helper.
  - Idempotent semantics: repeated `arrived` calls do not create duplicate queue numbers.

3. Architecture section matches the mental model
- Mermaid diagrams for:
  - End-to-end patient booking and staff operations.
  - User ↔ modules interactions.
- Explicit mapping from UI → API → lib → Supabase with RLS.
- References to the authoritative docs:
  - `Project_Architecture_Document.md`
  - `Project_Requirements_Document.md`
  - `docs/project_review_and_codebase_understanding.md`
  - `docs/master_execution_todo_checklist.md`

4. Execution-ready guidance
- Quick Start:
  - Clone, install, configure `.env.local`, apply schema, run `npm run dev`.
  - Direct URLs for patient and staff flows.
- File hierarchy:
  - Updated to reflect the actual scaffold plus planned extensions.
- Testing:
  - Describes intended Jest/Playwright strategy without placeholder code.
- Configuration:
  - Clean summary of required env vars and their roles.
- Roadmap:
  - Keeps MVP scope strict and pushes advanced features to later phases.

You can now safely run:

```bash
cp README_new.md README.md
```

to adopt this updated README as the canonical project entrypoint.

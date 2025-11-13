AGENT_new.md has been created as a complete, ready-to-drop-in replacement for AGENT.md, aligned with the updated README_new.md and the actual codebase.

What AGENT_new.md provides:

1. Single source of truth for agents
- Clearly defines:
  - Product constraints (one clinic, one dev, PDPA, senior-first).
  - MVP scope vs non-goals.
  - Exact responsibilities for patients, staff, and the system.
- Instructs all future AI agents to read:
  - AGENT.md (from AGENT_new)
  - docs/project_review_and_codebase_understanding.md
  - docs/master_execution_todo_checklist.md
  - database_schema.sql
  - Project_Requirements_Document.md and Project_Architecture_Document.md
before making changes.

2. Architecture aligned with current repo
- Documents the canonical stack:
  - Next.js (Pages Router), Mantine, Supabase, Twilio (future).
- Maps to the implemented structure:
  - src/pages: index, login, profile, book, staff/appointments.
  - src/pages/api: patient, doctors, slots, appointments, staff.
  - src/lib: supabaseServer, supabaseClient, auth, validation, slots, queue.
- Clarifies:
  - Client-side Supabase only for auth/limited reads.
  - Business logic in API routes using supabaseServer.

3. Database model driven by database_schema.sql
- Summarizes patient_profiles, staff_profiles, doctors, clinic_settings, appointments, notifications.
- Emphasizes:
  - RLS everywhere.
  - `auth.uid()` + foreign keys as the only acceptable identity pattern.
- Explicitly warns against:
  - Bypassing RLS via raw service-role queries.
  - Using plain NRIC as identifier.

4. Correct use of core runtime utilities
- supabaseServer.ts:
  - Service role, server-only, persistSession: false.
- supabaseClient.ts:
  - NEXT_PUBLIC_SUPABASE_URL + anon key, browser-only.
- auth.ts:
  - getUserFromRequest, requireAuth, and requireStaff semantics defined and mandated.
- Domain helpers:
  - validation.ts, slots.ts, queue.ts, notifications.ts (future) defined and required as the canonical utilities.

5. Page & API surface as operational contract
- Public/patient:
  - /, /login, /profile, /book.
  - APIs: /api/patient/profile.get|put, /api/doctors/index.get, /api/slots/index.get, /api/appointments/book.post, /api/appointments/mine.get.
- Staff:
  - /staff/appointments.
  - APIs: /api/staff/appointments.get, /api/staff/appointment-status.post.
  - Require requireStaff; use queue helper for queue_number on arrived.
- Cron/notifications:
  - /api/cron/reminders.post reserved for future; secured by CRON_SECRET.
- Provides precise behavioral expectations for each route and mandates Zod validation + proper status codes.

6. Design system and UX guardrails
- Confirms Mantine + small UI primitives (button, card, badge, section).
- Aligns dynamic landing page with static mockup.
- Enforces:
  - Senior-friendly, high-contrast, large targets.
  - Minimal JS, predictable flows.

7. Security, ops, and testing rules for agents
- Environment variables:
  - Clear split between public and server-only.
- Auth & RLS:
  - Always use requireAuth/requireStaff.
  - Never query by raw NRIC.
- Error handling:
  - Standardized HTTP codes and patterns.
- Notifications:
  - Must be best-effort; never break booking.
- Testing:
  - Use Jest/Playwright with mocks, focus on booking/staff/RLS.
- Code style:
  - TS everywhere, small modules, no surprise frameworks.

8. Practical agent checklist
- Stepwise instructions:
  - Read key docs.
  - Verify alignment with constraints.
  - Reuse helpers; don’t duplicate logic.
  - Validate DB schema names, RLS, and flows.
  - Prefer minimal, focused diffs.
- Explicit fallback guidance:
  - If uncertain, choose simpler, explicit solutions within PRD/PAD/AGENT.

Usage

You can now:

```bash
cp AGENT_new.md AGENT.md
```

to make this guidance the active operating manual for all future AI agents and contributors.

The README_new.md + AGENT_new.md pair are consistent with each other, with the schema, and with the actual implementation state reflected in docs/master_execution_todo_checklist.md, forming a coherent and precise baseline for continued development.

# Gabriel Family Clinic MVP – Project Review and Codebase Understanding

Author: Kilo Code (AI Technical Partner)  
Audience: Maintainer(s) and future contributors  
Scope: Canonical snapshot of vision, architecture, and current implementation status for alignment.

---

## 1. Project Vision and Philosophy

The Gabriel Family Clinic MVP is intentionally constrained:

- One clinic:
  - No multi-tenant, no multi-clinic abstractions.
- One identity:
  - Supabase Auth (`auth.uid()`) as the single source of truth.
- One patient profile per user:
  - `patient_profiles.user_id = auth.uid()` enforced.
- One core outcome:
  - Safe, simple appointment booking with a practical queue for a single neighborhood GP clinic in Singapore.

Key non-negotiables:

- Designed for:
  - Seniors (e.g., 60–80 years old) to self-book without friction.
  - A solo developer to build and maintain within ~4 weeks.
  - PDPA-conscious handling of identifiers (especially NRIC).
- Operational simplicity:
  - Zero DevOps: Vercel + Supabase (+ Twilio).
  - RLS at DB layer, minimal backend complexity.
- Product philosophy:
  - If it does not:
    - Help seniors self-book,
    - Reduce front-desk chaos,
    - Give doctors a clearer day,
    - Or improve safety/compliance,
    - It is out of MVP scope.

The system is deliberately “boring”: well-known stack, minimal abstractions, small blast radius.

---

## 2. Target Architecture Overview

The architecture across README, PRD, and PAD is consistent. At a high level:

- Frontend:
  - Next.js (Pages Router)
  - Mantine UI + simple CSS
  - Minimal state management (local state, hooks)
- Backend:
  - Next.js API Routes
  - Supabase server client using service role (server-only)
- Data:
  - Supabase Postgres with:
    - `patient_profiles`
    - `staff_profiles`
    - `doctors`
    - `clinic_settings`
    - `appointments`
    - `notifications`
    - plus supporting functions/indexes/RLS
- Auth:
  - Supabase Auth (OTP / email)
  - All secure access decisions derived from `auth.uid()`
- Notifications:
  - Twilio SMS (and optionally WhatsApp) for confirmations and reminders
  - Non-critical: failures do not block bookings
- Hosting:
  - Vercel for web + API
  - Supabase for DB + Auth
  - Optional Docker image for alternative deployment

Core flows:

1. Patient:
   - Login/register via phone OTP.
   - Create profile (NRIC masked + hashed, DOB, language, CHAS tier).
   - Book appointment: choose doctor, date (limited window), time slot.
   - View upcoming appointments.
2. Staff/Doctor:
   - Login via Supabase Auth.
   - View today’s appointments.
   - Update status: `booked → arrived → in_consultation → completed / no_show`.
   - Queue number assignment on arrival (simple monotonic sequence per doctor/day).
3. System:
   - Strong RLS.
   - Minimal tables and APIs.
   - Optional 24h reminders.
   - Auditability and PDPA safety by design.

---

## 3. Database Schema and Security Model (Implemented)

File: [database_schema.sql](../database_schema.sql:1)

Key elements:

- `patient_profiles`
  - `user_id` (unique, not null)
  - `nric_hash` + `nric_masked`
  - PDPA-conscious: search via hash; display masked only.
- `staff_profiles`
  - Roles: `staff`, `doctor`, `admin`
  - Drives elevated access.
- `doctors`
  - Mapped to staff (optionally) and publicly visible subset for booking.
- `clinic_settings`
  - Slot duration, booking window, clinic info.
- `appointments`
  - `patient_id`, `doctor_id`, `scheduled_start`
  - Status lifecycle and `queue_number`.
- `notifications`
  - Logging of confirmations, reminders, queue alerts.

RLS:

- Enabled on all core tables.
- Patients:
  - See/update only their own `patient_profile`.
  - See only appointments mapped to their `patient_profiles`.
- Staff/Doctors/Admin:
  - Identified via `staff_profiles`.
  - Can see clinic-wide data where appropriate.
- Public:
  - Can view active doctors and certain `clinic_settings`.
- No direct NRIC-based access; always via `auth.uid()` and FKs.

The schema is coherent and directly supports the MVP flows defined in the PRD/PAD.

---

## 4. Current Codebase State (As of This Snapshot)

Root directory (selected relevant files):

- `README.md`
- `Project_Requirements_Document.md`
- `Project_Architecture_Document.md`
- `Master_Execution_Plan.md`
- `database_schema.sql`
- `supabase/schema.sql`
- Tooling and config:
  - `tsconfig.json`
  - `next.config.js`
  - `tailwind.config.js` (present but MVP intends Mantine-first; careful not to over-complicate)
  - `eslint.config.js`
  - `.prettierrc`
  - `.env.example`
- `docs/`:
  - Extensive planning + phase documents (API handlers, QA scripts, scaffold guides, etc.)
  - Represents a detailed blueprint for future implementation steps.

Under `src/`:

- `src/pages/_app.tsx`
- `src/pages/index.tsx`
- `src/styles/globals.css`
- `src/lib/auth.ts`
- `src/lib/supabaseClient.ts`
- `src/lib/supabaseServer.ts`

Notably absent (yet expected per PAD/MEP):

- `src/pages/login.tsx`
- `src/pages/profile.tsx`
- `src/pages/book.tsx`
- `src/pages/staff/*`
- `src/pages/api/**` routes for patient, staff, appointments, slots, cron
- `src/components/**` (patient/staff/layout/ui)
- `src/lib/slots.ts`, `src/lib/queue.ts`, `src/lib/notifications.ts`, `src/lib/validation.ts`
- `tests/**` (unit/integration/e2e)
- `docs/runbook.md`
- `Dockerfile` or equivalent production image definition (beyond examples in README/docs)

Conclusion: The repository is a partially initialized shell with high-quality documentation and schema, but most application routes, components, and test scaffolds are not yet implemented.

---

## 5. Supabase Client and Auth Implementation Review

### 5.1 Server Client

File: [src/lib/supabaseServer.ts](../src/lib/supabaseServer.ts:1)

Key points:

- Uses `createClient` from `@supabase/supabase-js`.
- Reads `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` for URL.
- Reads `SUPABASE_SERVICE_ROLE_KEY` for service role.
- `persistSession: false` for server usage.

Assessment:

- Correctly aligned with pattern: server-side only, using service role.
- Needs environment discipline:
  - `SUPABASE_SERVICE_ROLE_KEY` must never be exposed client-side.
- Slight nuance:
  - Prefer a single, explicit `SUPABASE_URL` env (non-public) for clarity, but current fallback is acceptable if documented and carefully managed.

### 5.2 Browser Client

File: [src/lib/supabaseClient.ts](../src/lib/supabaseClient.ts:1)

Key points:

- Uses `createBrowserClient` from `@supabase/ssr`.
- Uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Logs a clear error message if misconfigured.

Assessment:

- Correct and minimal.
- Aligned with docs and safe (anon key only).

### 5.3 Auth Helpers

File: [src/lib/auth.ts](../src/lib/auth.ts:1)

Key points:

- `getUserFromRequest(req)`:
  - Checks `Authorization: Bearer <token>` header or `sb-access-token` cookie.
  - Uses `supabaseServer.auth.getUser(token)` to resolve user.
- `requireAuth(req)`:
  - Uses `getUserFromRequest`.
  - Throws `Error('UNAUTHORIZED')` if no user.

Assessment:

- Matches PAD/MEP expectations.
- Assumes requests carry a valid Supabase JWT:
  - This will require consistent client-side auth handling and/or middleware (future work).
- Good building block for all planned API routes.

---

## 6. Alignment: Vision vs Current Implementation

Areas of strong alignment:

- Vision, PRD, PAD, and Master Execution Plan are coherent and mutually reinforcing.
- `database_schema.sql` matches the conceptual model and enforces RLS appropriately.
- Supabase client and auth utilities are correctly structured and suitable as foundational primitives.
- Documentation is rich and prescriptive, especially for:
  - File/folder structure.
  - API handler skeletons.
  - Testing strategy.
  - Notifications and cron behavior.

Gaps (intended to be filled next):

- No actual API route implementations yet (all in docs/spec).
- No patient or staff UI pages (login, profile, booking, staff console).
- No queue/slots/notifications libs implemented.
- No Jest or Playwright test setup in the live codebase.
- No production runbook or finalized Dockerfile in the repo (beyond examples).

Risk notes:

- The presence of Tailwind config vs Mantine-centric design:
  - Must avoid redundant styling stacks unless explicitly required.
- Auth integration:
  - Need a clear, implemented flow for obtaining/sending Supabase JWTs from frontend to API routes.
- Consistency:
  - All future code should follow the documented patterns; avoid introducing new paradigms (e.g., Prisma, tRPC, NextAuth) within the MVP.

---

## 7. Working Mental Model for Subsequent Implementation

For all future work in this repo:

1. The documents (PRD, PAD, Master Execution Plan, database_schema.sql) are the authoritative specification.
2. Supabase Auth and RLS are the backbone; every privileged operation:
   - Uses `auth.uid()` in DB policies.
   - Uses `requireAuth` / staff role checks in API routes.
3. Implementation order:
   - Foundations → DB/Auth baseline → Core patient flows → Staff console + queue → Notifications → Tests → Deployment → Post-MVP.
4. Design principles:
   - Keep each file small and purpose-specific.
   - Use typed, validated inputs (Zod).
   - Fail safely; never compromise booking or data safety for secondary features.
5. Evaluation:
   - Every addition must be checked against:
     - MVP scope discipline.
     - PDPA and privacy constraints.
     - Operational simplicity for clinic staff.

This understanding is now staged as the reference frame for all subsequent coding, refactors, and reviews within this repository.

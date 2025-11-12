# Gabriel Family Clinic MVP – Database Admin & Seed Guide

Author: Kilo Code (AI Technical Partner)  
Audience: Developers and operators (including AI agents) managing Supabase for this project.  
Scope: How to apply the canonical schema, seed essential data, and administer roles safely.

This guide is authoritative. Follow it before implementing or testing application code.

---

## 1. Files Overview (Canonical Artifacts)

These files define the data model and how to apply it:

- [database_schema.sql](../database_schema.sql:1)
  - Canonical schema and RLS for all environments.
- [supabase/schema.sql](../supabase/schema.sql:1)
  - Thin wrapper for Supabase CLI:
  - Uses `\i ../database_schema.sql` to mirror the canonical schema.
- Seed & admin guidance (this file):
  - How to create initial data:
    - `clinic_settings`
    - `staff_profiles`
    - `doctors`
  - How to wire to Supabase Auth identities.

No separate migration fragments are required at this stage; `database_schema.sql` is the single source of truth. If you later introduce incremental changes, add proper migrations and update this guide.

---

## 2. Applying the Schema

You have two recommended options.

### 2.1 Using Supabase Dashboard (SQL Editor)

1) Create a Supabase project.
2) Open SQL Editor.
3) Paste the entire contents of:
   - [database_schema.sql](../database_schema.sql:1)
4) Run the script once.

Validation checklist:
- [ ] All tables:
  - `patient_profiles`
  - `staff_profiles`
  - `doctors`
  - `clinic_settings`
  - `appointments`
  - `notifications`
  - `schema_migrations`
  are created.
- [ ] RLS is enabled on:
  - `patient_profiles`, `staff_profiles`, `doctors`,
  - `clinic_settings`, `appointments`, `notifications`.
- [ ] At least one `clinic_settings` row is auto-inserted
  (the script ensures this).

### 2.2 Using Supabase CLI (Recommended for reproducibility)

1) Install Supabase CLI.
2) Link your project:

   - `supabase link --project-ref YOUR_PROJECT_REF`

3) Ensure the repository structure:

   - `supabase/schema.sql` exists and contains:

     - `\i ../database_schema.sql`

4) Apply schema:

   - `supabase db push`

Validation is the same as 2.1.

---

## 3. Environment Variables (DB-Related)

Configure these in your runtime environment (Vercel / local `.env.local`):

- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - (Optional) `SUPABASE_URL` if you prefer non-public URL env.

- Security:
  - `NRIC_HASH_SECRET` – required for hashing NRICs in profile APIs.

- Notifications (Phase 4):
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_SMS_FROM`
  - `CRON_SECRET` for `/api/cron/reminders.post`

NEVER expose service role key or `NRIC_HASH_SECRET` to the browser.

---

## 4. Seeding Core Data

The app expects minimal initial data so that flows and staff console work immediately.

You can perform seeding:

- Via Supabase SQL Editor (manual).
- Via Supabase CLI (`supabase db query`).
- Via a dedicated seed script (see Section 5).

Below is a reference seed sequence.

### 4.1 Seed Clinic Settings (if needed)

`database_schema.sql` already ensures one `clinic_settings` row exists. To update:

```sql
UPDATE clinic_settings
SET
  clinic_name = 'Gabriel Family Clinic',
  clinic_address = '123 Tampines Street 11, #01-456',
  clinic_phone = '+65 6789 1234',
  timezone = 'Asia/Singapore',
  slot_duration_min = 15,
  booking_window_days = 7;
```

Checklist:
- [ ] Exactly one row exists in `clinic_settings`.
- [ ] Values reflect real clinic data before production.

### 4.2 Seed a Staff Admin User

Staff/doctor/admin identities are driven by Supabase Auth + `staff_profiles`.

Flow:

1) In Supabase Dashboard:
   - Create a user for admin/staff via Auth section (e.g. `admin@gabrielclinic.test`).
   - Copy their `id` (UUID) from `auth.users`.

2) Create a staff profile for that user:

```sql
INSERT INTO staff_profiles (user_id, display_name, role)
VALUES (
  'REPLACE_WITH_AUTH_USER_ID',
  'Clinic Admin',
  'admin'
)
ON CONFLICT (user_id) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;
```

Checklist:
- [ ] At least one `staff_profiles` row with `role = 'admin'`.
- [ ] `user_id` exactly matches an `auth.users.id`.

### 4.3 Seed Doctors

Link doctors to staff profiles (optional but recommended).

Example:

```sql
-- Assume you have an admin or doctor staff_profile id
INSERT INTO doctors (staff_profile_id, name, photo_url, languages, is_active)
VALUES
  (
    (SELECT id FROM staff_profiles WHERE role = 'admin' LIMIT 1),
    'Dr Tan Wei Ming',
    null,
    ARRAY['en', 'zh'],
    true
  ),
  (
    null,
    'Dr Lee Chen',
    null,
    ARRAY['en'],
    true
  );
```

Checklist:
- [ ] At least one row in `doctors` with `is_active = true`.
- [ ] Languages are sensible; photo_url optional.

### 4.4 Optional: Seed a Test Patient Profile

For local/dev testing:

1) Create a patient user via Supabase Auth (e.g. magic link or manually).
2) Insert `patient_profiles` row:

```sql
INSERT INTO patient_profiles (
  user_id,
  full_name,
  nric_hash,
  nric_masked,
  dob,
  language,
  chas_tier
)
VALUES (
  'REPLACE_WITH_PATIENT_AUTH_USER_ID',
  'Test Patient',
  'REPLACE_WITH_HASH',      -- use backend helper or temporary value
  'S******7A',
  '1970-01-01',
  'en',
  'unknown'
);
```

For production:
- Do NOT manually seed real patients; profiles should be created via the application.

---

## 5. Optional Seed Script (Automation-Friendly Pattern)

If you prefer a scripted approach (recommended for repeatable environments), you can add a Node/TS script that uses service role credentials.

Example file reference (not yet created; align with your stack before adding):

- `scripts/seed.ts`
  - Uses `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`.
  - Idempotently:
    - Ensures `clinic_settings` row.
    - Creates a demo admin staff and doctor if running in dev/staging.
  - MUST NOT be exposed in client bundle.

When adding such a script:
- Keep it simple.
- Guard with `NODE_ENV !== 'production'` or explicit flags for demo data.

---

## 6. Admin Operations & Safety Guidelines

These rules guide safe DB administration:

1) Always treat `database_schema.sql` as canonical:
   - Any schema changes:
     - Update `database_schema.sql`.
     - Mirror via `supabase/schema.sql` if using CLI.
     - Update relevant docs and API code.

2) When adding migrations in future:
   - Do NOT fork reality:
     - Use incremental migration files under `supabase/migrations/`.
     - Ensure they are consistent with `database_schema.sql` or replace that file with assembled migrations.
   - Update this guide with new steps.

3) RLS and security:
   - Never relax RLS in production without updating:
     - `AGENT.md`
     - This guide
     - API handler expectations.
   - Validate periodically:
     - Patients cannot read or modify other patients’ data.
     - Only users with `staff_profiles` can access staff endpoints.

4) Twilio & Notifications:
   - Twilio failures MUST NOT break bookings:
     - `notifications.ts` should swallow Twilio errors and log them.
   - Use `notifications` table for diagnostics, not as a primary source of truth.

5) Manual fixes:
   - If you must edit data directly (e.g., correcting a profile):
     - Use parameterized SQL via Supabase SQL Editor.
     - Ensure changes respect schema and RLS assumptions.
   - Document any manual interventions for auditability.

---

## 7. Quick Start: From Empty DB to Usable MVP Backend

Minimal steps for a new environment:

1) Apply schema:
   - Via Supabase SQL Editor or `supabase db push` using `supabase/schema.sql`.

2) Configure env vars in your app host:
   - Supabase URL/keys.
   - Service role key (server-only).
   - NRIC_HASH_SECRET.
   - (Later) Twilio + CRON_SECRET.

3) Seed core data:
   - Update `clinic_settings`.
   - Create admin staff user in Supabase Auth + `staff_profiles` row.
   - Create at least one active doctor.

4) Run app:
   - `npm install`
   - `npm run dev`
   - Visit:
     - `/` for landing.
     - `/book`, `/profile` (once implemented).
     - `/staff/appointments` (with seeded staff user).

With these steps, the backend model is stable and ready for Phase 2+ code to plug into without surprises.

---

## 8. Agent Notes

When modifying anything related to the DB:

- Read:
  - [AGENT.md](../AGENT.md:1)
  - [database_schema.sql](../database_schema.sql:1)
  - This guide.
- Confirm:
  - Changes align with single-clinic, PDPA-conscious, senior-first design.
- Keep:
  - Schema/migrations, API handlers, and docs in sync.

If uncertain, choose the safer, simpler, more explicit implementation path.
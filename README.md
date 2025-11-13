# Gabriel Family Clinic MVP

[![Status](https://img.shields.io/badge/status-MVP%20In%20Progress-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Supabase%20%7C%20Twilio-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)]()

One clinic. One simple system. One happy patient.

A neighborhood-first booking and queue platform for a single GP clinic in Singapore, built to be:

- Simple enough for a 68-year-old auntie to self-book.
- Pragmatic enough for one developer to maintain.
- Safe enough for PDPA and clinical use.

---

## Table of Contents

1. [Project Philosophy](#project-philosophy)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [File Hierarchy](#file-hierarchy)
4. [Architecture](#architecture)
   - [Application Logic Flow](#application-logic-flow)
   - [User ↔ Modules Interaction](#user--modules-interaction)
5. [Features (MVP Scope)](#features-mvp-scope)
6. [Tech Stack](#tech-stack)
7. [Local Development](#local-development)
8. [Docker Deployment](#docker-deployment)
9. [Testing Strategy](#testing-strategy)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)
12. [Roadmap](#roadmap)
13. [Contributing](#contributing)
14. [License](#license)

---

## Project Philosophy

This project is deliberately boring.

- One clinic:
  - No multi-clinic, no multi-tenant complexity.
- One identity:
  - Supabase Auth as the source of truth (`auth.uid()`).
- One patient profile:
  - Each logged-in user has exactly one `patient_profile`.
- One core feature:
  - Safe, simple appointment booking with visible, calm queue handling.
- Operational realism:
  - Built for a solo developer.
  - Zero DevOps: Vercel + Supabase + Twilio.
- Compliance-aware:
  - NRIC handled via hash + mask; never used raw as primary key.
  - RLS enforced at the database layer; least-privilege everywhere.
- Senior-first UX:
  - Large, clear UI with minimal steps and unambiguous language.

If a feature does not help:
- Seniors self-book,
- Staff reduce chaos,
- Doctors see their day clearly,
it is out of scope for this MVP.

---

## Quick Start (5 Minutes)

This gets you running locally with the working MVP backbone (patient flows + staff console + queue).

1. Clone the repo:

```bash
git clone https://github.com/your-org/gabriel-clinic-mvp.git
cd gabriel-clinic-mvp
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment template:

```bash
cp .env.example .env.local
```

4. Create a Supabase project:

- Go to https://supabase.com.
- Create a new project (preferably in Singapore region).
- Obtain:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

5. Apply database schema to Supabase:

- Option A (Supabase CLI):

```bash
supabase link --project-ref your-project-ref
supabase db push
```

(using `supabase/schema.sql` which mirrors [`database_schema.sql`](database_schema.sql:1))

- Option B (SQL Editor):
  - Run the contents of [`database_schema.sql`](database_schema.sql:1).

6. Update `.env.local` with your keys and clinic info:

- Supabase URL + anon key (public).
- Service role key (server-side only).
- Optional Twilio credentials for SMS.

7. Start dev server:

```bash
npm run dev
```

8. Visit:

- `http://localhost:3000` – Patient-facing landing & booking start.
- `http://localhost:3000/book` – Patient booking flow (requires auth + profile).
- `http://localhost:3000/profile` – Patient profile.
- `http://localhost:3000/staff/appointments` – Staff portal (after seeding `staff_profiles`).

At this point the core MVP backbone (patients + staff console + queue) is wired and buildable. Production hardening (notifications, tests, runbook) is tracked in [`docs/master_execution_todo_checklist.md`](docs/master_execution_todo_checklist.md:1).

---

## File Hierarchy

Flat and intentional.

```text
.
├─ README.md                          # You will replace with README_new.md content
├─ Project_Architecture_Document.md   # PAD: architecture source of truth
├─ Project_Requirements_Document.md   # PRD: product definition
├─ Master_Execution_Plan.md           # High-level phased implementation plan
├─ database_schema.sql                # Canonical DB schema + RLS
├─ supabase/
│  ├─ schema.sql                      # Supabase-ready schema mirror
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ .env.example
├─ src/
│  ├─ pages/
│  │  ├─ _app.tsx                     # App wrapper
│  │  ├─ index.tsx                    # Dynamic landing page (mirrors static mockup)
│  │  ├─ login.tsx                    # Patient auth entry
│  │  ├─ profile.tsx                  # Patient profile management
│  │  ├─ book.tsx                     # Booking flow (doctors + slots + submit)
│  │  ├─ staff/
│  │  │  ├─ appointments.tsx          # Today’s appointments & queue (staff console)
│  │  ├─ api/
│  │  │  ├─ patient/
│  │  │  │  ├─ profile.get.ts         # Get current patient profile
│  │  │  │  ├─ profile.put.ts         # Upsert patient profile (hash+mask NRIC)
│  │  │  ├─ doctors/
│  │  │  │  ├─ index.get.ts           # List active doctors
│  │  │  ├─ slots/
│  │  │  │  ├─ index.get.ts           # Compute available slots
│  │  │  ├─ appointments/
│  │  │  │  ├─ book.post.ts           # Book appointment
│  │  │  │  ├─ mine.get.ts            # Current user's appointments
│  │  │  ├─ staff/
│  │  │  │  ├─ appointments.get.ts    # Staff view: today’s appointments
│  │  │  │  ├─ appointment-status.post.ts # Update status/queue
│  │  │  ├─ (planned) cron/
│  │  │  │  ├─ reminders.post.ts      # 24h reminders (future)
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ PublicHeader.tsx          # Landing/header layout
│  │  ├─ ui/
│  │  │  ├─ button.tsx                # Primary button primitive
│  │  │  ├─ card.tsx                  # Card primitive
│  │  │  ├─ badge.tsx                 # Badge primitive
│  │  │  ├─ section.tsx               # Section wrapper
│  │  ├─ patient/
│  │  │  ├─ BookingForm.tsx
│  │  │  ├─ UpcomingAppointmentsList.tsx
│  │  ├─ (staff components may be inlined into staff/appointments.tsx)
│  ├─ lib/
│  │  ├─ supabaseClient.ts            # Browser Supabase (anon)
│  │  ├─ supabaseServer.ts            # Server Supabase (service role)
│  │  ├─ auth.ts                      # getUserFromRequest, requireAuth, requireStaff
│  │  ├─ validation.ts                # Zod schemas (profile, booking)
│  │  ├─ slots.ts                     # Slot calculation helpers
│  │  ├─ queue.ts                     # Queue number helpers
│  ├─ styles/
│  │  ├─ globals.css
│  │  ├─ tokens.css                   # Design tokens aligned with static mockup
├─ docs/
│  ├─ project_review_and_codebase_understanding.md
│  ├─ master_execution_todo_checklist.md
│  ├─ project_scaffold_config.md
│  ├─ phase1_safety-critical_backbone.md
│  ├─ phase2-superbase-login.md
│  ├─ phase3-staff-console.md
│  ├─ phase5-notifications.md
│  ├─ README_plan.md
│  ├─ staff_portal_and_queue_management_plan.md
└─ static/
   ├─ index.html
   ├─ styles/globals.css
   ├─ js/landing.js
```

The live code may be slightly ahead of this skeleton; always refer to `docs/master_execution_todo_checklist.md` for the authoritative status.

---

## Architecture

### Application Logic Flow

High-level sequence for booking + staff operations:

```mermaid
sequenceDiagram
    participant P as Patient
    participant UI as Next.js Frontend
    participant API as API Routes
    participant SA as Supabase Auth
    participant DB as Supabase DB
    participant ST as Staff Portal
    participant TW as Twilio (Future)

    %% Patient authentication
    P->>UI: Open /book or /
    UI->>P: Show login or booking CTA

    P->>SA: Start Supabase Auth (OTP/email magic link)
    SA-->>P: Link/OTP
    P->>SA: Verify
    SA-->>UI: Session (auth.uid())

    %% Profile
    UI->>API: GET /api/patient/profile
    API->>DB: SELECT patient_profiles WHERE user_id = auth.uid()
    DB-->>API: Profile or none
    API-->>UI: Data
    P->>API: PUT /api/patient/profile (name, NRIC, DOB, etc.)
    API->>DB: UPSERT patient_profiles (hash/mask NRIC)

    %% Booking
    UI->>API: GET /api/doctors/index.get
    API->>DB: SELECT active doctors
    DB-->>API: List
    API-->>UI: List

    P->>UI: Select doctor + date
    UI->>API: GET /api/slots/index.get?doctor_id&date
    API->>DB: Compute via clinic_settings + appointments
    DB-->>API: Slots
    API-->>UI: Slots

    P->>API: POST /api/appointments/book.post
    API->>DB: INSERT appointment (patient_id from patient_profiles linked to auth.uid())
    DB-->>API: Appointment created

    %% Staff console & queue
    ST->>UI: Open /staff/appointments
    UI->>API: GET /api/staff/appointments.get
    API->>DB: SELECT today's appointments (authorized via staff_profiles)
    DB-->>API: Data
    API-->>UI: Appointments list

    ST->>API: POST /api/staff/appointment-status.post (status update)
    API->>DB: UPDATE appointments (status; on "arrived", assign queue_number via queue helper)
    DB-->>API: OK
```

### User ↔ Modules Interaction

```mermaid
graph TB

  subgraph Users
    PATIENT[Patient]
    STAFF[Staff / Reception]
    DOCTOR[Doctor]
    ADMIN[Admin]
  end

  subgraph Frontend (Next.js)
    PUBLIC_UI[Public/Patient UI\n/ (landing), /book, /profile]
    STAFF_UI[Staff UI\n/staff/appointments]
    AUTH_UI[Auth UI\n/login]
  end

  subgraph Backend (API Routes)
    PATIENT_API[/api/patient/*]
    DOCTORS_API[/api/doctors/*]
    SLOTS_API[/api/slots/*]
    APPTS_API[/api/appointments/*]
    STAFF_API[/api/staff/*]
    CRON_API[/api/cron/reminders (future)]
  end

  subgraph Services (/src/lib)
    AUTH_SVCS[auth.ts\n(getUserFromRequest, requireAuth, requireStaff)]
    SLOTS_SVCS[slots.ts\n(getAvailableSlots)]
    QUEUE_SVCS[queue.ts\n(getNextQueueNumber)]
  end

  subgraph Infra
    SUPABASE[(Supabase\nAuth + Postgres + RLS)]
    TWILIO[(Twilio SMS/WhatsApp\nfuture)]
  end

  PATIENT --> PUBLIC_UI
  STAFF --> STAFF_UI
  DOCTOR --> STAFF_UI
  ADMIN --> STAFF_UI

  PUBLIC_UI --> PATIENT_API
  PUBLIC_UI --> DOCTORS_API
  PUBLIC_UI --> SLOTS_API
  PUBLIC_UI --> APPTS_API

  STAFF_UI --> STAFF_API
  STAFF_UI --> APPTS_API

  PATIENT_API --> AUTH_SVCS
  STAFF_API --> AUTH_SVCS
  APPTS_API --> AUTH_SVCS
  SLOTS_API --> SLOTS_SVCS
  STAFF_API --> QUEUE_SVCS

  AUTH_SVCS --> SUPABASE
  SLOTS_SVCS --> SUPABASE
  QUEUE_SVCS --> SUPABASE
  APPTS_API --> SUPABASE
  PATIENT_API --> SUPABASE
  STAFF_API --> SUPABASE

  CRON_API --> SUPABASE
  CRON_API --> TWILIO
```

---

## Features (MVP Scope)

### Included (implemented or scaffolded)

**Patient**

- Phone/email-based login using Supabase Auth.
- Single `patient_profile` per `auth.uid()`:
  - Stored in `patient_profiles`.
  - NRIC hashed + masked.
- Booking:
  - Select doctor (from `doctors`).
  - Select date and slot (via `slots.ts` + `/api/slots`).
  - Create appointment (`appointments` table).
- View upcoming appointments:
  - `/api/appointments/mine.get` returns only caller’s appointments.

**Staff / Doctor**

- Login via Supabase Auth.
- `staff_profiles` drives roles: `staff`, `doctor`, `admin`.
- Staff console at `/staff/appointments`:
  - Uses `/api/staff/appointments.get`.
  - Shows today’s appointments: time, patient name, doctor, status, queue number.
- Update appointment status via `/api/staff/appointment-status.post`:
  - `booked → arrived → in_consultation → completed / no_show`.
  - On first `arrived`, queue number auto-assigned per doctor/day via queue helper.
  - Idempotent semantics: re-marking as `arrived` does not create duplicate queue numbers.

**System**

- Supabase-backed Postgres with RLS:
  - Patients can only see their own data.
  - Staff (with proper role) can see operational data.
- PDPA-conscious:
  - No raw NRIC as identifier.
  - Strict use of `auth.uid()` + foreign keys.
- Staff portal and queue rely on shared lib helpers (no ad-hoc logic).

### Explicitly NOT in v1

- Multi-clinic support.
- Telemedicine.
- Full EMR.
- Automated CHAS submissions.
- Payment integration.
- Heavy analytics.
- AI/ML features.

All such items belong to later phases and must not complicate the MVP.

---

## Tech Stack

| Layer           | Choice                     | Rationale                               |
|----------------|----------------------------|-----------------------------------------|
| Frontend       | Next.js (Pages Router)     | Mature, simple, Vercel-native           |
| UI             | Mantine UI + CSS Modules   | Accessible, fast to ship, senior-first  |
| Styling        | Design tokens + simple CSS | Align with static mockup, predictable   |
| State          | Local state + hooks        | Keep logic simple                       |
| Backend        | Next.js API Routes         | No separate server                      |
| Database       | Supabase Postgres          | Managed, RLS, backups                   |
| Auth           | Supabase Auth              | Secure, OTP/magic-link friendly         |
| Notifications  | Twilio SMS/WhatsApp (opt)  | Seniors already familiar                |
| Hosting        | Vercel                     | Zero DevOps for app                     |
| Schema         | SQL (`database_schema.sql`)| Transparent, versionable                |

---

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Supabase setup:

- Create a Supabase project.
- Enable:
  - Auth (phone/email).
  - `pgcrypto` extension.
- Apply schema:
  - Via CLI: `supabase db push` using `supabase/schema.sql`
  - Or paste [`database_schema.sql`](database_schema.sql:1) into SQL editor.

3. Configure `.env.local`:

- See [Configuration](#configuration).

4. Run dev server:

```bash
npm run dev
```

5. Seed data (via Supabase SQL or UI):

- Insert at least:
  - One `staff_profiles` row with `role='staff'` or `'admin'`.
  - One `doctors` row.
- This enables `/staff/appointments` to show real data.

---

## Docker Deployment

If you need a container image (non-Vercel deploy):

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built app (Next.js standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t gabriel-clinic-mvp:latest .
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  gabriel-clinic-mvp:latest
```

Notes:

- Use Supabase as the managed database; do not run Postgres in this container for production.
- Never bake secrets into the image.

---

## Testing Strategy

Pragmatic, focused on safety-critical flows.

Planned (see `docs/jest_playwright_config.md`):

- Unit tests:
  - `src/lib/slots.ts` (slot generation).
  - `src/lib/queue.ts` (queue numbers).
- Integration tests:
  - `api/appointments/book.post`
  - `api/staff/appointments.get`
  - `api/staff/appointment-status.post`
- E2E tests:
  - Happy path:
    - Patient logs in, creates profile, books appointment.
    - Staff views today’s appointments and updates status.

Example commands (once configured):

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

Keep coverage focused on:
- Booking.
- Staff console.
- RLS and role separation behavior.

---

## Configuration

From `.env.example` (summary):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Twilio (optional; for future notifications)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_SMS_FROM=...

# App (public clinic info)
NEXT_PUBLIC_CLINIC_NAME="Gabriel Family Clinic"
NEXT_PUBLIC_CLINIC_ADDRESS="123 Tampines Street 11, #01-456"
NEXT_PUBLIC_CLINIC_PHONE="+65 6789 1234"
```

Guidelines:

- Supabase service role key: server-only.
- Never commit real credentials.
- For production (e.g., Vercel), set in project settings.

---

## Troubleshooting

Common checks:

- **Unauthorized on APIs**
  - Ensure Supabase Auth is wired correctly.
  - Ensure frontend is sending Supabase JWT in Authorization or cookies.
- **No doctors**
  - Check `doctors` table for `is_active = TRUE`.
- **Patient cannot see profile**
  - Confirm `patient_profiles.user_id = auth.uid()`.
  - Confirm RLS as per `database_schema.sql`.
- **Staff cannot see appointments**
  - Ensure a `staff_profiles` row exists for their `user_id` with role in (`staff`,`doctor`,`admin`).
  - Check staff RLS policies.
- **Queue issues**
  - Verify `queue_number` assigned only on `arrived`.
  - Confirm `getNextQueueNumber` logic uses per-doctor per-day scope.
- **Notifications (future)**
  - Booking must not fail if Twilio fails.
  - Handle Twilio errors as best-effort.

---

## Roadmap

Deliberately incremental and constrained.

- Phase 1 (Current MVP Backbone)
  - Patient auth + profile + booking.
  - Staff appointments view.
  - Queue numbers on arrival.

- Phase 1.5 (Planned)
  - MC PDF generation.
  - Simple consultation notes.
  - 24h reminders using `/api/cron/reminders` + Twilio.

- Phase 2+
  - Family booking.
  - CHAS subsidy UI.
  - Light analytics.
  - Eventually, multi-clinic support (`clinic_id`) if needed.

Always:

- Ship only what the clinic will use.
- Validate with real patients and staff.
- Add complexity last.

---

## Contributing

Solo-maintainer friendly; other contributors welcome if they follow the constraints.

- Keep PRs focused and small.
- Align with:
  - `Project_Architecture_Document.md`
  - `docs/project_review_and_codebase_understanding.md`
  - `docs/master_execution_todo_checklist.md`
- Prefer clarity over cleverness.
- Never weaken RLS or PDPA posture.

Suggested workflow:

```bash
git checkout -b feature/short-description
npm run lint
npm run build
git commit -am "feat: concise description"
git push origin feature/short-description
```

---

## License

MIT. See `LICENSE` (to be added).

Use responsibly for real clinics:
- Validate end-to-end flows.
- Run security and privacy reviews.
- Comply with all applicable local regulations before production use.
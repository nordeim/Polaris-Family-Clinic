Phase S1 (Auth & Role Helpers) has been executed for the staff portal and queue management implementation, with a targeted update to the shared auth utilities.

File: [src/lib/auth.ts](src/lib/auth.ts:1)

Planned responsibilities for this file (checklist):

1. `getUserFromRequest(req)`
   - Extract Supabase JWT from:
     - `Authorization: Bearer <token>`
     - `sb-access-token` cookie
   - Use `supabaseServer.auth.getUser(token)` to resolve user.
2. `requireAuth(req)`
   - Throw `Error('UNAUTHORIZED')` if no valid user.
   - Used by all patient- and staff-facing authenticated APIs.
3. `requireStaff(req)` (new)
   - Use `requireAuth` to get the user.
   - Load `staff_profiles` by `user_id`.
   - Verify `role IN ('staff','doctor','admin')`.
   - Return `{ user, staffProfile }` on success.
   - Throw `Error('FORBIDDEN')` if not staff/doctor/admin.
   - Serve as the canonical gate for all `/api/staff/*` routes.

Changes implemented

1) Existing behavior preserved

- `getUserFromRequest(req)`:
  - Already implemented and left unchanged:
    - Reads Bearer token / cookie.
    - Uses `supabaseServer.auth.getUser`.
    - Returns user or null.

- `requireAuth(req)`:
  - Left semantically identical:
    - Calls `getUserFromRequest`.
    - Throws `Error('UNAUTHORIZED')` when missing.
    - Returns Supabase user otherwise.

This ensures no regression for existing patient/booking APIs that rely on `requireAuth`.

2) New `requireStaff` helper added

Implementation summary:

- Signature:
  - `export async function requireStaff(req: NextApiRequest)`

- Logic:
  1. Calls `requireAuth(req)`:
     - If this throws, caller should map to 401.
  2. Queries `staff_profiles`:
     - `select('id, user_id, display_name, role').eq('user_id', user.id).single()`
  3. Validates:
     - If query fails or no row → `throw new Error('FORBIDDEN')`.
     - If `role` not in `['staff', 'doctor', 'admin']` → `throw new Error('FORBIDDEN')`.
  4. Returns:
     - `{ user, staffProfile }` for use in staff APIs.

- Behavior contract:
  - Staff-only API routes:
    - Wrap `requireStaff` in try/catch:
      - On `UNAUTHORIZED` → 401.
      - On `FORBIDDEN` → 403.
  - This centralizes staff-role enforcement and eliminates ad hoc role checks.

Checklist validation

For [src/lib/auth.ts](src/lib/auth.ts:1):

- [x] `getUserFromRequest` reads Bearer/cookie and uses `supabaseServer.auth.getUser`.
- [x] `requireAuth` throws `UNAUTHORIZED` when no user.
- [x] `requireStaff` implemented using `requireAuth`.
- [x] `requireStaff` checks `staff_profiles` and role in `['staff','doctor','admin']`.
- [x] New logic is additive:
  - No breaking changes to existing patient/booking flows.
- [x] Behavior documented in comments for future API implementers.

Next execution phase (planned, not done in this step)

With Phase S1 completed, the next steps are:

1. Update `/api/staff/appointments.get` and `/api/staff/appointment-status.post` to:
   - Use `requireStaff(req)`.
   - Map `UNAUTHORIZED` → 401, `FORBIDDEN` → 403.
   - Ensure response shapes match the staff UI needs defined in `docs/staff_portal_and_queue_management_plan.md`.

2. Implement staff-facing UI:
   - `src/pages/staff/appointments.tsx`
   - `src/components/staff/TodayAppointmentsTable.tsx`
   - `src/components/staff/QueueControls.tsx`

3. Harden queue behavior as per Phase S4:
   - Idempotent arrival.
   - Stable queue number assignment.

This concludes the first precise phase for Staff Portal & Queue Management: introducing a robust, centralized `requireStaff` helper, ready to be used by all subsequent staff/queue APIs without regressions.

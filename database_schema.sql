-- Gabriel Family Clinic MVP - Database Schema
-- Apply this in Supabase (recommended) or compatible Postgres with adjustments.
-- Idempotent where safe.

-- =========
-- Extensions & Utils
-- =========

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id         SERIAL PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========
-- patient_profiles
-- =========

CREATE TABLE IF NOT EXISTS patient_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE NOT NULL,
  full_name      TEXT NOT NULL,
  nric_hash      TEXT NOT NULL,
  nric_masked    TEXT NOT NULL,
  dob            DATE NOT NULL,
  language       TEXT NOT NULL DEFAULT 'en',
  chas_tier      TEXT NOT NULL DEFAULT 'unknown',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_profiles_user_id
  ON patient_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_nric_hash
  ON patient_profiles (nric_hash);

CREATE TRIGGER trg_patient_profiles_set_updated_at
BEFORE UPDATE ON patient_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========
-- staff_profiles
-- =========

CREATE TABLE IF NOT EXISTS staff_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE NOT NULL,
  display_name   TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('staff', 'doctor', 'admin')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_profiles_user_id
  ON staff_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_role
  ON staff_profiles (role);

CREATE TRIGGER trg_staff_profiles_set_updated_at
BEFORE UPDATE ON staff_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========
-- doctors
-- =========

CREATE TABLE IF NOT EXISTS doctors (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id   UUID,
  name               TEXT NOT NULL,
  photo_url          TEXT,
  languages          TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_active
  ON doctors (is_active);

CREATE TRIGGER trg_doctors_set_updated_at
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========
-- clinic_settings
-- =========

CREATE TABLE IF NOT EXISTS clinic_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name          TEXT NOT NULL DEFAULT 'Gabriel Family Clinic',
  clinic_address       TEXT,
  clinic_phone         TEXT,
  timezone             TEXT NOT NULL DEFAULT 'Asia/Singapore',
  slot_duration_min    INTEGER NOT NULL DEFAULT 15,
  booking_window_days  INTEGER NOT NULL DEFAULT 7,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_clinic_settings_set_updated_at
BEFORE UPDATE ON clinic_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Ensure at least one settings row
INSERT INTO clinic_settings (id, clinic_name)
SELECT gen_random_uuid(), 'Gabriel Family Clinic'
WHERE NOT EXISTS (SELECT 1 FROM clinic_settings);

-- =========
-- appointments
-- =========

CREATE TABLE IF NOT EXISTS appointments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doctor_id          UUID NOT NULL REFERENCES doctors(id),
  scheduled_start    TIMESTAMPTZ NOT NULL,
  status             TEXT NOT NULL CHECK (
                       status IN ('booked','arrived','in_consultation','completed','no_show','cancelled')
                     ) DEFAULT 'booked',
  queue_number       TEXT,
  reason             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id
  ON appointments (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_time
  ON appointments (doctor_id, scheduled_start);

CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON appointments (status);

CREATE TRIGGER trg_appointments_set_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========
-- notifications
-- =========

CREATE TABLE IF NOT EXISTS notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id   UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id       UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  channel          TEXT NOT NULL CHECK (channel IN ('sms','whatsapp')),
  type             TEXT NOT NULL CHECK (type IN ('confirmation','reminder','queue_alert')),
  message          TEXT,
  status           TEXT NOT NULL CHECK (status IN ('pending','sent','failed')) DEFAULT 'pending',
  error_message    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_patient
  ON notifications (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_appointment
  ON notifications (appointment_id);

-- =========
-- RLS (Supabase)
-- =========

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- patient_profiles
CREATE POLICY patient_profiles_select_self
ON patient_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY patient_profiles_update_self
ON patient_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY patient_profiles_select_staff
ON patient_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid()
  )
);

-- staff_profiles
CREATE POLICY staff_profiles_select_self
ON staff_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY staff_profiles_select_admin
ON staff_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid()
      AND sp.role = 'admin'
  )
);

-- doctors
CREATE POLICY doctors_select_public
ON doctors
FOR SELECT
USING (is_active = TRUE);

-- clinic_settings
CREATE POLICY clinic_settings_select_public
ON clinic_settings
FOR SELECT
USING (TRUE);

-- appointments
CREATE POLICY appointments_select_patient
ON appointments
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patient_profiles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY appointments_select_staff
ON appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid()
      AND sp.role IN ('staff','doctor','admin')
  )
);

CREATE POLICY appointments_insert_patient
ON appointments
FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT id FROM patient_profiles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY appointments_update_staff
ON appointments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid()
      AND sp.role IN ('staff','doctor','admin')
  )
);

-- notifications
CREATE POLICY notifications_select_patient
ON notifications
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM patient_profiles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY notifications_select_staff
ON notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid()
  )
);

INSERT INTO schema_migrations (name)
SELECT 'database_schema_v1'
WHERE NOT EXISTS (
  SELECT 1 FROM schema_migrations WHERE name = 'database_schema_v1'
);

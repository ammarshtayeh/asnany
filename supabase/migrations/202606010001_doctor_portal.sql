ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS availability_note TEXT;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS patient_full_name TEXT,
  ADD COLUMN IF NOT EXISTS patient_identity TEXT,
  ADD COLUMN IF NOT EXISTS patient_address TEXT;

UPDATE appointments
SET patient_full_name = COALESCE(patient_full_name, patient_name)
WHERE patient_full_name IS NULL;

CREATE TABLE IF NOT EXISTS doctor_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin all doctor accounts" ON doctor_accounts;
CREATE POLICY "admin all doctor accounts"
ON doctor_accounts
USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS doctor_accounts_doctor_id_idx ON doctor_accounts (doctor_id);
CREATE INDEX IF NOT EXISTS doctor_accounts_email_idx ON doctor_accounts (email);
CREATE INDEX IF NOT EXISTS appointments_doctor_status_idx ON appointments (doctor_id, status, date);

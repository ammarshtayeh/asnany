CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expo_push_token TEXT NOT NULL UNIQUE,
  device_id TEXT,
  platform TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('patient', 'doctor', 'admin')),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_phone TEXT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS push_subscriptions_doctor_idx ON push_subscriptions (doctor_id, role, is_active);
CREATE INDEX IF NOT EXISTS push_subscriptions_patient_phone_idx ON push_subscriptions (patient_phone, role, is_active);
CREATE INDEX IF NOT EXISTS notifications_doctor_idx ON notifications (doctor_id, recipient_role, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_patient_phone_idx ON notifications (patient_phone, recipient_role, created_at DESC);

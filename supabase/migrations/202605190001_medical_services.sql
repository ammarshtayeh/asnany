CREATE TABLE IF NOT EXISTS medical_services (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type    TEXT NOT NULL CHECK (service_type IN ('beauty', 'lab', 'consultation', 'partner', 'media', 'booking')),
  name            TEXT NOT NULL,
  category        TEXT,
  city            TEXT,
  area            TEXT,
  description     TEXT,
  services        TEXT[],
  price_range     TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  website         TEXT,
  image_url       TEXT,
  gallery         TEXT[],
  address         TEXT,
  lat             FLOAT8,
  lng             FLOAT8,
  rating          FLOAT4 DEFAULT 0,
  is_featured     BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT4 DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medical_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active medical services" ON medical_services;
CREATE POLICY "public read active medical services"
ON medical_services FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "admin all medical services" ON medical_services;
CREATE POLICY "admin all medical services"
ON medical_services
USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS medical_services_type_active_idx ON medical_services (service_type, is_active);
CREATE INDEX IF NOT EXISTS medical_services_sort_idx ON medical_services (service_type, is_featured DESC, sort_order ASC, created_at DESC);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE doctors (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  specialty       TEXT[] NOT NULL,           -- ['تقويم', 'زراعة', 'أطفال']
  category        TEXT NOT NULL DEFAULT 'أسنان' CHECK (category IN ('أسنان', 'عيون', 'أنف وأذن وحنجرة', 'جلدية', 'تجميل')),
  city            TEXT NOT NULL,             -- 'رام الله'
  area            TEXT,                      -- 'البيرة'
  address         TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  lat             FLOAT8,                    -- إحداثيات العيادة
  lng             FLOAT8,
  working_hours   JSONB,                     -- {"sat":"9-17","sun":"9-17",...}
  accepts_insurance BOOLEAN DEFAULT false,
  insurance_list  TEXT[],
  image_url       TEXT,
  clinic_photos   TEXT[],                    -- حتى 5 صور
  bio             TEXT,                      -- نبذة عن الطبيب
  rating          FLOAT4 DEFAULT 0,
  is_featured     BOOLEAN DEFAULT false,
  featured_until  TIMESTAMPTZ,
  verified        BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id      UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name   TEXT NOT NULL,
  patient_full_name TEXT,
  patient_email  TEXT,
  patient_phone  TEXT NOT NULL,
  patient_identity TEXT,
  patient_address TEXT,
  date           DATE NOT NULL,
  time           TIME,
  status         TEXT DEFAULT 'pending',   -- pending/confirmed/cancelled/completed
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE advertisements (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_name  TEXT NOT NULL,
  advertiser_type  TEXT NOT NULL,   -- 'doctor' | 'store'
  ad_type          TEXT NOT NULL,   -- 'featured' | 'banner' | 'sidebar'
  image_url        TEXT,
  link_url         TEXT,
  whatsapp         TEXT,
  target_region    TEXT,            -- المنطقة المستهدفة (اختياري)
  target_specialty TEXT,            -- التخصص المستهدف (اختياري)
  start_date       DATE,
  end_date         DATE,
  is_active        BOOLEAN DEFAULT true,
  clicks           INT4 DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stores (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name      TEXT NOT NULL,
  description     TEXT,
  city            TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  website         TEXT,
  logo_url        TEXT,
  specialization  TEXT,   -- 'أجهزة' | 'مواد' | 'تجهيزات' | 'كل شيء'
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id   UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_approved BOOLEAN DEFAULT false,   -- الأدمن يوافق قبل النشر
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read verified doctors" ON doctors FOR SELECT USING (verified = true);
CREATE POLICY "admin all doctors" ON doctors USING (auth.role() = 'authenticated');

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role appointments" ON appointments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read ads" ON advertisements FOR SELECT USING (true);
CREATE POLICY "admin all ads" ON advertisements USING (auth.role() = 'authenticated');

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stores" ON stores FOR SELECT USING (true);
CREATE POLICY "admin all stores" ON stores USING (auth.role() = 'authenticated');

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "public read approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "admin all reviews" ON reviews USING (auth.role() = 'authenticated');

-- Offers Table
CREATE TABLE offers (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT,
  doctor_id           UUID REFERENCES doctors(id) ON DELETE CASCADE,
  doctor_name         TEXT NOT NULL,
  discount_percentage INT NOT NULL,
  original_price      INT,
  discounted_price    INT,
  image_url           TEXT,
  valid_until         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read offers" ON offers FOR SELECT USING (true);
CREATE POLICY "admin all offers" ON offers USING (auth.role() = 'authenticated');

-- Articles (Blog) Table
CREATE TABLE articles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL,
  image_url     TEXT,
  doctor_id     UUID REFERENCES doctors(id) ON DELETE CASCADE,
  doctor_name   TEXT NOT NULL,
  category      TEXT,
  date          TEXT,
  read_time     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "admin all articles" ON articles USING (auth.role() = 'authenticated');

-- Marketplace Ads Table
CREATE TABLE IF NOT EXISTS marketplace_ads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'equipment',
  category      TEXT,
  price         TEXT,
  salary        TEXT,
  publisher     TEXT NOT NULL,
  city          TEXT,
  date          TEXT,
  is_featured   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  image_url     TEXT,
  description   TEXT,
  phone         TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active marketplace ads" ON marketplace_ads FOR SELECT USING (is_active = true);
CREATE POLICY "public insert marketplace ads" ON marketplace_ads FOR INSERT WITH CHECK (true);
CREATE POLICY "admin all marketplace ads" ON marketplace_ads USING (auth.role() = 'authenticated');

-- Unified service listings for beauty centers, medical labs, consultations, partners, media sponsors, and future hubs
CREATE TABLE IF NOT EXISTS medical_services (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type    TEXT NOT NULL, -- beauty | lab | consultation | partner | media | booking
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
CREATE POLICY "public read active medical services" ON medical_services FOR SELECT USING (is_active = true);
CREATE POLICY "admin all medical services" ON medical_services USING (auth.role() = 'authenticated');

-- Discount Card Plans
CREATE TABLE IF NOT EXISTS discount_card_plans (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  subtitle        TEXT,
  price           NUMERIC NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT '₪',
  duration_months INT NOT NULL DEFAULT 12,
  badge           TEXT,
  benefits        TEXT[] NOT NULL DEFAULT '{}',
  limits          TEXT[] NOT NULL DEFAULT '{}',
  sort_order      INT NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE discount_card_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active discount card plans" ON discount_card_plans FOR SELECT USING (is_active = true);
CREATE POLICY "admin all discount card plans" ON discount_card_plans USING (true) WITH CHECK (true);

-- Discount Card Members
CREATE TABLE IF NOT EXISTS discount_card_members (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  city        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',
  notes       TEXT,
  expires_at  DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS discount_card_members_phone_idx ON discount_card_members (phone);
CREATE INDEX IF NOT EXISTS discount_card_members_status_idx ON discount_card_members (status);

ALTER TABLE discount_card_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public request discount card" ON discount_card_members FOR INSERT WITH CHECK (true);
CREATE POLICY "admin all discount card members" ON discount_card_members USING (true) WITH CHECK (true);

-- Admins Table
CREATE TABLE admins (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role admins" ON admins
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Insert default admin account (email: admin@asnany.ps — password set via migration / first login hash)
INSERT INTO admins (email, password)
VALUES ('admin@asnany.ps', 'amm marking123')
ON CONFLICT (email) DO NOTHING;

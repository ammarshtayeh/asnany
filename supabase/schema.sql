CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE doctors (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  specialty       TEXT[] NOT NULL,           -- ['تقويم', 'زراعة', 'أطفال']
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
  patient_phone  TEXT NOT NULL,
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
CREATE POLICY "public read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "admin all doctors" ON doctors USING (auth.role() = 'authenticated');

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "admin all appointments" ON appointments USING (auth.role() = 'authenticated');

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


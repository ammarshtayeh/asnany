CREATE TABLE IF NOT EXISTS marketplace_ads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'equipment' CHECK (type IN ('equipment', 'job')),
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

DROP POLICY IF EXISTS "public read active marketplace ads" ON marketplace_ads;
CREATE POLICY "public read active marketplace ads"
ON marketplace_ads FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "public insert marketplace ads" ON marketplace_ads;
CREATE POLICY "public insert marketplace ads"
ON marketplace_ads FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "admin all marketplace ads" ON marketplace_ads;
CREATE POLICY "admin all marketplace ads"
ON marketplace_ads
USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS marketplace_ads_active_idx ON marketplace_ads (is_active, is_featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_ads_type_idx ON marketplace_ads (type, is_active);

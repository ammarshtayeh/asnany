-- Site-wide prelaunch / coming-soon gate (controlled from admin)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  prelaunch_enabled BOOLEAN NOT NULL DEFAULT true,
  prelaunch_title TEXT NOT NULL DEFAULT 'قريباً',
  prelaunch_message TEXT NOT NULL DEFAULT 'ترقّبوا إطلاق ملامح في فلسطين',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read site_settings" ON site_settings;
CREATE POLICY "public read site_settings" ON site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role site_settings" ON site_settings;
CREATE POLICY "service role site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

INSERT INTO site_settings (id, prelaunch_enabled, prelaunch_title, prelaunch_message)
VALUES (
  'main',
  true,
  'قريباً',
  'ترقّبوا إطلاق ملامح في فلسطين'
)
ON CONFLICT (id) DO NOTHING;

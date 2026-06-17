-- Package tier on doctors + ad ordering
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS active_package_slug TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ;

ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS display_priority INT NOT NULL DEFAULT 0;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS package_tier TEXT;

CREATE INDEX IF NOT EXISTS advertisements_priority_idx ON advertisements (display_priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS doctors_package_idx ON doctors (active_package_slug, package_expires_at);

-- Priority mapping for package tiers
UPDATE advertisements SET display_priority = 100, package_tier = 'featured-ads'
WHERE ad_type IN ('featured', 'banner') AND display_priority = 0;

-- Pre-launch security: admin password + restrict admins table access

-- Remove public read on admins (login uses service role server-side)
DROP POLICY IF EXISTS "public read admins" ON admins;
DROP POLICY IF EXISTS "admin all admins" ON admins;

-- Only service role can access admins table
CREATE POLICY "service role admins" ON admins
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Set admin password (hashed on first login via web API)
UPDATE admins
SET password = 'amm marking123'
WHERE email = 'admin@asnany.ps';

-- Ensure new doctors are never public until admin verifies
COMMENT ON COLUMN doctors.verified IS 'Must be true for public listing; set by admin approval only';

DROP POLICY IF EXISTS "public read doctors" ON doctors;
CREATE POLICY "public read verified doctors" ON doctors
  FOR SELECT
  USING (verified = true);

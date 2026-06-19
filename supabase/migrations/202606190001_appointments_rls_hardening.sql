-- Appointments must be created via server API (service role), not public anon insert
DROP POLICY IF EXISTS "public insert appointments" ON appointments;

CREATE POLICY "service role appointments" ON appointments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

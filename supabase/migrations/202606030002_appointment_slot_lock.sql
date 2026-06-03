ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS appointment_key TEXT;

UPDATE appointments
SET appointment_key = COALESCE(
  appointment_key,
  CASE
    WHEN NULLIF(time::text, '') IS NOT NULL THEN CONCAT(doctor_id::text, ':', date::text, ':', NULLIF(time::text, ''))
    ELSE CONCAT(doctor_id::text, ':', date::text)
  END
)
WHERE appointment_key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS appointments_doctor_date_time_key_idx
ON appointments (appointment_key);

CREATE INDEX IF NOT EXISTS appointments_doctor_date_idx
ON appointments (doctor_id, date, status);

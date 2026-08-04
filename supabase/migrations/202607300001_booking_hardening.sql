-- Booking hardening: reference codes + unlock cancelled/completed slots

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS booking_ref TEXT;

UPDATE appointments
SET booking_ref = CONCAT(
  'MLH-',
  UPPER(SUBSTR(REPLACE(id::text, '-', ''), 1, 6))
)
WHERE booking_ref IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS appointments_booking_ref_uidx
  ON appointments (booking_ref);

DROP INDEX IF EXISTS appointments_doctor_date_time_key_idx;

-- Only active bookings hold the slot; cancelled/completed free it for rebooking
CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot_key_idx
  ON appointments (appointment_key)
  WHERE status IN ('pending', 'confirmed')
    AND appointment_key IS NOT NULL;

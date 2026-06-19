-- Web Push subscriptions for browser patients (alongside Expo mobile tokens)

ALTER TABLE push_subscriptions
  ALTER COLUMN expo_push_token DROP NOT NULL;

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS web_endpoint TEXT,
  ADD COLUMN IF NOT EXISTS web_p256dh TEXT,
  ADD COLUMN IF NOT EXISTS web_auth TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_web_endpoint_uidx
  ON push_subscriptions (web_endpoint)
  WHERE web_endpoint IS NOT NULL;

ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_has_channel;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_has_channel CHECK (
    expo_push_token IS NOT NULL OR web_endpoint IS NOT NULL
  );

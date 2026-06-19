import webpush from "web-push";

let configured = false;

export function isWebPushConfigured() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  return Boolean(publicKey && privateKey);
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || "";
}

function ensureWebPushConfigured() {
  if (configured) return isWebPushConfigured();
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:ammar.shtayeh@gmail.com";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendWebPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string; data?: Record<string, unknown> }
) {
  if (!ensureWebPushConfigured()) return false;

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/appointments",
        data: payload.data || {},
      })
    );
    return true;
  } catch (error: any) {
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      return false;
    }
    console.error("Web push send error:", error);
    return false;
  }
}

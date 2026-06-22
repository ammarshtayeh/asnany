/**
 * Official Malamih contact & brand constants — single source of truth.
 * Update here only; web and mobile import from @pal-dental/shared.
 */

export const SITE_NAME = "ملامح";
export const SITE_DOMAIN = "malamih.ps";
export const SITE_URL = "https://www.malamih.ps";

/** Support inbox shown in footer / contact flows */
export const SITE_SUPPORT_EMAIL = "ammar.shtayeh@gmail.com";

/** WhatsApp support (digits only, no +) — used for wa.me links */
export const SITE_SUPPORT_WHATSAPP = "9720595537190";

/** Human-readable phone for UI (Palestine local format) */
export const SITE_SUPPORT_PHONE_DISPLAY = "0595537190";

/** Generic placeholders in forms — not real contact numbers */
export const FORM_PHONE_PLACEHOLDER = "05XXXXXXXX";
export const DOCTOR_LOGIN_EMAIL_PLACEHOLDER = "doctor@example.com";
export const ADMIN_LOGIN_EMAIL_PLACEHOLDER = "admin@example.com";

export function whatsappHref(message?: string) {
  const base = `https://wa.me/${SITE_SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoHref(subject?: string) {
  const base = `mailto:${SITE_SUPPORT_EMAIL}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

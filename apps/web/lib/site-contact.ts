/** Official support contact — used across marketing pages and footer */
export const SITE_SUPPORT_EMAIL = "ammar.shtayeh@gmail.com";
export const SITE_SUPPORT_WHATSAPP = "9720595537190";

export function whatsappHref(message?: string) {
  const base = `https://wa.me/${SITE_SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

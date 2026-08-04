/** Track outbound WhatsApp clicks as leads (fire-and-forget). */

export function trackWhatsAppLead(input: {
  doctorId?: string;
  doctorName?: string;
  source?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      type: "whatsapp_click",
      doctor_id: input.doctorId || null,
      doctor_name: input.doctorName || null,
      source: input.source || "web",
      path: window.location.pathname,
      at: new Date().toISOString(),
    };
    void fetch("/api/leads/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => null);

    // Optional GA if present
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "whatsapp_click", {
        doctor_id: input.doctorId,
        source: input.source || "web",
      });
    }
  } catch {
    // ignore
  }
}

export function openWhatsApp(href: string, meta?: { doctorId?: string; doctorName?: string; source?: string }) {
  trackWhatsAppLead(meta || {});
  window.open(href, "_blank", "noopener,noreferrer");
}

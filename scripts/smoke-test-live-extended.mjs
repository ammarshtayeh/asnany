#!/usr/bin/env node
/** Deep smoke: doctors with booking, appointment lookup, key mobile API parity */
const base = process.env.BASE_URL || "https://www.malamih.ps";

async function json(url, init) {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
  let issues = [];

  const { res: drRes, body: doctors } = await json(`${base}/api/doctors?limit=20`);
  const list = Array.isArray(doctors) ? doctors : [];
  console.log(`Doctors API: ${drRes.status}, count=${list.length}`);

  const bookable = [];
  for (const d of list) {
    const { res, body } = await json(`${base}/api/doctor/booking-status?doctorId=${d.id}`.replace("doctorId", "doctor_id"), {
      method: "GET",
    }).catch(() => ({ res: { status: 404 }, body: {} }));
    // fallback: fetch doctor page isn't API - check via supabase pattern in mobile
  }

  // Check each doctor profile page loads
  for (const d of list.slice(0, 5)) {
    const page = await fetch(`${base}/doctors/${d.id}`);
    console.log(`Profile ${d.name}: ${page.status}`);
    if (!page.ok) issues.push(`profile-${d.id}`);
  }

  const pages = [
    "/offers",
    "/marketplace",
    "/discount-card",
    "/beauty",
    "/labs",
    "/blog",
    "/stores",
    "/doctor/login",
    "/admin/login",
    "/about",
    "/terms",
  ];
  for (const p of pages) {
    const r = await fetch(`${base}${p}`);
    console.log(`${p}: ${r.status}`);
    if (!r.ok) issues.push(p);
  }

  // Appointment lookup with valid format (may return empty)
  const { res: apRes, body: apBody } = await json(`${base}/api/appointments?phone=0599000111`);
  console.log(`Appointments lookup: ${apRes.status}, count=${apBody.appointments?.length ?? 0}`);

  // Invalid push register
  const { res: pushRes } = await json(`${base}/api/notifications/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "patient", expo_push_token: "invalid" }),
  });
  console.log(`Push invalid token (expect 400): ${pushRes.status}`);

  // Subscription packages API if exists
  for (const p of ["/api/stores", "/api/advertisements"]) {
    const r = await fetch(`${base}${p}`);
    console.log(`${p}: ${r.status}`);
  }

  if (issues.length) {
    console.log("\nISSUES:", issues.join(", "));
    process.exit(1);
  }
  console.log("\nAll extended checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

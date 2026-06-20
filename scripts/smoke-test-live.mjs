#!/usr/bin/env node
const base = process.env.BASE_URL || "https://www.malamih.ps";

const tests = [
  { name: "stats", url: `${base}/api/stats/public`, expect: [200] },
  { name: "doctors", url: `${base}/api/doctors?limit=3`, expect: [200] },
  { name: "ticker", url: `${base}/api/ticker`, expect: [200] },
  { name: "appointments-short-phone", url: `${base}/api/appointments?phone=123`, expect: [400] },
  { name: "sitemap", url: `${base}/sitemap.xml`, expect: [200] },
  { name: "privacy", url: `${base}/privacy`, expect: [200] },
  { name: "offers", url: `${base}/offers`, expect: [200] },
  { name: "ads-redirect", url: `${base}/ads`, expect: [200, 307, 308] },
  { name: "subscriptions", url: `${base}/subscriptions`, expect: [200] },
  { name: "appointments-page", url: `${base}/appointments`, expect: [200] },
  { name: "doctors-search", url: `${base}/doctors/search`, expect: [200] },
  { name: "manifest", url: `${base}/manifest.json`, expect: [200] },
  { name: "sw", url: `${base}/sw.js`, expect: [200] },
];

async function main() {
  let failed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { redirect: "follow" });
      const ok = t.expect.includes(res.status);
      console.log(`${ok ? "OK" : "FAIL"} ${t.name} ${res.status} ${t.url}`);
      if (!ok) failed++;
    } catch (e) {
      console.log(`ERR ${t.name} ${e instanceof Error ? e.message : e}`);
      failed++;
    }
  }

  const doctorsRes = await fetch(`${base}/api/doctors?limit=5`);
  const doctors = await doctorsRes.json();
  const list = Array.isArray(doctors) ? doctors : doctors?.doctors || [];
  console.log(`\nDoctors count sample: ${list.length}`);
  if (list[0]) {
    const id = list[0].id;
    const profile = await fetch(`${base}/doctors/${id}`, { redirect: "follow" });
    console.log(`Doctor profile ${id}: ${profile.status}`);
  }

  process.exit(failed ? 1 : 0);
}

main();

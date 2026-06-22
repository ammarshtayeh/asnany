#!/usr/bin/env node
/**
 * Generate Instagram doctor-founder poster as SVG + PNG (no HTML).
 * Usage: npm run generate:instagram-poster
 */
import { writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "apps/web/public/brand/logo-full.png");
const svgPath = path.join(root, "docs/design/instagram-doctor-founder-poster.svg");
const pngPath = path.join(root, "docs/design/instagram-doctor-founder-poster.png");

function buildSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="1080" height="1080" viewBox="0 0 1080 1080" direction="rtl">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="42%" stop-color="#0c5e47"/>
      <stop offset="100%" stop-color="#0a1628"/>
    </linearGradient>
    <radialGradient id="glowTop" cx="50%" cy="0%" r="55%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowGold" cx="100%" cy="100%" r="50%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="goldBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <filter id="logoShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="1080" fill="url(#glowTop)"/>
  <rect width="1080" height="1080" fill="url(#glowGold)"/>

  <!-- Corner accents -->
  <path d="M1052 28 L1052 108 L972 28 Z" fill="none" stroke="#d4af37" stroke-opacity="0.35" stroke-width="3"/>
  <path d="M28 972 L28 1052 L108 1052 Z" fill="none" stroke="#d4af37" stroke-opacity="0.35" stroke-width="3"/>
  <rect x="952" y="28" width="100" height="100" rx="16" fill="none" stroke="#d4af37" stroke-opacity="0.2" stroke-width="2"/>
  <rect x="28" y="952" width="100" height="100" rx="16" fill="none" stroke="#d4af37" stroke-opacity="0.2" stroke-width="2"/>

  <!-- Logo glow -->
  <circle cx="540" cy="118" r="105" fill="#d4af37" fill-opacity="0.18"/>

  <!-- Logo white ring (image composited separately) -->
  <circle cx="540" cy="118" r="88" fill="#ffffff" filter="url(#logoShadow)"/>
  <circle cx="540" cy="118" r="88" fill="none" stroke="#d4af37" stroke-opacity="0.6" stroke-width="4"/>

  <!-- Brand -->
  <text x="540" y="248" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff">ملامح<tspan fill="#d4af37">.ps</tspan></text>
  <text x="540" y="282" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="17" font-weight="600" fill="#cbd5e1">دليلك لصحة وجمال الوجه في فلسطين</text>

  <!-- Founder badge -->
  <rect x="290" y="304" width="500" height="46" rx="23" fill="url(#goldBtn)" filter="url(#shadow)"/>
  <text x="540" y="334" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="18" font-weight="700" fill="#0a1628">★  عرض الأطباء الأوائل — لفترة محدودة</text>

  <!-- Headline -->
  <text x="540" y="410" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">كن من</text>
  <text x="540" y="475" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="54" font-weight="700" fill="#6ee7b7">أوائل الأطباء</text>
  <text x="540" y="540" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">المنضمين معنا</text>

  <!-- Subhead -->
  <text x="540" y="590" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="21" font-weight="600" fill="#e2e8f0">سجّل عيادتك الآن على أول منصة فلسطينية متكاملة</text>
  <text x="540" y="622" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="19" font-weight="600" fill="#94a3b8">أسنان · عيون · جلدية · تجميل  —  موقع + تطبيق</text>

  <!-- Benefit cards -->
  <g font-family="Segoe UI, Tahoma, Arial, sans-serif">
    <!-- Row 1 -->
    <rect x="56" y="658" width="468" height="108" rx="18" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="500" y="692" text-anchor="end" font-size="18" font-weight="700" fill="#fde68a">🥇  أولوية الظهور</text>
    <text x="500" y="722" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">تصدر نتائج البحث كطبيب مؤسّس</text>
    <text x="500" y="746" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">في الدليل والخريطة</text>

    <rect x="556" y="658" width="468" height="108" rx="18" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="1000" y="692" text-anchor="end" font-size="18" font-weight="700" fill="#fde68a">📋  صفحة عيادة احترافية</text>
    <text x="1000" y="722" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">صور · GPS · تأمين · تواصل</text>
    <text x="1000" y="746" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">مباشر مع المرضى</text>

    <!-- Row 2 -->
    <rect x="56" y="782" width="468" height="108" rx="18" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="500" y="816" text-anchor="end" font-size="18" font-weight="700" fill="#fde68a">📅  حجوزات إلكترونية</text>
    <text x="500" y="846" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">مواعيد منظمة + إشعارات</text>
    <text x="500" y="870" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">فورية للطبيب</text>

    <rect x="556" y="782" width="468" height="108" rx="18" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="1000" y="816" text-anchor="end" font-size="18" font-weight="700" fill="#fde68a">🎁  مزايا حصرية</text>
    <text x="1000" y="846" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">إعلان في المجلة + دعم</text>
    <text x="1000" y="870" text-anchor="end" font-size="14" font-weight="600" fill="#cbd5e1">تفعيل كامل مجاناً</text>
  </g>

  <!-- CTA -->
  <rect x="180" y="918" width="720" height="62" rx="16" fill="#ffffff" filter="url(#shadow)"/>
  <text x="540" y="958" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="24" font-weight="700" fill="#0c5e47">سجّل عيادتك الآن — مجاناً للمراجعة</text>

  <text x="540" y="1010" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="28" font-weight="700" fill="#d4af37">www.malamih.ps/join</text>
  <text x="540" y="1048" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="14" font-weight="600" fill="#64748b">باقات من $100/سنة  ·  موعد واحد جديد يغطي اشتراكك</text>
</svg>`;
}

async function makeLogoOverlay(size = 156) {
  const padding = 14;
  const inner = size - padding * 2;
  const logo = await sharp(logoPath)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="white"/></svg>`,
  );

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function main() {
  if (!existsSync(logoPath)) {
    console.error("Logo not found:", logoPath);
    process.exit(1);
  }

  const svg = buildSvg();

  writeFileSync(svgPath, svg, "utf8");
  console.log("SVG saved:", svgPath);

  const logoOverlay = await makeLogoOverlay(156);
  const base = await sharp(Buffer.from(svg)).png().toBuffer();

  await sharp(base)
    .composite([{ input: logoOverlay, left: 462, top: 40 }])
    .png()
    .toFile(pngPath);

  console.log("PNG saved:", pngPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

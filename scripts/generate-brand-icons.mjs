import { copyFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "apps/mobile/assets/IMG_6739.PNG");
const BRAND = "#295f59";
const CREAM = "#f7f5f0";

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error("Could not read IMG_6739.PNG");

/** Circular cream lockup — crop the cream disc (portrait source is taller than wide). */
async function circularLockup(size) {
  const meta = await sharp(SRC).metadata();
  const w = meta.width || 1024;
  const h = meta.height || 1024;
  const cropSize = Math.round(Math.min(w, h) * 0.62);
  const extracted = await sharp(SRC)
    .extract({
      left: Math.round((w - cropSize) / 2),
      top: Math.round((h - cropSize) / 2),
      width: cropSize,
      height: cropSize,
    })
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .ensureAlpha()
    .png()
    .toBuffer();

  const circle = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`,
  );

  return sharp(extracted)
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/** Tab / app icon: cream circle filling the brand square. */
async function squareAppIcon(size, radius = Math.round(size * 0.18)) {
  const pad = Math.round(size * 0.04);
  const inner = size - pad * 2;
  const mark = await circularLockup(inner);
  const svg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND}"/>
    </svg>`,
  );
  return sharp(svg)
    .composite([{ input: mark, left: pad, top: pad }])
    .png()
    .toBuffer();
}

const lockup1024 = await circularLockup(1024);
const icon512 = await squareAppIcon(512, 88);
const apple = await squareAppIcon(180, 36);
const favicon64 = await squareAppIcon(64, 12);
const favicon32 = await squareAppIcon(32, 7);
const favicon16 = await squareAppIcon(16, 4);

writeFileSync(path.join(ROOT, "apps/web/public/brand/logo-full.png"), await sharp(SRC).png().toBuffer());
writeFileSync(path.join(ROOT, "apps/web/public/brand/logo-mark.png"), icon512);
writeFileSync(path.join(ROOT, "apps/web/public/icon-512.png"), icon512);
writeFileSync(path.join(ROOT, "apps/web/public/apple-icon.png"), apple);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-32.png"), favicon32);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-16.png"), favicon16);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-64.png"), favicon64);
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-mark.png"), icon512);
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-full.png"), await sharp(SRC).png().toBuffer());
writeFileSync(path.join(ROOT, "apps/mobile/assets/icon.png"), icon512);
writeFileSync(path.join(ROOT, "apps/mobile/assets/adaptive-icon.png"), icon512);
copyFileSync(SRC, path.join(ROOT, "apps/mobile/assets/IMG_6739.PNG"));

const ogW = 1200;
const ogH = 630;
const ogMark = await circularLockup(360);
const ogSvg = Buffer.from(
  `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${ogW}" height="${ogH}" fill="${BRAND}"/>
    <text x="680" y="300" fill="${CREAM}" font-size="64" font-family="Georgia, Times New Roman, serif" letter-spacing="10">MALAMIH</text>
    <text x="680" y="360" fill="${CREAM}" font-size="24" font-family="Arial, sans-serif" opacity="0.92">دليل صحة وجمال الوجه في فلسطين</text>
  </svg>`,
);
const og = await sharp(ogSvg)
  .composite([{ input: ogMark, left: 220, top: 135 }])
  .png()
  .toBuffer();
writeFileSync(path.join(ROOT, "apps/web/public/brand/og-share.png"), og);
writeFileSync(path.join(ROOT, "apps/web/app/favicon.ico"), favicon64);

console.log("brand icons generated from IMG_6739.PNG", { width, height });

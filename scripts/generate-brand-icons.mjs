import { writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "apps/web/public/IMG_6744.PNG");
const BRAND = "#295f59";
const CREAM = "#f7f5f0";

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error("Could not read IMG_6744.PNG");

/** Square crop of the teal disc (portrait source). */
async function discSquare(size) {
  const w = width;
  const h = height;
  const cropSize = Math.round(Math.min(w, h) * 0.52);
  return sharp(SRC)
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
}

async function circularMark(size) {
  const square = await discSquare(size);
  const circle = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`,
  );
  return sharp(square)
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function appIcon(size, radius = Math.round(size * 0.22)) {
  const pad = Math.round(size * 0.02);
  const inner = size - pad * 2;
  const mark = await circularMark(inner);
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

const mark1024 = await circularMark(1024);
const icon512 = await appIcon(512, 96);
const apple = await appIcon(180, 40);
const favicon64 = await appIcon(64, 14);
const favicon32 = await appIcon(32, 8);
const favicon16 = await appIcon(16, 4);

writeFileSync(path.join(ROOT, "apps/web/public/brand/logo-full.png"), await sharp(SRC).png().toBuffer());
writeFileSync(path.join(ROOT, "apps/web/public/brand/logo-mark.png"), mark1024);
writeFileSync(path.join(ROOT, "apps/web/public/icon-512.png"), icon512);
writeFileSync(path.join(ROOT, "apps/web/public/apple-icon.png"), apple);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-64.png"), favicon64);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-32.png"), favicon32);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-16.png"), favicon16);
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-mark.png"), mark1024);
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-full.png"), await sharp(SRC).png().toBuffer());
writeFileSync(path.join(ROOT, "apps/mobile/assets/icon.png"), icon512);
writeFileSync(path.join(ROOT, "apps/mobile/assets/adaptive-icon.png"), icon512);

const ogMark = await circularMark(320);
const ogSvg = Buffer.from(
  `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${BRAND}"/>
    <text x="640" y="300" fill="${CREAM}" font-size="64" font-family="Georgia, Times New Roman, serif" letter-spacing="12">MALAMIH</text>
    <text x="640" y="360" fill="${CREAM}" font-size="24" font-family="Arial, sans-serif" opacity="0.92">دليل صحة وجمال الوجه في فلسطين</text>
  </svg>`,
);
const og = await sharp(ogSvg)
  .composite([{ input: ogMark, left: 240, top: 155 }])
  .png()
  .toBuffer();
writeFileSync(path.join(ROOT, "apps/web/public/brand/og-share.png"), og);
writeFileSync(path.join(ROOT, "apps/web/app/favicon.ico"), favicon64);

console.log("brand icons generated from IMG_6744.PNG", { width, height });

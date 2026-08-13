import { copyFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "apps/web/public/brand/logo-full.png");
const BRAND = "#295f59";
const CREAM = "#f7f5f0";

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error("Could not read logo-full.png");

/** Circular cream lockup — crop inside the cream disc, drop black corners. */
async function circularLockup(size) {
  const meta = await sharp(SRC).metadata();
  const w = meta.width || 1024;
  const h = meta.height || 1024;
  const inset = Math.round(Math.min(w, h) * 0.07);
  const cropSize = Math.min(w, h) - inset * 2;
  const extracted = await sharp(SRC)
    .extract({
      left: Math.round((w - cropSize) / 2),
      top: Math.round((h - cropSize) / 2),
      width: cropSize,
      height: cropSize,
    })
    .resize(size, size, { fit: "cover" })
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

/** Tab / app icon: cream circle on brand square (readable at 16–32px). */
async function squareAppIcon(size, radius = Math.round(size * 0.22)) {
  const pad = Math.round(size * 0.06);
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

const lockup512 = await circularLockup(512);
const icon512 = await squareAppIcon(512, 96);
const apple = await squareAppIcon(180, 40);
const favicon32 = await squareAppIcon(32, 8);
const favicon16 = await squareAppIcon(16, 4);

writeFileSync(path.join(ROOT, "apps/web/public/brand/logo-mark.png"), lockup512);
writeFileSync(path.join(ROOT, "apps/web/public/icon-512.png"), icon512);
writeFileSync(path.join(ROOT, "apps/web/public/apple-icon.png"), apple);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-32.png"), favicon32);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-16.png"), favicon16);
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-mark.png"), lockup512);
copyFileSync(SRC, path.join(ROOT, "apps/mobile/assets/logo-full.png"));

const ogW = 1200;
const ogH = 630;
const ogMark = await circularLockup(280);
const ogSvg = Buffer.from(
  `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${ogW}" height="${ogH}" fill="${BRAND}"/>
    <text x="620" y="300" fill="${CREAM}" font-size="72" font-family="Georgia, Times New Roman, serif" letter-spacing="8">MALAMIH</text>
    <text x="620" y="360" fill="${CREAM}" font-size="26" font-family="Arial, sans-serif" opacity="0.9">دليل صحة وجمال الوجه في فلسطين</text>
  </svg>`,
);
const og = await sharp(ogSvg)
  .composite([{ input: ogMark, left: 280, top: 175 }])
  .png()
  .toBuffer();
writeFileSync(path.join(ROOT, "apps/web/public/brand/og-share.png"), og);
writeFileSync(path.join(ROOT, "apps/web/app/favicon.ico"), await sharp(favicon32).toFormat("png").toBuffer());

console.log("brand icons generated", { width, height });

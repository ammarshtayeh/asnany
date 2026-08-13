import { writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "apps/web/public/brand/logo-full.png");
const BRAND = "#295f59";
const CREAM = "#f7f5f0";

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error("Could not read logo-full.png");

async function squareOnBrand(size, radius = Math.round(size * 0.18)) {
  const pad = Math.round(size * 0.1);
  const inner = size - pad * 2;
  const fitted = await sharp(SRC)
    .ensureAlpha()
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  const svg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND}"/>
    </svg>`,
  );

  return sharp(svg)
    .composite([{ input: fitted, left: pad, top: pad }])
    .png()
    .toBuffer();
}

const icon512 = await squareOnBrand(512, 96);
const apple = await squareOnBrand(180, 40);
const favicon32 = await squareOnBrand(32, 8);
const favicon16 = await squareOnBrand(16, 4);

const ico = await sharp(icon512).resize(32, 32).png().toBuffer();

writeFileSync(path.join(ROOT, "apps/web/public/icon-512.png"), icon512);
writeFileSync(path.join(ROOT, "apps/web/public/apple-icon.png"), apple);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-32.png"), favicon32);
writeFileSync(path.join(ROOT, "apps/web/public/favicon-16.png"), favicon16);
writeFileSync(path.join(ROOT, "apps/web/public/brand/logo-mark.png"), icon512);
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-full.png"), await sharp(SRC).png().toBuffer());
writeFileSync(path.join(ROOT, "apps/mobile/assets/logo-mark.png"), icon512);

const ogW = 1200;
const ogH = 630;
const ogMark = await sharp(icon512).resize(220, 220).png().toBuffer();
const ogSvg = Buffer.from(
  `<svg width="${ogW}" height="${ogH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${ogW}" height="${ogH}" fill="${BRAND}"/>
    <text x="640" y="290" fill="${CREAM}" font-size="72" font-family="Georgia, serif" font-weight="700">ملامح</text>
    <text x="640" y="360" fill="${CREAM}" font-size="28" font-family="Arial, sans-serif" opacity="0.9">دليل صحة وجمال الوجه في فلسطين</text>
  </svg>`,
);
const og = await sharp(ogSvg)
  .composite([{ input: ogMark, left: 360, top: 205 }])
  .png()
  .toBuffer();
writeFileSync(path.join(ROOT, "apps/web/public/brand/og-share.png"), og);

writeFileSync(path.join(ROOT, "apps/web/app/favicon.ico"), await sharp(ico).toFormat("png").toBuffer());

console.log("brand icons generated", { width, height });

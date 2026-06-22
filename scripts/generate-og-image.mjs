#!/usr/bin/env node
/**
 * Generate OG share image (1200x630) from brand logo.
 * Usage: npm run generate:og-image
 */
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "apps/web/public/brand/logo-full.png");
const outPath = path.join(root, "apps/web/public/brand/og-share.png");

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="50%" stop-color="#0c5e47"/>
      <stop offset="100%" stop-color="#0a1628"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="600" cy="220" r="120" fill="#ffffff" opacity="0.95"/>
  <text x="600" y="400" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">ملامح</text>
  <text x="600" y="470" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="36" font-weight="600" fill="#d4af37">malamih.ps</text>
  <text x="600" y="540" text-anchor="middle" font-family="Segoe UI, Tahoma, Arial, sans-serif" font-size="28" font-weight="600" fill="#cbd5e1">دليلك لصحة وجمال الوجه في فلسطين</text>
</svg>`;

async function main() {
  if (!existsSync(logoPath)) {
    console.error("Logo not found:", logoPath);
    process.exit(1);
  }

  const logoSize = 180;
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const base = await sharp(Buffer.from(svg)).png().toBuffer();

  await sharp(base)
    .composite([{ input: logo, left: 600 - logoSize / 2, top: 220 - logoSize / 2 }])
    .png()
    .toFile(outPath);

  console.log("OG image saved:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

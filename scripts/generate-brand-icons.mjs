#!/usr/bin/env node
/**
 * Generate circular brand icons from logo-full.png for web PWA and mobile app.
 * Usage: npm run generate:brand-icons
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "apps/web/public/brand/logo-full.png");

const outputs = [
  { path: path.join(root, "apps/web/public/icon-512.png"), size: 512, padding: 48 },
  { path: path.join(root, "apps/web/app/icon.png"), size: 256, padding: 24 },
  { path: path.join(root, "apps/web/public/apple-icon.png"), size: 180, padding: 18 },
  { path: path.join(root, "apps/mobile/assets/icon.png"), size: 1024, padding: 64 },
  { path: path.join(root, "apps/mobile/assets/adaptive-icon.png"), size: 1024, padding: 86 },
  { path: path.join(root, "apps/mobile/assets/splash-icon.png"), size: 512, padding: 48 },
];

async function makeCircularIcon(outPath, size, padding) {
  const inner = size - padding * 2;
  const logo = await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  );

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(outPath);
}

async function main() {
  await mkdir(path.dirname(outputs[0].path), { recursive: true });
  await mkdir(path.join(root, "apps/mobile/assets"), { recursive: true });

  for (const out of outputs) {
    await makeCircularIcon(out.path, out.size, out.padding);
    console.log(`Created ${out.path} (${out.size}x${out.size})`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "apps/web/public/IMG_6744.PNG");
const BRAND = "#295f59";
const CREAM = "#f7f5f0";
const BRAND_RGB = { r: 41, g: 95, b: 89, alpha: 1 };

const { width, height } = await sharp(SRC).metadata();
if (!width || !height) throw new Error("Could not read IMG_6744.PNG");

/**
 * Downsample, find non-black pixels (teal disc + white M), then crop a
 * padded square so the left M serif stays inside the circle.
 */
async function discSquare() {
  const probeW = 256;
  const { data, info } = await sharp(SRC)
    .resize(probeW, null, { fit: "inside", kernel: "nearest" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const sw = info.width;
  const sh = info.height;
  const ch = info.channels;
  let minX = sw;
  let minY = sh;
  let maxX = 0;
  let maxY = 0;
  let hits = 0;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r + g + b > 70) {
        hits++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hits) {
    const crop = Math.min(width, height);
    return {
      left: 0,
      top: Math.round((height - crop) / 2),
      width: crop,
      height: crop,
      detected: { hits: 0 },
    };
  }

  const scaleX = width / sw;
  const scaleY = height / sh;
  const bx = minX * scaleX;
  const by = minY * scaleY;
  const bw = (maxX - minX + 1) * scaleX;
  const bh = (maxY - minY + 1) * scaleY;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  const side = Math.min(width, height, Math.ceil(Math.max(bw, bh) * 1.03));

  let left = Math.round(cx - side / 2);
  let top = Math.round(cy - side / 2);
  left = Math.max(0, Math.min(left, width - side));
  top = Math.max(0, Math.min(top, height - side));

  return {
    left,
    top,
    width: side,
    height: side,
    detected: { minX, minY, maxX, maxY, hits, bx, by, bw, bh, cx, cy, side },
  };
}

const crop = await discSquare();

async function circularMark(size) {
  const { data, info } = await sharp(SRC)
    .extract(crop)
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] + data[i + 1] + data[i + 2] < 48) {
      data[i] = BRAND_RGB.r;
      data[i + 1] = BRAND_RGB.g;
      data[i + 2] = BRAND_RGB.b;
      data[i + 3] = 255;
    }
  }

  const filled = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const circle = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`,
  );

  return sharp(filled)
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function appIcon(size, radius = Math.round(size * 0.22)) {
  const mark = await circularMark(size);
  const svg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="${BRAND}"/>
    </svg>`,
  );
  return sharp(svg)
    .composite([{ input: mark, left: 0, top: 0 }])
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

console.log("brand icons generated from IMG_6744.PNG", { width, height, crop });

#!/usr/bin/env node
/**
 * Capture desktop + mobile web screenshots for poster/marketing brief.
 * Usage: npm run capture:poster-assets
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "docs", "design", "poster-assets");
const ICON_SRC = path.join(__dirname, "..", "apps", "web", "public", "icon-512.png");
const BASE_URL = (process.env.BASE_URL || "https://www.malamih.ps").replace(/\/$/, "");

const PAGES = [
  { name: "web-desktop-home", path: "/", viewport: { width: 1440, height: 900 }, fullPage: false },
  { name: "web-desktop-doctors", path: "/doctors/search", viewport: { width: 1440, height: 900 }, fullPage: false },
  { name: "web-desktop-about", path: "/about", viewport: { width: 1440, height: 900 }, fullPage: false },
  { name: "web-mobile-home", path: "/", viewport: { width: 390, height: 844 }, fullPage: true },
  { name: "web-mobile-doctors", path: "/doctors/search", viewport: { width: 390, height: 844 }, fullPage: false },
  { name: "web-mobile-appointments", path: "/appointments", viewport: { width: 390, height: 844 }, fullPage: false },
  { name: "web-mobile-subscriptions", path: "/subscriptions", viewport: { width: 390, height: 844 }, fullPage: false },
  { name: "web-mobile-doctor-profile", path: "/doctors/3940fa5f-01b2-4119-b06b-076e9dbab532", viewport: { width: 390, height: 844 }, fullPage: false },
  { name: "web-desktop-doctor-profile", path: "/doctors/3940fa5f-01b2-4119-b06b-076e9dbab532", viewport: { width: 1440, height: 900 }, fullPage: false },
];

async function main() {
  const playwright = await import("playwright");
  await mkdir(OUT_DIR, { recursive: true });
  await copyFile(ICON_SRC, path.join(OUT_DIR, "logo-icon-512.png"));

  const browser = await playwright.chromium.launch();
  for (const item of PAGES) {
    const context = await browser.newContext({
      viewport: item.viewport,
      locale: "ar-PS",
    });
    const page = await context.newPage();
    const url = `${BASE_URL}${item.path}`;
    console.log(`Capturing ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(OUT_DIR, `${item.name}.png`),
        fullPage: item.fullPage ?? false,
      });
      console.log(`  → ${item.name}.png`);
    } catch (error) {
      console.warn(`  ✗ ${item.name}:`, error instanceof Error ? error.message : error);
    }
    await context.close();
  }

  await browser.close();
  console.log(`Done. Assets in ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

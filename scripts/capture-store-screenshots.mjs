#!/usr/bin/env node
/**
 * Capture mobile-viewport screenshots of the public website for store/marketing previews.
 * Usage: npm run capture:screenshots
 *        BASE_URL=https://www.malamih.ps npm run capture:screenshots
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "docs", "store-screenshots", "web");
const BASE_URL = (process.env.BASE_URL || "https://www.malamih.ps").replace(/\/$/, "");

const PAGES = [
  { name: "01-home", path: "/" },
  { name: "02-doctors", path: "/doctors/search" },
  { name: "03-offers", path: "/ads" },
  { name: "04-appointments", path: "/appointments" },
  { name: "05-about", path: "/about" },
];

const VIEWPORT = { width: 390, height: 844 };

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.error("Playwright غير مثبت. شغّل: npx playwright install chromium");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: "ar-PS",
    userAgent: "MalamihStoreCapture/1.0",
  });
  const page = await context.newPage();

  for (const item of PAGES) {
    const url = `${BASE_URL}${item.path}`;
    console.log(`Capturing ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1500);
      const filePath = path.join(OUT_DIR, `${item.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  → ${filePath}`);
    } catch (error) {
      console.warn(`  ✗ failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  await browser.close();
  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify({ baseUrl: BASE_URL, viewport: VIEWPORT, pages: PAGES, capturedAt: new Date().toISOString() }, null, 2)
  );
  console.log(`Done. Screenshots in ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

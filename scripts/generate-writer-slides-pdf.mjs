#!/usr/bin/env node
/**
 * Generate writer subscription slides PDF.
 * Usage: npm run generate:writer-slides-pdf
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs", "content", "malamih-doctor-pitch-slides.html");
const outDir = path.join(root, "docs", "content");
const pdfPath = path.join(outDir, "malamih-doctor-pitch-slides.pdf");

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.error("Playwright غير مثبت. شغّل: npx playwright install chromium");
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: "8mm", bottom: "8mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

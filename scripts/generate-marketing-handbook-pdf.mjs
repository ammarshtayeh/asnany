#!/usr/bin/env node
/**
 * Generate marketing staff handbook PDF (A4 portrait).
 * Usage: npm run generate:marketing-handbook-pdf
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs", "marketing", "malamih-marketing-staff-handbook.html");
const outDir = path.join(root, "docs", "marketing");
const pdfPath = path.join(outDir, "malamih-marketing-staff-handbook.pdf");

async function launchBrowser(playwright) {
  const options = { headless: true };
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await playwright.chromium.launch({ ...options, channel });
    } catch {
      /* try next */
    }
  }
  return playwright.chromium.launch(options);
}

async function main() {
  const playwright = await import("playwright");
  await mkdir(outDir, { recursive: true });
  const browser = await launchBrowser(playwright);
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });
  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

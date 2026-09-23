#!/usr/bin/env node
/**
 * Generate doctor partnership pitch slides PDF (landscape).
 * Usage: npm run generate:doctor-pitch-pdf
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs", "content", "malamih-doctor-pitch-slides.html");
const outDir = path.join(root, "docs", "content");
const pdfPath = path.join(outDir, "malamih-doctor-pitch-slides.pdf");

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

#!/usr/bin/env node
/**
 * Generate doctor partnership brochure PDF.
 * Usage: npm run generate:doctor-brochure-pdf
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "docs", "doctors", "malamih-doctor-brochure.html");
const outDir = path.join(root, "docs", "doctors");
const pdfPath = path.join(outDir, "malamih-doctor-brochure.pdf");

async function main() {
  const playwright = await import("playwright");
  await mkdir(outDir, { recursive: true });
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
  });
  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

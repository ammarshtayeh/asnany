#!/usr/bin/env node
/**
 * Generate Malamih startup team plan + 5 role PDFs (A4 portrait).
 * Usage: npm run generate:team-role-pdfs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "docs", "team");

const docs = [
  "malamih-startup-team-plan",
  "role-01-doctor-sales",
  "role-02-marketing-growth",
  "role-03-content-social",
  "role-04-field-ops",
  "role-05-customer-success",
  "malamih-reels-content-plan",
];

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

  for (const name of docs) {
    const htmlPath = path.join(outDir, `${name}.html`);
    const pdfPath = path.join(outDir, `${name}.pdf`);
    const page = await browser.newPage();
    await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
    await page.close();
    console.log(`PDF saved: ${pdfPath}`);
  }

  await browser.close();
  console.log(`Done: ${docs.length} PDFs in ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Generate PDF from malamih marketing plan HTML
 * Usage: node scripts/generate-marketing-pdf.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "docs", "malamih-marketing-business-plan.html");
const pdfPath = join(root, "docs", "malamih-marketing-business-plan.pdf");

async function main() {
  if (!existsSync(htmlPath)) {
    console.error("HTML file not found:", htmlPath);
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    console.log("Installing puppeteer...");
    execSync("npm install puppeteer@23 --no-save", { cwd: root, stdio: "inherit" });
    puppeteer = await import("puppeteer");
  }

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  const html = readFileSync(htmlPath, "utf8");
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "15mm", right: "15mm" },
  });
  await browser.close();
  console.log("PDF created:", pdfPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

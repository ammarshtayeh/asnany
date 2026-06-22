#!/usr/bin/env node
/**
 * Generate PDF from malamih platform guide (Arabic).
 * Usage: npm run generate:platform-guide-pdf
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "docs", "malamih-platform-guide-ar.md");
const htmlPath = join(root, "docs", "malamih-platform-guide-ar.html");
const pdfPath = join(root, "docs", "malamih-platform-guide-ar.pdf");

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  :root { --navy:#0a1628; --teal:#0c5e47; --gold:#d4af37; }
  * { box-sizing:border-box; }
  body {
    font-family:'Cairo',sans-serif; font-size:10pt; line-height:1.72;
    color:#0f172a; background:#fff; direction:rtl; text-align:right;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .cover {
    min-height:100vh; display:flex; flex-direction:column; justify-content:center;
    align-items:center; text-align:center; padding:56px 36px;
    background:linear-gradient(145deg,var(--navy) 0%,var(--teal) 55%,var(--navy) 100%);
    color:#fff; page-break-after:always;
  }
  .cover-logo {
    width:88px;height:88px;border-radius:24px;
    background:linear-gradient(135deg,var(--teal),var(--gold));
    display:flex;align-items:center;justify-content:center;
    font-size:44px;font-weight:900;color:#fff;margin-bottom:20px;
  }
  .cover h1 { font-size:28pt;font-weight:900;margin:0 0 6px; }
  .cover .gold { color:var(--gold); }
  .cover .sub { font-size:12pt;opacity:0.92;max-width:520px;line-height:1.85;margin:12px 0; }
  .cover .badges { margin-top:20px; display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .cover .badge {
    background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.25);
    padding:6px 14px; border-radius:999px; font-size:9pt; font-weight:700;
  }
  .cover .meta { margin-top:36px;font-size:9.5pt;opacity:0.78; }
  .content { padding:28px 32px 40px; max-width:920px; margin:0 auto; }
  h1 { color:var(--teal);font-size:16pt;font-weight:900;margin:28px 0 10px;
    padding-bottom:6px;border-bottom:3px solid var(--gold); page-break-after:avoid; }
  h2 { color:var(--navy);font-size:13pt;font-weight:900;margin:22px 0 8px; page-break-after:avoid; }
  h3 { color:#334155;font-size:11pt;font-weight:800;margin:16px 0 6px; page-break-after:avoid; }
  h4 { font-size:10pt;font-weight:800;margin:12px 0 5px; color:#475569; }
  p { margin:0 0 8px; }
  blockquote {
    border-right:4px solid var(--gold); margin:12px 0; padding:10px 16px;
    background:#fffbeb;border-radius:0 10px 10px 0;font-weight:600;color:var(--navy);
  }
  table { width:100%;border-collapse:collapse;margin:10px 0 16px;font-size:8.5pt; }
  th { background:var(--navy);color:#fff;padding:7px 9px;text-align:right;font-weight:800; }
  td { padding:6px 9px;border-bottom:1px solid #e2e8f0;vertical-align:top; }
  tr:nth-child(even) td { background:#f8fafc; }
  ul,ol { margin:6px 22px 12px 0; padding-right:4px; }
  li { margin-bottom:4px; }
  code, pre {
    font-family:Consolas,monospace; background:#f1f5f9; border-radius:6px;
    direction:ltr; text-align:left;
  }
  pre {
    padding:10px 12px; overflow-x:auto; font-size:7.5pt; line-height:1.45;
    white-space:pre-wrap; page-break-inside:avoid;
  }
  code { padding:2px 5px; font-size:8.5pt; }
  pre code { padding:0;background:none; }
  hr { border:none;border-top:2px solid #e2e8f0;margin:24px 0; }
  strong { color:var(--navy); }
  a { color:var(--teal); text-decoration:none; }
  .intro-note {
    background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;
    padding:12px 16px;margin:14px 0 20px;font-size:9.5pt;
  }
  @media print {
    h1,h2,h3 { page-break-after:avoid; }
    table,pre,blockquote { page-break-inside:avoid; }
    tr { page-break-inside:avoid; }
  }
`;

function buildHtml(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>ملامح.ps — دليل المنصة الشامل</title>
  <style>${CSS}</style>
</head>
<body>
  <section class="cover">
    <div class="cover-logo">م</div>
    <h1>ملامح<span class="gold">.ps</span></h1>
    <p class="sub">دليل المنصة الشامل — للأطباء · المختبرات · مراكز التجميل · الموردين · المرضى · الشركاء</p>
    <div class="badges">
      <span class="badge">malamih.ps</span>
      <span class="badge">موقع + تطبيق</span>
      <span class="badge">B2B2C</span>
      <span class="badge">فلسطين</span>
    </div>
    <p class="meta">https://www.malamih.ps · 2026<br/>ammar.shtayeh@gmail.com · wa.me/9720595537190</p>
  </section>
  <div class="content">
    <div class="intro-note">
      <strong>عن هذه الوثيقة:</strong> شرح كامل لمنصة ملامih — ما هي، مبدأ عملها، القنوات، تدفقات المستخدمين،
      وكيف يستفيد كل جمهور مستهدف (مرضى · أطباء · مختبرات · تجميل · موردون · معلنون).
    </div>
    ${bodyHtml}
    <hr/>
    <p style="text-align:center;color:#64748b;font-size:8.5pt;">
      © 2026 ملامih.ps — دليلك لصحة وجمال الوجه في فلسطين
    </p>
  </div>
</body>
</html>`;
}

async function getMarked() {
  try {
    return (await import("marked")).marked;
  } catch {
    execSync("npm install marked@15 --no-save", { cwd: root, stdio: "inherit" });
    return (await import("marked")).marked;
  }
}

async function main() {
  if (!existsSync(mdPath)) {
    console.error("Markdown not found:", mdPath);
    process.exit(1);
  }

  const marked = await getMarked();
  marked.setOptions({ gfm: true, breaks: false });
  const md = readFileSync(mdPath, "utf8");
  const bodyHtml = marked.parse(md);
  const fullHtml = buildHtml(bodyHtml);
  writeFileSync(htmlPath, fullHtml, "utf8");
  console.log("HTML created:", htmlPath);

  const playwright = await import("playwright");
  const launchOptions = { headless: true };
  for (const channel of ["chrome", "msedge"]) {
    try {
      const browser = await playwright.chromium.launch({ ...launchOptions, channel });
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: "networkidle" });
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", bottom: "14mm", left: "10mm", right: "10mm" },
      });
      await browser.close();
      console.log(`PDF created (${channel}):`, pdfPath);
      return;
    } catch (error) {
      console.warn(`Could not use ${channel}:`, error.message);
    }
  }

  const browser = await playwright.chromium.launch(launchOptions);
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "networkidle" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "14mm", left: "10mm", right: "10mm" },
  });
  await browser.close();

  console.log("PDF created:", pdfPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Generate PDF from malamih master playbook markdown
 * Usage: node scripts/generate-marketing-pdf.mjs
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "docs", "malamih-master-playbook.md");
const htmlPath = join(root, "docs", "malamih-master-playbook.html");
const pdfPath = join(root, "docs", "malamih-master-playbook.pdf");
const legacyPdfPath = join(root, "docs", "malamih-marketing-business-plan.pdf");

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  :root { --navy:#0a1628; --teal:#0c5e47; --gold:#d4af37; }
  * { box-sizing:border-box; }
  body {
    font-family:'Cairo',sans-serif; font-size:10.5pt; line-height:1.75;
    color:#0f172a; background:#fff; direction:rtl; text-align:right;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .cover {
    min-height:100vh; display:flex; flex-direction:column; justify-content:center;
    align-items:center; text-align:center; padding:60px 40px;
    background:linear-gradient(135deg,var(--navy),#0f2744,var(--teal));
    color:#fff; page-break-after:always;
  }
  .cover-logo {
    width:96px;height:96px;border-radius:28px;
    background:linear-gradient(135deg,var(--gold),#f59e0b);
    display:flex;align-items:center;justify-content:center;
    font-size:48px;font-weight:900;color:var(--navy);margin-bottom:24px;
  }
  .cover h1 { font-size:32pt;font-weight:900;margin:0 0 8px; }
  .cover .sub { font-size:13pt;opacity:0.92;max-width:560px;line-height:1.8; }
  .cover .meta { margin-top:40px;font-size:10pt;opacity:0.75; }
  .content { padding:32px 36px 48px; max-width:900px; margin:0 auto; }
  h1 { color:var(--teal);font-size:18pt;font-weight:900;margin:32px 0 12px;
    padding-bottom:8px;border-bottom:3px solid var(--gold); page-break-after:avoid; }
  h2 { color:var(--navy);font-size:14pt;font-weight:900;margin:24px 0 10px; page-break-after:avoid; }
  h3 { color:#334155;font-size:11.5pt;font-weight:800;margin:18px 0 8px; page-break-after:avoid; }
  h4 { font-size:10.5pt;font-weight:800;margin:14px 0 6px; }
  p { margin:0 0 10px; }
  blockquote {
    border-right:4px solid var(--gold); margin:14px 0; padding:12px 18px;
    background:#fffbeb;border-radius:0 12px 12px 0;font-weight:700;color:var(--navy);
  }
  table { width:100%;border-collapse:collapse;margin:12px 0 18px;font-size:9pt; }
  th { background:var(--navy);color:#fff;padding:8px 10px;text-align:right;font-weight:800; }
  td { padding:7px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top; }
  tr:nth-child(even) td { background:#f8fafc; }
  ul,ol { margin:8px 24px 14px 0; }
  li { margin-bottom:5px; }
  code, pre {
    font-family:Consolas,monospace; background:#f1f5f9; border-radius:6px;
    direction:ltr; text-align:left;
  }
  pre { padding:12px 14px; overflow-x:auto; font-size:8.5pt; line-height:1.5; white-space:pre-wrap; }
  code { padding:2px 6px; font-size:9pt; }
  pre code { padding:0;background:none; }
  hr { border:none;border-top:2px solid #e2e8f0;margin:28px 0; }
  strong { color:var(--navy); }
  .toc-note {
    background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;
    padding:14px 18px;margin:16px 0;font-size:10pt;
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
  <title>دليل ملامح الشامل — Master Playbook</title>
  <style>${CSS}</style>
</head>
<body>
  <section class="cover">
    <div class="cover-logo">م</div>
    <h1>دليل ملامح الشامل</h1>
    <p class="sub">Malamih Master Playbook — تسويق · مبيعات · عمليات · تكاليف · تطوير · نمو<br/>
    Product Owner · Business Planner · Project Manager · Programmer-founder</p>
    <p class="meta">malamih.ps · v2.0 · يونيو 2026<br/>ammar.shtayeh@gmail.com</p>
  </section>
  <div class="content">
    <div class="toc-note"><strong>كيف تستخدم هذا الدليل:</strong> راجعه أسبوعياً (اجتماع الاثنين)، شهرياً (KPIs)، وكل ربع سنة (تحديث الإصدار). هذا نظام تشغيل مدى الحياة — ليس تقريراً للقراءة مرة واحدة.</div>
    ${bodyHtml}
    <hr/>
    <p style="text-align:center;color:#64748b;font-size:9pt;">© 2026 ملامih.ps — دليل داخلي · الإصدار 2.0</p>
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

  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    execSync("npm install puppeteer@23 --no-save", { cwd: root, stdio: "inherit" });
    puppeteer = await import("puppeteer");
  }

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "16mm", left: "12mm", right: "12mm" },
  });
  await browser.close();

  // Also update legacy filename for convenience
  copyFileSync(pdfPath, legacyPdfPath);

  console.log("PDF created:", pdfPath);
  console.log("Also copied to:", legacyPdfPath);
}

main().catch((err) => { console.error(err); process.exit(1); });

"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily: "Tahoma, Arial, sans-serif",
          background: "#f7f5f0",
          color: "#0a1628",
        }}
      >
        <main
          style={{
            margin: "0 auto",
            minHeight: "100vh",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>حدث خطأ غير متوقع</h1>
          <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: "#64748b", fontWeight: 700 }}>
            نعتذر، واجهت المنصة مشكلة مؤقتة. جرّب إعادة تحميل الصفحة أو العودة للرئيسية.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: 12,
                background: "#295f59",
                color: "#fff",
                padding: "12px 20px",
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              إعادة المحاولة
            </button>
            <Link
              href="/"
              style={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#0a1628",
                padding: "12px 20px",
                fontWeight: 900,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              الرئيسية
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

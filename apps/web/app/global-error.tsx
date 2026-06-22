"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";

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
      <body className="min-h-screen mesh-bg font-sans text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <RefreshCw className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black">حدث خطأ غير متوقع</h1>
          <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
            نعتذر، واجهت المنصة مشكلة مؤقتة. جرّب إعادة تحميل الصفحة أو العودة للرئيسية.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800"
            >
              <Home className="h-4 w-4" />
              الرئيسية
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

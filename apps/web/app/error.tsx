"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
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
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center" dir="rtl">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <RefreshCw className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-950">تعذر تحميل هذه الصفحة</h1>
      <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
        حدث خطأ أثناء عرض المحتوى. يمكنك إعادة المحاولة أو العودة للصفحة الرئيسية.
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
  );
}

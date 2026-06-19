import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center" dir="rtl">
      <p className="text-6xl font-black text-primary">404</p>
      <h1 className="mt-4 text-2xl font-black text-slate-950">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm font-bold leading-7 text-slate-500">
        الرابط الذي طلبته غير متاح أو تم نقله. جرّب البحث عن طبيب أو العودة للرئيسية.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white"
        >
          <Home className="h-4 w-4" />
          الرئيسية
        </Link>
        <Link
          href="/doctors/search"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800"
        >
          <Search className="h-4 w-4" />
          البحث عن أطباء
        </Link>
      </div>
    </main>
  );
}

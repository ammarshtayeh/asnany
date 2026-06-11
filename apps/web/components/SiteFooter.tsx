"use client";

import Link from "next/link";
import { Mail, Phone, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

const ownerPhone = "9720595537190";
const ownerEmail = "ammar.shtayeh@gmail.com";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-4 py-16 lg:px-8 relative z-30" dir="rtl">
      <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[1fr_auto] md:items-center">
        <div className="text-right">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-amber-700 text-white font-black text-lg select-none border border-white/10 shadow-lg shadow-black/30">
              م
            </span>
            <h2 className="text-2xl font-black text-white">
              ملامح<span className="text-amber-500">.ps</span>
            </h2>
          </div>
          <p className="max-w-2xl text-sm font-medium leading-7 text-slate-400">
            منصة ملامح باسم عمار اشتية، لتسهيل الوصول لأطباء وصناع الجمال والوجه والأسنان والخدمات الطبية في فلسطين.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
            <a href={`mailto:${ownerEmail}`} className="inline-flex items-center gap-2 hover:text-amber-500 transition-colors">
              <Mail className="h-4 w-4 text-amber-500" />
              {ownerEmail}
            </a>
            <a href={`https://wa.me/${ownerPhone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-emerald-500 transition-colors">
              <Phone className="h-4 w-4 text-emerald-500" />
              {ownerPhone}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-black text-slate-300">
          <Link href="/join" className="hover:text-amber-500 transition-colors">انضم كطبيب</Link>
          <Link href="/advertise" className="hover:text-amber-500 transition-colors">أعلن معنا</Link>
          <Link href="/marketplace" className="hover:text-amber-500 transition-colors">سوق ملامح</Link>
          <Link href="/privacy" className="hover:text-amber-500 transition-colors">سياسة الخصوصية</Link>
          <Link href="/blog" className="hover:text-amber-500 transition-colors">المجلة</Link>
          <Link href="/terms" className="hover:text-amber-500 transition-colors">الشروط</Link>
        </div>
      </div>
    </footer>
  );
}

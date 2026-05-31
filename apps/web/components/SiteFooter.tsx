"use client";

import Link from "next/link";
import { Mail, Phone, Stethoscope } from "lucide-react";
import { usePathname } from "next/navigation";

const ownerPhone = "9720595537190";
const ownerEmail = "ammar.shtayeh@gmail.com";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 lg:px-8" dir="rtl">
      <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="text-right">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-black text-slate-950">
              أسناني<span className="text-sky-500">.ps</span>
            </h2>
          </div>
          <p className="max-w-2xl text-sm font-semibold leading-7 text-slate-500">
            منصة أسناني باسم عمار اشتية، لتسهيل الوصول لأطباء الأسنان والخدمات الطبية في فلسطين.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
            <a href={`mailto:${ownerEmail}`} className="inline-flex items-center gap-2 hover:text-sky-600">
              <Mail className="h-4 w-4" />
              {ownerEmail}
            </a>
            <a href={`https://wa.me/${ownerPhone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-emerald-600">
              <Phone className="h-4 w-4" />
              {ownerPhone}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm font-black text-slate-600">
          <Link href="/doctors/register" className="hover:text-sky-600">انضم كطبيب</Link>
          <Link href="/advertise" className="hover:text-sky-600">أعلن معنا</Link>
          <Link href="/marketplace" className="hover:text-sky-600">سوق أسناني</Link>
          <Link href="/blog" className="hover:text-sky-600">المجلة</Link>
        </div>
      </div>
    </footer>
  );
}

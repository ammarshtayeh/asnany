"use client";

import { useState } from "react";
import { Users, Calendar as CalendarIcon, Megaphone, Store, Star, LayoutDashboard, LogOut, Link2, Check } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const registrationUrl = `${window.location.origin}/doctors/register`;
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white">لوحة التحكم</h2>
          <p className="text-slate-400 text-sm mt-1">إدارة دليل أسناني</p>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> الرئيسية
          </Link>
          <Link href="/admin/doctors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> الأطباء
          </Link>
          <Link href="/admin/appointments" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <CalendarIcon className="w-5 h-5" /> المواعيد
          </Link>
          <Link href="/admin/ads" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Megaphone className="w-5 h-5" /> الإعلانات
          </Link>
          <Link href="/admin/stores" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Store className="w-5 h-5" /> المتاجر
          </Link>
          <Link href="/admin/reviews" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Star className="w-5 h-5" /> التقييمات
          </Link>

          <div className="px-3 mt-4">
            <button 
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-md border-0 cursor-pointer ${copied ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10" : "bg-primary hover:bg-primary-dark text-white shadow-primary/10"}`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> تم نسخ الرابط!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" /> نسخ رابط تسجيل الأطباء
                </>
              )}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/api/auth/logout" method="POST">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors border-0 cursor-pointer bg-transparent">
              <LogOut className="w-5 h-5" /> تسجيل خروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

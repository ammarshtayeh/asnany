"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Users, Calendar as CalendarIcon, Megaphone, Store, Star, LayoutDashboard, LogOut, Sparkles, Menu, X, FileText, KeyRound, Plus, Link2, Check, CreditCard, Newspaper, Wallet, Bell } from "lucide-react";
import Link from "next/link";
import NotificationSoundBridge from "@/components/NotificationSoundBridge";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleCopyLink = () => {
    const registrationUrl = `${window.location.origin}/doctors/register`;
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen mesh-bg flex" dir="rtl">
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/85 px-4 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-200/80 bg-white/90 p-2 text-slate-900 shadow-sm"
          aria-label="فتح قائمة الإدارة"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-right">
          <p className="text-sm font-black text-slate-950">لوحة التحكم</p>
          <p className="text-xs font-bold text-slate-500">إدارة ملامح.ps</p>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-slate-950/50"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-[#0a1628] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-black">لوحة التحكم</h2>
                <p className="text-sm text-slate-400">إدارة المنصة</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-xl bg-white/10 p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              <AdminLink href="/admin" icon={LayoutDashboard} label="الرئيسية" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/doctors" icon={Users} label="الأطباء" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/doctors?add=true" icon={Plus} label="تسجيل عيادة جديدة" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/doctor-accounts" icon={KeyRound} label="حسابات الأطباء" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/appointments" icon={CalendarIcon} label="المواعيد" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/ads" icon={Megaphone} label="الإعلانات" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/stores" icon={Store} label="المتاجر" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/discount-card" icon={CreditCard} label="بطاقة الخصم" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/services" icon={Sparkles} label="خدمات المنصة" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/content" icon={FileText} label="المحتوى والعروض" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/notifications" icon={Bell} label="الإشعارات" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/ticker" icon={Newspaper} label="الشريط الإخباري" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/subscriptions" icon={Wallet} label="الاشتراكات والباقات" onClick={() => setMobileOpen(false)} />
              <AdminLink href="/admin/reviews" icon={Star} label="التقييمات" onClick={() => setMobileOpen(false)} />

              <div className="px-3 mt-4">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-md border-0 cursor-pointer ${copied ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10" : "bg-primary hover:bg-primary-dark text-white shadow-primary/10"}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> تم نسخ الرابط!
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" /> استمارة طبيب (نسخ الرابط)
                    </>
                  )}
                </button>
              </div>

              <div className="mt-auto border-t border-white/10 p-3">
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-400 hover:bg-red-500/10">
                    <LogOut className="h-5 w-5" /> تسجيل خروج
                  </button>
                </form>
              </div>
            </nav>
          </aside>
        </div>
      ) : null}

      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-[#0a1628] text-white border-l border-white/5">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white">لوحة التحكم</h2>
          <p className="text-slate-400 text-sm mt-1">إدارة دليل ملامح</p>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> الرئيسية
          </Link>
          <Link href="/admin/doctors" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> الأطباء
          </Link>
          <Link href="/admin/doctors?add=true" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Plus className="w-5 h-5" /> تسجيل عيادة جديدة
          </Link>
          <Link href="/admin/doctor-accounts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <KeyRound className="w-5 h-5" /> حسابات الأطباء
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
          <Link href="/admin/discount-card" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" /> بطاقة الخصم
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" /> خدمات المنصة
          </Link>
          <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <FileText className="w-5 h-5" /> المحتوى والعروض
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Bell className="w-5 h-5" /> الإشعارات
          </Link>
          <Link href="/admin/ticker" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Newspaper className="w-5 h-5" /> الشريط الإخباري
          </Link>
          <Link href="/admin/subscriptions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Wallet className="w-5 h-5" /> الاشتراكات والباقات
          </Link>
          <Link href="/admin/reviews" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
            <Star className="w-5 h-5" /> التقييمات
          </Link>

          <div className="px-3 mt-4">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-md border-0 cursor-pointer ${copied ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10" : "bg-primary hover:bg-primary-dark text-white shadow-primary/10"}`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> تم نسخ الرابط!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" /> استمارة طبيب (نسخ الرابط)
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

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <NotificationSoundBridge href="/admin/appointments" />
        {children}
      </main>
    </div>
  );
}

function AdminLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

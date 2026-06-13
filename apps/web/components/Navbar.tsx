"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarCheck2,
  ClipboardList,
  CreditCard,
  Home,
  Menu,
  Microscope,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Store,
  Tags,
  UserCircle2,
  X,
} from "lucide-react";

const links = [
  {
    href: "/",
    label: "الرئيسية",
    icon: Sparkles,
    color: "text-amber-600",
    active: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    href: "/offers",
    label: "العروض",
    icon: Tags,
    color: "text-rose-600",
    active: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    href: "/marketplace",
    label: "السوق",
    icon: Store,
    color: "text-emerald-600",
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    href: "/beauty",
    label: "التجميل",
    icon: Sparkles,
    color: "text-fuchsia-600",
    active: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
  },
  {
    href: "/labs",
    label: "المختبرات",
    icon: Microscope,
    color: "text-indigo-600",
    active: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    href: "/booking",
    label: "الحجز",
    icon: CalendarCheck2,
    color: "text-teal-600",
    active: "bg-teal-50 text-teal-700 border-teal-100",
  },
  {
    href: "/appointments",
    label: "حجوزاتي",
    icon: ClipboardList,
    color: "text-sky-600",
    active: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    href: "/discount-card",
    label: "بطاقة الخصم",
    icon: CreditCard,
    color: "text-blue-600",
    active: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    href: "/blog",
    label: "المجلة",
    icon: BookOpen,
    color: "text-violet-600",
    active: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    href: "/stores",
    label: "الموردون",
    icon: ShoppingBag,
    color: "text-slate-600",
    active: "bg-slate-100 text-slate-800 border-slate-200",
  },
];

const mobilePrimaryLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/#doctors", label: "بحث", icon: Search },
  { href: "/booking", label: "حجز", icon: CalendarCheck2 },
  { href: "/offers", label: "عروض", icon: Tags },
  { href: "/discount-card", label: "خصم", icon: CreditCard },
];

export default function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (currentPath.startsWith("/admin")) return null;

  return (
    <>
    <nav className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
      scrolled
        ? "bg-white/90 backdrop-blur-2xl border-slate-200/70 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] h-[60px]"
        : "bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-[0_2px_20px_-3px_rgba(15,23,42,0.02)] h-[72px]"
    }`}>
      <div className={`max-w-[1600px] mx-auto px-3 lg:px-6 flex items-center gap-3 transition-all duration-300 ${scrolled ? "h-[60px]" : "h-[72px]"}`}>
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-tr from-slate-950 via-slate-800 to-amber-700 rounded-xl flex items-center justify-center shadow-md shadow-slate-950/30 group-hover:scale-105 transition-all duration-300 border border-white/10">
            <span className="text-white font-black text-lg select-none leading-none pt-0.5">م</span>
          </div>
          <div className="flex items-center select-none">
            <span className="text-xl font-black tracking-tight text-slate-900">ملامح</span>
            <span className="text-xl font-black text-amber-500">.ps</span>
          </div>
        </Link>

        <div className="hidden lg:flex flex-1 min-w-0 justify-center">
          <div className="flex items-center gap-0.5 bg-slate-50/70 p-1 rounded-full border border-slate-200/50">
            {links.map((link) => {
              const isActive =
                currentPath === link.href ||
                (link.href !== "/" && currentPath.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-black transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? `${link.active} shadow-sm scale-[1.02]`
                      : "border-transparent text-slate-500 hover:bg-white hover:text-slate-900 hover:border-slate-200/70 hover:shadow-sm"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "" : link.color}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/doctor/login"
            className="hidden xl:flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs transition-all px-3.5 py-2 rounded-full border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300"
          >
            <UserCircle2 className="w-4 h-4 text-slate-400" />
            <span>دخول الطبيب</span>
          </Link>
          <Link
            href="/booking"
            className="bg-gradient-to-r from-slate-950 via-slate-800 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white px-5 py-2.5 rounded-full text-xs font-black transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_25px_rgba(180,83,9,0.25)] hover:-translate-y-0.5"
          >
            احجز الآن
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden mr-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl" dir="rtl">
          <div className="mx-auto max-w-[1400px] px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => {
                const isActive =
                  currentPath === link.href ||
                  (link.href !== "/" && currentPath.startsWith(link.href));
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-black transition-all ${
                      isActive
                        ? link.active
                        : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className={`h-5 w-5 ${isActive ? "" : link.color}`} />
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/booking"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10"
              >
                احجز الآن
              </Link>
              <Link
                href="/doctor/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
              >
                <UserCircle2 className="h-4 w-4" />
                دخول الطبيب
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:hidden" dir="rtl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobilePrimaryLinks.map((link) => {
          const isActive =
            currentPath === link.href ||
            (link.href !== "/" && !link.href.includes("#") && currentPath.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition ${
                isActive ? "bg-sky-50 text-sky-700" : "text-slate-500 active:bg-slate-100"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-sky-600" : "text-slate-500"}`} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}

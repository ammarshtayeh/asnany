"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  CalendarCheck2,
  Menu,
  Microscope,
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
    icon: Stethoscope,
    color: "text-sky-600",
    active: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    href: "/offers",
    label: "العروض",
    icon: Tags,
    color: "text-amber-600",
    active: "bg-amber-50 text-amber-700 border-amber-100",
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

export default function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [menuOpen, setMenuOpen] = useState(false);

  if (currentPath.startsWith("/admin")) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:bg-sky-600 transition-colors">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl xl:text-2xl font-black tracking-tight text-slate-950 whitespace-nowrap">
            أسناني<span className="text-sky-600">.</span>ps
          </span>
        </Link>

        <div className="hidden md:flex flex-1 min-w-0 justify-center">
          <div className="flex items-center gap-1.5 bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200 max-w-full overflow-x-auto hide-scrollbar">
            {links.map((link) => {
              const isActive =
                currentPath === link.href ||
                (link.href !== "/" && currentPath.startsWith(link.href));
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2.5 rounded-xl border text-sm font-black transition-all whitespace-nowrap ${
                    isActive
                      ? `${link.active} shadow-sm`
                      : "border-transparent text-slate-600 hover:bg-white hover:text-slate-950 hover:border-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "" : link.color}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <Link
            href="/admin/login"
            className="hidden xl:flex items-center gap-2 text-slate-500 hover:text-slate-950 font-black text-sm transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
          >
            <UserCircle2 className="w-5 h-5" />
            دخول الأطباء
          </Link>
          <Link
            href="/booking"
            className="bg-slate-950 hover:bg-sky-600 text-white px-5 py-3 rounded-xl text-sm font-black transition-all shadow-lg shadow-slate-900/10 hover:shadow-sky-500/25"
          >
            احجز الآن
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden mr-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm"
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl" dir="rtl">
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
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
              >
                <UserCircle2 className="h-4 w-4" />
                دخول الأطباء
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

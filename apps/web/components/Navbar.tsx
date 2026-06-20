"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CalendarCheck2,
  ChevronDown,
  Home,
  Layers,
  Menu,
  Search,
  Sparkles,
  Stethoscope,
  Tags,
  UserCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import { SITE_NAV_MOBILE_BOTTOM, SITE_NAV_MORE_SECTIONS, SITE_NAV_PRIMARY } from "@pal-dental/shared";
import { MalamihLogoMark } from "@/components/MalamihLogoMark";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Stethoscope,
  CalendarCheck2,
  Tags,
  Layers,
  Home,
};

export default function Navbar() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 20;
      setScrolled(next);
      document.documentElement.style.setProperty("--navbar-height", next ? "60px" : "72px");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const isPortalRoute =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    currentPath === "/doctor" ||
    currentPath.startsWith("/doctor/");
  if (isPortalRoute) return null;

  const isMoreActive = SITE_NAV_MORE_SECTIONS.some((section) =>
    section.links.some((link) => currentPath === link.href || currentPath.startsWith(`${link.href}/`)),
  );

  const allMobileLinks = [
    ...SITE_NAV_PRIMARY.map((l) => ({ ...l, iconName: l.icon })),
    ...SITE_NAV_MORE_SECTIONS.flatMap((s) => s.links.map((l) => ({ ...l, icon: "Search", color: "", active: "" }))),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-2xl border-slate-200/70 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] h-[60px]"
            : "bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-[0_2px_20px_-3px_rgba(15,23,42,0.02)] h-[72px]"
        }`}
      >
        <div
          className={`max-w-[1600px] mx-auto px-3 lg:px-6 flex items-center gap-2 transition-all duration-300 ${scrolled ? "h-[60px]" : "h-[72px]"}`}
        >
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <MalamihLogoMark size={50} className="group-hover:scale-105 transition-all duration-300" priority />
            <div className="flex items-center select-none">
              <span className="malamih-logo-text">ملامح</span>
              <span className="malamih-logo-dot">.ps</span>
            </div>
          </Link>

          <div className="hidden lg:flex flex-1 min-w-0 justify-center">
            <div className="flex items-center gap-0.5 bg-slate-50/70 p-1 rounded-full border border-slate-200/50">
              {SITE_NAV_PRIMARY.map((link) => {
                const isActive =
                  currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href));
                const Icon = ICON_MAP[link.icon] || Sparkles;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-black transition-all duration-300 whitespace-nowrap ${
                      link.highlight && !isActive
                        ? "border-violet-200 bg-violet-50/80 text-violet-700 hover:bg-violet-100"
                        : isActive
                          ? `${link.active} shadow-sm scale-[1.02]`
                          : "border-transparent text-slate-500 hover:bg-white hover:text-slate-900 hover:border-slate-200/70 hover:shadow-sm"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive || link.highlight ? "" : link.color}`} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border text-xs font-black transition-all whitespace-nowrap ${
                    isMoreActive || moreOpen
                      ? "bg-slate-100 text-slate-900 border-slate-200 shadow-sm"
                      : "border-transparent text-slate-500 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  المزيد
                  <ChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? "rotate-180" : ""}`} />
                </button>

                {moreOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-2 w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {SITE_NAV_MORE_SECTIONS.map((section) => (
                        <div key={section.id}>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">{section.title}</p>
                          <div className="space-y-1">
                            {section.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMoreOpen(false)}
                                className="block rounded-xl px-3 py-2.5 hover:bg-slate-50 transition"
                              >
                                <p className="text-sm font-black text-slate-900">{link.label}</p>
                                {link.description ? (
                                  <p className="text-[11px] font-semibold text-slate-500">{link.description}</p>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
            <Link
              href="/doctor/login"
              className="hidden xl:flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs transition-all px-3.5 py-2 rounded-full border border-slate-200/60 hover:bg-slate-50"
            >
              <UserCircle2 className="w-4 h-4 text-slate-400" />
              <span>دخول الطبيب</span>
            </Link>
            <Link href="/booking" className="btn-malama px-5 py-2.5 text-xs">
              احجز الآن
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:hidden mr-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl max-h-[70vh] overflow-y-auto" dir="rtl">
            <div className="mx-auto max-w-[1400px] px-4 py-4 space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-black text-slate-400">التصفح الرئيسي</p>
                <div className="grid grid-cols-2 gap-2">
                  {SITE_NAV_PRIMARY.map((link) => {
                    const Icon = ICON_MAP[link.icon] || Sparkles;
                    const isActive = currentPath === link.href || currentPath.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-black ${
                          isActive ? link.active : "border-slate-100 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${link.color}`} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {SITE_NAV_MORE_SECTIONS.map((section) => (
                <div key={section.id}>
                  <p className="mb-2 text-[10px] font-black text-slate-400">{section.title}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-700"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/booking"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-black text-white"
                >
                  احجز الآن
                </Link>
                <Link
                  href="/doctor/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                >
                  <UserCircle2 className="h-4 w-4" />
                  دخول الطبيب
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:hidden"
        dir="rtl"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {SITE_NAV_MOBILE_BOTTOM.map((link) => {
            const isActive =
              currentPath === link.href ||
              (link.href !== "/" && !link.href.includes("#") && currentPath.startsWith(link.href));
            const Icon = ICON_MAP[link.icon] || Home;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-black transition ${
                  isActive ? "nav-active-mobile" : "text-slate-500 active:bg-slate-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : link.href === "/subscriptions" ? "text-violet-600" : "text-slate-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

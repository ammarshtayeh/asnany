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
      const next = window.scrollY > 16;
      setScrolled(next);
      document.documentElement.style.setProperty("--navbar-height", next ? "64px" : "76px");
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

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [currentPath]);

  const isPortalRoute =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    currentPath === "/doctor" ||
    currentPath.startsWith("/doctor/");
  if (isPortalRoute) return null;

  const isMoreActive = SITE_NAV_MORE_SECTIONS.some((section) =>
    section.links.some((link) => currentPath === link.href || currentPath.startsWith(`${link.href}/`)),
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500 ease-spring sm:px-4 lg:px-6 ${
          scrolled ? "pt-2" : "pt-3"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-[1600px] items-center gap-2 border transition-all duration-500 ease-spring ${
            scrolled
              ? "nav-island h-[56px] px-3 shadow-float sm:px-4"
              : "h-[64px] rounded-3xl border-transparent bg-transparent px-1 sm:h-[68px]"
          }`}
        >
          <Link href="/" className="group flex flex-shrink-0 items-center gap-2.5">
            <MalamihLogoMark size={scrolled ? 48 : 54} className="transition-transform duration-300 group-hover:scale-105" priority />
            <div className="hidden select-none items-center sm:flex">
              <span className="malamih-logo-text text-xl">ملامح</span>
              <span className="malamih-logo-dot text-xl">.ps</span>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-2xl border border-[#e5e0d8] bg-white p-1 shadow-sm">
              {SITE_NAV_PRIMARY.map((link) => {
                const isActive =
                  currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href));
                const Icon = ICON_MAP[link.icon] || Sparkles;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-black transition-all duration-300 ease-spring ${
                      isActive
                        ? `${link.active} shadow-sm`
                        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "" : link.color}`} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-black transition-all duration-300 ${
                    isMoreActive || moreOpen
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  المزيد
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${moreOpen ? "rotate-180" : ""}`} />
                </button>

                {moreOpen ? (
                  <div
                    className="absolute left-0 top-full z-50 mt-2 w-[min(540px,calc(100vw-1.5rem))] max-h-[min(70vh,560px)] overflow-y-auto rounded-3xl border border-[#e5e0d8] bg-white p-5 shadow-[0_24px_48px_-16px_rgba(10,22,40,0.28)]"
                    dir="rtl"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      {SITE_NAV_MORE_SECTIONS.map((section) => (
                        <div key={section.id}>
                          <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#295f59]/70">{section.title}</p>
                          <div className="space-y-1">
                            {section.links.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMoreOpen(false)}
                                className="block rounded-2xl px-3 py-2.5 transition-colors hover:bg-[#e8f0ef]"
                              >
                                <p className="text-sm font-black text-slate-900">{link.label}</p>
                                {link.description ? (
                                  <p className="text-[11px] font-semibold leading-5 text-slate-500">{link.description}</p>
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

          <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
            <Link
              href="/doctor/login"
              className="hidden items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 xl:flex"
            >
              <UserCircle2 className="h-4 w-4 text-slate-400" />
              دخول الطبيب
            </Link>
            <Link href="/join" className="hidden items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-800 transition hover:border-primary/30 hover:text-primary lg:inline-flex">
              انضم كطبيب
            </Link>
            <Link href="/doctors/search" className="btn-malama gap-1.5 px-5 py-2.5 text-xs">
              <Search className="h-3.5 w-3.5" />
              ابحث عن طبيب
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="mr-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm transition active:scale-95 lg:hidden"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen ? (
          <div className="mx-auto mt-2 max-h-[min(78vh,640px)] max-w-[1600px] overflow-y-auto rounded-3xl border border-[#e5e0d8] bg-white p-4 shadow-[0_24px_48px_-16px_rgba(10,22,40,0.28)] lg:hidden" dir="rtl">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#295f59]/70">التصفح الرئيسي</p>
                <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-2">
                  {SITE_NAV_PRIMARY.map((link) => {
                    const Icon = ICON_MAP[link.icon] || Sparkles;
                    const isActive = currentPath === link.href || currentPath.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex min-h-12 items-center gap-2 rounded-2xl border p-3 text-sm font-black transition ${
                          isActive ? link.active : "border-slate-100 bg-[#f7f5f0] text-slate-700"
                        }`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${link.color}`} />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {SITE_NAV_MORE_SECTIONS.map((section) => (
                <div key={section.id}>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#295f59]/70">{section.title}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {section.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-2xl border border-slate-100 bg-[#f7f5f0] p-3 text-sm font-black text-slate-700"
                      >
                        <span className="block">{link.label}</span>
                        {link.description ? (
                          <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">{link.description}</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                <Link href="/booking" onClick={() => setMenuOpen(false)} className="btn-malama justify-center py-3 text-sm">
                  احجز الآن
                </Link>
                <Link
                  href="/doctor/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-malama-outline justify-center py-3 text-sm"
                >
                  دخول الطبيب
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <nav
        className="fixed bottom-3 left-3 right-3 z-50 lg:hidden"
        dir="rtl"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 gap-0.5 rounded-2xl border border-[#e5e0d8] bg-white p-1.5 shadow-float">
          {SITE_NAV_MOBILE_BOTTOM.map((link) => {
            const isActive =
              currentPath === link.href ||
              (link.href !== "/" && !link.href.includes("#") && currentPath.startsWith(link.href));
            const Icon = ICON_MAP[link.icon] || Home;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                  isActive ? "nav-active-mobile shadow-sm" : "text-slate-500 active:bg-slate-100/80"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-slate-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

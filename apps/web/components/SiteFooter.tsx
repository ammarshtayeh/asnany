"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, Sparkles } from "lucide-react";
import { SITE_NAV_MORE_SECTIONS, SITE_NAV_PRIMARY } from "@pal-dental/shared";
import { SITE_SUPPORT_EMAIL, SITE_SUPPORT_WHATSAPP, SITE_SUPPORT_PHONE_DISPLAY } from "@/lib/site-contact";
import { MalamihLogoMark } from "@/components/MalamihLogoMark";

const ownerPhone = SITE_SUPPORT_WHATSAPP;
const ownerEmail = SITE_SUPPORT_EMAIL;

export default function SiteFooter() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const isPortalRoute =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    currentPath === "/doctor" ||
    currentPath.startsWith("/doctor/");
  if (isPortalRoute) return null;

  return (
    <footer className="relative z-30 mt-16 overflow-hidden border-t border-white/10 bg-[#0a1628] px-4 py-16 lg:px-8" dir="rtl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#295f59]" />
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#295f59]/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="text-right lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <MalamihLogoMark size={56} className="bg-[#f7f5f0] p-0.5 shadow-md" />
              <h2 className="font-display text-2xl font-bold tracking-[0.18em] text-white">
                MALAMIH
              </h2>
            </div>
            <p className="text-sm font-semibold leading-7 text-slate-400">
              دليل فلسطين لصحة وجمال الوجه — أطباء موثّقون، حجز، عروض، وباقات للعيادات.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm font-bold">
              <a href={`mailto:${ownerEmail}`} className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-[#d4af37]">
                <Mail className="h-4 w-4 text-[#d4af37]" />
                {ownerEmail}
              </a>
              <a
                href={`https://wa.me/${ownerPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-[#3d7a73]"
              >
                <Phone className="h-4 w-4 text-[#3d7a73]" />
                {SITE_SUPPORT_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="text-right">
            <p className="mb-4 flex items-center justify-end gap-1.5 text-xs font-black text-[#d4af37]">
              <Sparkles className="h-3.5 w-3.5" />
              التصفح الرئيسي
            </p>
            <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-300">
              {SITE_NAV_PRIMARY.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {SITE_NAV_MORE_SECTIONS.slice(0, 2).map((section) => (
            <div key={section.id} className="text-right">
              <p className="mb-4 text-xs font-black text-[#d4af37]">{section.title}</p>
              <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-300">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <p className="text-xs font-bold text-slate-500">© {new Date().getFullYear()} ملامح.ps — جميع الحقوق محفوظة</p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
            <Link href="/privacy" className="transition hover:text-slate-300">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="transition hover:text-slate-300">
              الشروط
            </Link>
            <Link href="/about" className="transition hover:text-slate-300">
              من نحن
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

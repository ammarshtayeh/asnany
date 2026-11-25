"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { SITE_NAV_MORE_SECTIONS, SITE_NAV_PRIMARY } from "@pal-dental/shared";
import { SITE_SUPPORT_EMAIL, SITE_SUPPORT_WHATSAPP, SITE_SUPPORT_PHONE_DISPLAY } from "@/lib/site-contact";
import { MalamihLogoMark } from "@/components/MalamihLogoMark";
import { useVisibleNavLinks } from "@/lib/nav-visibility";

const ownerPhone = SITE_SUPPORT_WHATSAPP;
const ownerEmail = SITE_SUPPORT_EMAIL;

export default function SiteFooter() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const primaryLinks = useVisibleNavLinks(SITE_NAV_PRIMARY);
  const isPortalRoute =
    currentPath === "/admin" ||
    currentPath.startsWith("/admin/") ||
    currentPath === "/doctor" ||
    currentPath.startsWith("/doctor/");
  if (isPortalRoute) return null;

  return (
    <footer className="relative z-30 mt-16 border-t border-[#dfe8e5] bg-white px-4 py-14 lg:px-8" dir="rtl">
      <div className="relative mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="text-right lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <MalamihLogoMark size={140} className="h-14 w-14 shrink-0" />
              <span className="whitespace-nowrap font-brand text-xl font-bold tracking-[0.22em] text-[#295f59]">MALAMIH</span>
            </div>
            <p className="text-sm font-semibold leading-7 text-slate-500">
              دليل فلسطين لصحة وجمال الوجه — أطباء، حجز، عروض، وباقات للعيادات.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm font-bold">
              <a href={`mailto:${ownerEmail}`} className="inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-primary">
                <Mail className="h-4 w-4 text-primary" />
                {ownerEmail}
              </a>
              <a
                href={`https://wa.me/${ownerPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" />
                {SITE_SUPPORT_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div className="text-right">
            <p className="mb-4 text-xs font-extrabold text-primary">التصفح الرئيسي</p>
            <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-600">
              {primaryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {SITE_NAV_MORE_SECTIONS.slice(0, 2).map((section) => (
            <div key={section.id} className="text-right">
              <p className="mb-4 text-xs font-extrabold text-primary">{section.title}</p>
              <div className="flex flex-col gap-2.5 text-sm font-bold text-slate-600">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e8e4dc] pt-8">
          <p className="text-xs font-bold text-slate-400">© {new Date().getFullYear()} ملامح.ps — جميع الحقوق محفوظة</p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
            <Link href="/privacy" className="transition hover:text-primary">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="transition hover:text-primary">
              الشروط
            </Link>
            <Link href="/about" className="transition hover:text-primary">
              من نحن
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

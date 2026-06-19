"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { SITE_NAV_MORE_SECTIONS, SITE_NAV_PRIMARY } from "@pal-dental/shared";

const ownerPhone = "9720595537190";
const ownerEmail = "ammar.shtayeh@gmail.com";

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
    <footer className="border-t border-slate-800 bg-[#0a1628] px-4 py-16 lg:px-8 relative z-30" dir="rtl">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-right lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="malamih-logo-mark text-lg">م</span>
              <h2 className="text-2xl font-black text-white">
                ملامح<span className="text-[#d4af37]">.ps</span>
              </h2>
            </div>
            <p className="text-sm font-medium leading-7 text-slate-400">
              دليل فلسطين لصحة وجمال الوجه — أطباء، حجز، عروض، وباقات للعيادات.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold text-slate-400">
              <a href={`mailto:${ownerEmail}`} className="inline-flex items-center gap-2 hover:text-[#d4af37] transition-colors">
                <Mail className="h-4 w-4 text-[#d4af37]" />
                {ownerEmail}
              </a>
              <a href={`https://wa.me/${ownerPhone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <Phone className="h-4 w-4 text-emerald-400" />
                {ownerPhone}
              </a>
            </div>
          </div>

          <div className="text-right">
            <p className="mb-3 text-xs font-black text-[#d4af37]">التصفح الرئيسي</p>
            <div className="flex flex-col gap-2 text-sm font-bold text-slate-300">
              {SITE_NAV_PRIMARY.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {SITE_NAV_MORE_SECTIONS.slice(0, 2).map((section) => (
            <div key={section.id} className="text-right">
              <p className="mb-3 text-xs font-black text-[#d4af37]">{section.title}</p>
              <div className="flex flex-col gap-2 text-sm font-bold text-slate-300">
                {section.links.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-xs font-bold text-slate-500">
          <Link href="/privacy" className="hover:text-slate-300">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-slate-300">الشروط</Link>
          <Link href="/about" className="hover:text-slate-300">من نحن</Link>
        </div>
      </div>
    </footer>
  );
}

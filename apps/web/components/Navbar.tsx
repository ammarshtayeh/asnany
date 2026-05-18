"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Tags, ShoppingBag, BookOpen, UserCircle2, Store } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  
  // Hide navbar in admin routes
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { href: "/", label: "الرئيسية", icon: Stethoscope },
    { href: "/offers", label: "العروض الحصرية", icon: Tags },
    { href: "/marketplace", label: "سوق أسناني", icon: Store },
    { href: "/blog", label: "المدونة الطبية", icon: BookOpen },
    { href: "/stores", label: "دليل الموردين", icon: ShoppingBag },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-white shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">أسناني<span className="text-primary">.</span>ps</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                  ? "bg-white text-primary shadow-sm shadow-slate-200 border border-slate-200/50" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/admin/login" className="hidden lg:flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors px-3">
            <UserCircle2 className="w-5 h-5" />
            دخول الأطباء
          </Link>
          <a href="#booking" className="bg-slate-900 hover:bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-md shadow-slate-900/10 hover:shadow-primary/30">
            احجز الآن
          </a>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Visible only on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe z-50">
        <div className="flex justify-around p-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl min-w-[70px] ${
                  isActive ? "text-primary" : "text-slate-500"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-primary/10" : "bg-transparent"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

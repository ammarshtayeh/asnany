import { Users, Calendar as CalendarIcon, Megaphone, Store, Star, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/api/auth/logout" method="POST">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
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

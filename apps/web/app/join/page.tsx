"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles, CheckCircle2, ShieldAlert, Info } from "lucide-react";

export default function JoinAsDoctor() {
  const adminWhatsapp = "970599123456"; // Standard Palestine Admin Contact

  return (
    <main className="bg-slate-50 min-h-screen relative font-sans" dir="rtl">
      {/* Premium Header */}
      <div className="h-[280px] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900 to-secondary/80" />
        <div className="absolute top-8 right-8 z-50">
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="relative z-10 px-4">
          <span className="bg-white/10 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> بوابة الأطباء الشركاء
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            انضم كطبيب شريك في منصة أسناني
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            انضم لأكبر شبكة لأطباء الأسنان في فلسطين واجعل عيادتك تظهر لآلاف المرضى شهرياً.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 pb-24 relative z-10">

        {/* Info Box */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 mb-8 flex gap-3 text-sky-800 text-sm font-bold shadow-sm">
          <Info className="w-5 h-5 flex-shrink-0 text-sky-500 mt-0.5" />
          <div>
            <span className="block text-sky-900 font-black mb-1">كيف يتم التسجيل؟</span>
            <span>
              يتم تسجيل العيادات والأطباء الجدد من خلال فريق أسناني.ps مباشرةً. تواصل معنا عبر الواتساب وسنتولى إعداد ملفك الكامل وتفعيل حسابك في أسرع وقت.
            </span>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 hover:border-emerald-500/20 transition-all flex flex-col justify-between hover:scale-[1.01] duration-300">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">💬 تواصل مباشر عبر واتساب</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              تحدث مباشرة مع مسؤول البوابة والإدارة عبر الواتساب، وسنقوم بإنشاء وتفعيل حساب عيادتك وإحداثياتها الجغرافية فوراً بدون أي تعقيد.
            </p>
            <ul className="space-y-2.5 pt-2 text-slate-600 text-sm font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> محادثة فورية مباشرة مع الدعم الفني
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> مساعدتك في تجهيز الصور والملفات
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> تحديد دقيق للموقع الجغرافي بالـ GPS
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> إجابة أي استفسارات تخص التسويق
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <a
              href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent("مرحباً أسناني، أنا طبيب أسنان وأرغب في الانضمام وإعلان عيادتي على منصتكم الموقرة.")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex justify-center items-center gap-2 hover:scale-[1.02]"
            >
              <MessageSquare className="w-5 h-5 fill-current" /> تواصل مع الإدارة عبر الواتساب الآن
            </a>
          </div>
        </div>

        {/* Note block */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mt-8 flex gap-3 text-amber-800 text-sm font-bold">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="block text-amber-900">ملاحظة هامة للأطباء:</span>
            <span>بمجرد استلام طلبك، نقوم بمراجعة رخصة مزاولة المهنة والمستندات قبل تفعيل عيادتك على البوابة العامة للحفاظ على موثوقية المنصة أمام الجمهور.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

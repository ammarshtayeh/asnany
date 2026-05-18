"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquare, BadgePercent, CheckCircle, Eye, Share2 } from "lucide-react";

export default function AdvertiseWithUs() {
  const adminWhatsapp = "970599123456";

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
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> النمو التسويقي للعيادات والمراكز
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            أعلن معنا وضاعف زوار عيادتك
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            أسناني.ps هو دليلك الأذكى للوصول لأكبر تجمع من الباحثين عن علاجات وصحة الأسنان في فلسطين.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 space-y-12">
          
          {/* Stats section */}
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
              <Eye className="w-8 h-8 text-primary mx-auto" />
              <div className="text-2xl font-black text-slate-900">+50,000</div>
              <div className="text-xs text-slate-400 font-bold">مشاهدة شهرية مستهدفة</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
              <BadgePercent className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-2xl font-black text-emerald-600">92%</div>
              <div className="text-xs text-slate-400 font-bold">معدل تحويل وتواصل للمرضى</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
              <Share2 className="w-8 h-8 text-indigo-600 mx-auto" />
              <div className="text-2xl font-black text-slate-900">+100</div>
              <div className="text-xs text-slate-400 font-bold">عيادة ومركز أسنان مسجلين</div>
            </div>
          </div>

          {/* Value proposition */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-3">ماذا تقدم لك الإعلانات معنا؟</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-slate-800 text-sm">الباقات المميزة (Featured Listings)</span>
                  <span className="block text-slate-500 text-xs mt-1 leading-relaxed">ظهور عيادتك في الصفحة الرئيسية ومقدمة نتائج البحث لضمان وصول أكبر عدد من المرضى إليك.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-slate-800 text-sm">بنرات إعلانية ذكية (Display Ads)</span>
                  <span className="block text-slate-500 text-xs mt-1 leading-relaxed">تصميم بنرات إعلانية متحركة ومبهرة لعيادتك ونشرها في الواجهة والمقالات الطبية للجمهور.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-slate-800 text-sm">التوجيه الجغرافي بالخرائط (Maps Optimization)</span>
                  <span className="block text-slate-500 text-xs mt-1 leading-relaxed">ربط عيادتك بنظام ملاحة GPS ذكي ومتطور يوجه المريض من مكانه لعيادتك بخطوة واحدة.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-slate-800 text-sm">إحصائيات شهرية حية (Monthly Analytics)</span>
                  <span className="block text-slate-500 text-xs mt-1 leading-relaxed">تقارير دورية ودقيقة تشرح كم مريضاً نقر على موقعك، رقم هاتفك، ورسائل الواتساب الواردة لك.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing or Call to Action */}
          <div className="bg-slate-900 rounded-3xl p-8 text-center text-white space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30" />
            <div className="relative z-10 space-y-3">
              <h3 className="text-xl md:text-2xl font-black">جاهز للبدء وإطلاق إعلان عيادتك؟</h3>
              <p className="text-slate-300 text-xs md:text-sm font-medium max-w-lg mx-auto leading-relaxed">
                تحدث مع مسؤول التسويق والمبيعات لدينا فوراً على الواتساب، وسيقدم لك باقات أسعار مرنة ومميزة مخصصة لموقع وحجم عيادتك.
              </p>

              <div className="pt-4 flex justify-center">
                <a
                  href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent("مرحباً أسناني، أرغب بالاستفسار عن أسعار وباقات الإعلان للعيادات والمراكز لديكم.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm hover:scale-[1.02]"
                >
                  <MessageSquare className="w-5 h-5 fill-current" /> تواصل معنا واستعلم عن الباقات
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

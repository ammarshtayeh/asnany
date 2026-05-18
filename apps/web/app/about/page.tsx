"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Heart, Award, Users } from "lucide-react";

export default function AboutUs() {
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
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> قصة ورؤية أسناني
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            عن منصة أسناني.ps
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            أول دليل رقمي تفاعلي متكامل للرعاية السنية وصحة الفم والأسنان في دولة فلسطين.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 space-y-10">
          
          {/* Mission & Vision Section */}
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">رؤيتنا ورسالتنا الجوهرية</h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
              تأسست منصة <strong>أسناني.ps</strong> لسد الفجوة الرقمية بين المرضى ونخبة أطباء الأسنان في فلسطين. نحن نؤمن بأن الوصول لخدمات رعاية سنية فائقة الجودة يجب أن يكون سهلاً وسريعاً ومبنياً على الثقة والمصداقية والتقييمات الحقيقية.
            </p>
          </div>

          {/* Pillars grid */}
          <div className="grid sm:grid-cols-3 gap-6 pt-6">
            <div className="p-6 rounded-2xl bg-slate-50 text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 text-base">دقة وموثوقية</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                جميع بيانات العيادات والأطباء يتم التحقق منها ومراجعتها بدقة من قبل الإدارة قبل تفعيلها.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto border border-emerald-100">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 text-base">سهولة تامة للمريض</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                واجهة مستخدم ذكية تدعم الجيل الأحدث من الخرائط والتوجيه الجغرافي للوصول الفوري للعيادة.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 text-center space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto border border-indigo-100">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 text-base">إعلام ذكي وحيوي</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                مجلة طبية سنية متكاملة وسوق عروض وحجوزات مميزة وموثوقة لرفع الوعي الصحي السني.
              </p>
            </div>
          </div>

          {/* Team and Palestine support */}
          <div className="border-t border-slate-100 pt-8 space-y-6">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              <h3 className="text-xl font-black text-slate-800">نهدف لخدمة وتطوير قطاع الأسنان الفلسطيني</h3>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              تضم المنصة أطباء أسنان من مختلف التخصصات: جراحة الفم والأسنان، زراعة وتقويم الأسنان، طب أسنان الأطفال، وتجميل الأسنان (هوليوود سمايل). نحن نغطي كافة المحافظات الفلسطينية (رام الله، نابلس، الخليل، جنين، بيت لحم، غزة، طولكرم، قلقيلية، أريحا) لضمان حصول كل مواطن على حقه في رعاية طبية مميزة وبكل سهولة.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

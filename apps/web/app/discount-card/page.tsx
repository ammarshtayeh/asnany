"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Sparkles, Star, MapPin, CalendarCheck } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  city?: string | null;
  area?: string | null;
  accepts_discount_card?: boolean | null;
  discount_value?: string | null;
  discount_note?: string | null;
};

export default function DiscountCardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : Array.isArray(data?.doctors) ? data.doctors : []);
      setLoading(false);
    })();
  }, []);

  const participating = useMemo(
    () => doctors.filter((doctor) => doctor.accepts_discount_card || doctor.discount_value || doctor.discount_note),
    [doctors],
  );

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Section */}
      <section className="bg-slate-950 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/40 via-slate-950 to-indigo-900/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
            >
              <ArrowRight className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-4 py-2 text-sm font-black text-amber-300 mb-6">
            <CreditCard className="w-4 h-4" />
            بطاقة خصومات ملامح
          </span>

          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            بطاقة عضوية حصرية
            <br />
            <span className="text-amber-400">لخصومات طبية وتجميلية موثوقة</span>
          </h1>
          <p className="max-w-2xl text-slate-300 text-lg leading-8 font-medium mb-10">
            اعرض البطاقة في أي عيادة مشاركة واستفد من خصومات خاصة مباشرة. كل شيء واضح ومترابط داخل المنصة.
          </p>

          {/* Virtual Card */}
          <div className="w-full max-w-sm bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-black text-slate-400 tracking-widest uppercase">Malamih</span>
              <CreditCard className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white tracking-widest mb-1">MLM-DC-2026</p>
            <p className="text-xs text-slate-400 font-bold mb-6">بطاقة الخصم الحصرية • Discount Card</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">منصة ملامح.ps</span>
              <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> فعّال
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works + Benefits */}
      <section className="max-w-5xl mx-auto px-4 -mt-14 pb-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {/* How it works */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-black text-slate-950 mb-4">⚙️ كيف تعمل البطاقة؟</h2>
            <ol className="space-y-3 text-sm font-semibold text-slate-600">
              {[
                "اعرض هذه الصفحة أو التطبيق في العيادة المشاركة.",
                "الطبيب يفعّل الخصم من لوحته الخاصة في المنصة.",
                "الخصم يظهر في صفحة الطبيب وفي هذه الصفحة بشكل واضح.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-black text-slate-950 mb-4">✨ مزايا البطاقة</h2>
            <div className="space-y-3">
              {[
                "خصومات على الخدمات داخل العيادات المشتركة",
                "عرض موحد وواضح لجميع الأطباء المشتركين",
                "تجربة حجز مرتبطة مباشرة بملف الطبيب",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-3 text-sm font-semibold text-slate-700">
                  <Star className="w-4 h-4 text-amber-500 fill-current flex-shrink-0 mt-0.5" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Participating Doctors */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-950">الأطباء المشاركون</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {loading ? "جارٍ التحميل..." : `${participating.length} طبيب مشارك`}
              </p>
            </div>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-sm font-black transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              احجز الآن
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : participating.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">
                لا توجد عيادات مفعّلة حالياً، لكن البطاقة جاهزة للتفعيل من لوحة الطبيب.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {participating.map((doctor) => (
                <article
                  key={doctor.id}
                  className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:shadow-sm transition-all"
                >
                  <h3 className="text-lg font-black text-slate-950">{doctor.name}</h3>
                  {(doctor.city || doctor.area) && (
                    <p className="mt-1 text-sm font-semibold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {doctor.city || ""}
                      {doctor.area ? ` • ${doctor.area}` : ""}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2 inline-block">
                    🎁 {doctor.discount_value || "خصم خاص"}
                    {doctor.discount_note ? ` — ${doctor.discount_note}` : ""}
                  </p>
                  <div className="mt-3">
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="text-xs font-black text-slate-700 hover:text-amber-600 underline underline-offset-2 transition-colors"
                    >
                      عرض ملف الطبيب ←
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

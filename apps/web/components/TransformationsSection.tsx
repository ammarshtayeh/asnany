"use client";

import { useRef, useState } from "react";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { Sparkles, Star, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const TRANSFORMATIONS = [
  {
    id: "teeth-whitening",
    title: "تبييض الأسنان",
    specialty: "أسنان",
    clinic: "عيادات ملامح للأسنان",
    city: "رام الله",
    rating: 4.9,
    reviews: 124,
    desc: "نتيجة جلسة واحدة لتبييض الأسنان بتقنية ZOOM",
    before: "/transformations/teeth-before.jpg",
    after: "/transformations/teeth-after.jpg",
    gradient: "from-amber-500/20 to-yellow-500/5",
    tag: "💎 نتيجة مضمونة",
  },
  {
    id: "skin-laser",
    title: "ليزر البشرة",
    specialty: "جلدية",
    clinic: "مركز ملامح للجلدية",
    city: "نابلس",
    rating: 4.8,
    reviews: 89,
    desc: "إزالة التصبغات وتوحيد لون البشرة بتقنية Nd:YAG",
    before: "/transformations/skin-before.jpg",
    after: "/transformations/skin-after.jpg",
    gradient: "from-violet-500/20 to-pink-500/5",
    tag: "✨ بلا ألم",
  },
  {
    id: "filler",
    title: "فيلر الشفاه",
    specialty: "تجميل",
    clinic: "عيادة ملامح للتجميل",
    city: "الخليل",
    rating: 5.0,
    reviews: 67,
    desc: "فيلر هيالورونيك لشفاه أكثر امتلاءً وتناسقاً",
    before: "/transformations/filler-before.jpg",
    after: "/transformations/filler-after.jpg",
    gradient: "from-rose-500/20 to-pink-500/5",
    tag: "⚡ نتيجة فورية",
  },
];

// Placeholder images (data URIs with gradients for demo)
const PLACEHOLDER_BEFORE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23334155'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%2394a3b8' font-size='20' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3Eقبل%3C/text%3E%3C/svg%3E`;
const PLACEHOLDER_AFTER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23065f46'/%3E%3Cstop offset='100%25' stop-color='%23047857'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%2386efac' font-size='20' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3Eبعد%3C/text%3E%3C/svg%3E`;

export default function TransformationsSection() {
  const [active, setActive] = useState(0);
  const item = TRANSFORMATIONS[active];

  return (
    <section className="my-16" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col items-start gap-3 mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-black text-amber-700">
          <Sparkles className="h-3.5 w-3.5" />
          نتائج حقيقية من مرضانا
        </span>
        <div className="flex items-end justify-between w-full">
          <div>
            <h2 className="text-3xl font-black text-slate-950 leading-tight">
              تحولات مذهلة
            </h2>
            <p className="mt-2 text-base font-semibold text-slate-500">
              اسحب لرؤية الفرق — نتائج حقيقية من عيادات ملامح
            </p>
          </div>
          {/* Navigation dots */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive((a) => (a - 1 + TRANSFORMATIONS.length) % TRANSFORMATIONS.length)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-amber-400 hover:text-amber-600 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % TRANSFORMATIONS.length)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-amber-400 hover:text-amber-600 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Slider */}
        <div className={`relative rounded-3xl bg-gradient-to-br ${item.gradient} border border-slate-200/60 p-1.5 shadow-[0_20px_60px_-12px_rgba(15,23,42,0.08)]`}>
          <BeforeAfterSlider
            beforeSrc={PLACEHOLDER_BEFORE}
            afterSrc={PLACEHOLDER_AFTER}
            beforeLabel="قبل"
            afterLabel="بعد"
            altBefore={`قبل - ${item.title}`}
            altAfter={`بعد - ${item.title}`}
            className="h-[360px] sm:h-[460px] rounded-2xl"
          />
          {/* Overlay tag */}
          <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-black text-white backdrop-blur-md border border-white/10">
            <ZoomIn className="h-4 w-4 text-amber-400" />
            اسحب للمقارنة
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4">
          {/* Active item info */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {item.specialty}
            </span>
            <h3 className="mt-3 text-xl font-black text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500 leading-6">{item.desc}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.floor(item.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-slate-700">{item.rating}</span>
              <span className="text-xs text-slate-400">({item.reviews} تقييم)</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 border border-emerald-100">
                {item.tag}
              </span>
              <span>{item.clinic} · {item.city}</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid gap-3">
            {TRANSFORMATIONS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-right transition-all duration-200 ${
                  i === active
                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-500/10"
                    : "border-slate-200/60 bg-white hover:border-amber-300 hover:bg-amber-50/50"
                }`}
              >
                <div
                  className={`h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${t.gradient} border border-slate-200/40 flex items-center justify-center text-lg`}
                >
                  {t.specialty === "أسنان" ? "🦷" : t.specialty === "جلدية" ? "🧴" : "💫"}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-950">{t.title}</p>
                  <p className="text-xs text-slate-500 font-semibold">{t.city}</p>
                </div>
                {i === active && (
                  <span className="mr-auto flex h-2 w-2 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-slate-950 p-5 text-center">
            <p className="text-sm font-black text-white">هل أنت طبيب؟</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">أضف نتائج عملياتك واستقطب مرضى جدد</p>
            <a
              href="/join"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              سجّل عيادتك
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

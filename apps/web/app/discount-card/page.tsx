"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, CheckCircle2, CreditCard, MapPin, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import type { DiscountCardPlan } from "@/lib/discount-card-plans";

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
  const [plans, setPlans] = useState<DiscountCardPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [doctorsRes, plansRes] = await Promise.all([fetch("/api/doctors"), fetch("/api/discount-card/plans")]);
      const doctorsData = await doctorsRes.json();
      const plansData = await plansRes.json();
      setDoctors(Array.isArray(doctorsData) ? doctorsData : Array.isArray(doctorsData?.doctors) ? doctorsData.doctors : []);
      setPlans(Array.isArray(plansData?.plans) ? plansData.plans : []);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  const participating = useMemo(
    () => doctors.filter((doctor) => doctor.accepts_discount_card || doctor.discount_value || doctor.discount_note),
    [doctors],
  );

  const featuredPlan = plans.find((plan) => plan.is_featured) || plans[0];

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      <section className="bg-slate-950 px-4 pt-8 text-white">
        <div className="mx-auto grid min-h-[620px] max-w-6xl gap-10 pb-16 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/15">
              <ArrowRight className="h-4 w-4" />
              الرئيسية
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm font-black text-amber-200">
              <CreditCard className="h-4 w-4" />
              بطاقة خصومات أسناني
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              اشترك مرة، واستخدم خصوماتك عند عيادات ومراكز مشاركة.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-300 md:text-lg">
              البطاقة الرقمية تعرض رقم العضوية وحالة الاشتراك. اختر الباقة، فعّلها، واعرضها للشريك ليتم تطبيق الخصم حسب شروط الباقة والعيادة.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-amber-400 px-6 text-sm font-black text-slate-950 hover:bg-amber-300">
                <Sparkles className="h-4 w-4" />
                اختر الباقة
              </a>
              <a href="#partners" className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 text-sm font-black text-white hover:bg-white/15">
                <MapPin className="h-4 w-4" />
                العيادات المشاركة
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Asnany Plus</span>
                <QrCode className="h-8 w-8 text-amber-300" />
              </div>
              <p className="mt-10 text-2xl font-black tracking-widest">ASN-PLUS-2026</p>
              <p className="mt-1 text-xs font-bold text-slate-400">بطاقة رقمية قابلة للتحقق</p>
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">الحالة</p>
                  <p className="mt-1 text-sm font-black text-emerald-300">فعالة بعد الاشتراك</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                  Verified
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-lg text-slate-950">{plans.length || 3}</p>
                باقات
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-lg text-slate-950">{participating.length}</p>
                شريك
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-lg text-slate-950">{featuredPlan?.duration_months || 12}</p>
                شهر
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black text-sky-600">الباقات والأسعار</p>
            <h2 className="text-3xl font-black text-slate-950">اختر الباقة المناسبة</h2>
          </div>
          <p className="max-w-xl text-sm font-bold leading-7 text-slate-500">
            الأسعار والمزايا هنا تُدار من لوحة الأدمن، وتنعكس تلقائياً على الموقع والتطبيق.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-3xl bg-white" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className={`relative rounded-3xl border bg-white p-5 shadow-sm ${plan.is_featured ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"}`}>
                {plan.badge ? (
                  <span className="absolute left-5 top-5 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{plan.badge}</span>
                ) : null}
                <h3 className="max-w-[70%] text-xl font-black text-slate-950">{plan.name}</h3>
                <p className="mt-2 min-h-12 text-sm font-bold leading-6 text-slate-500">{plan.subtitle}</p>
                <p className="mt-5 text-4xl font-black text-slate-950">
                  {plan.price}
                  <span className="mr-1 text-lg text-slate-500">{plan.currency}</span>
                </p>
                <p className="mt-1 text-xs font-black text-slate-400">صالحة {plan.duration_months} شهر</p>
                <ul className="mt-5 space-y-3">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm font-bold leading-6 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <a
                  href={`https://wa.me/970599123456?text=${encodeURIComponent(`أرغب بتفعيل ${plan.name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-6 flex min-h-12 items-center justify-center rounded-2xl text-sm font-black ${plan.is_featured ? "bg-amber-400 text-slate-950 hover:bg-amber-300" : "bg-slate-950 text-white hover:bg-slate-800"}`}
                >
                  فعّل هذه الباقة
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-12 md:grid-cols-3">
        {[
          { icon: CreditCard, title: "1. اختر الباقة", text: "اختيار واضح حسب المدة والسعر والمزايا." },
          { icon: ShieldCheck, title: "2. فعّل البطاقة", text: "تصلك بطاقة رقمية برقم عضوية وحالة اشتراك." },
          { icon: BadgeCheck, title: "3. اعرضها للشريك", text: "العيادة تتحقق من البطاقة وتطبق الخصم المناسب." },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5">
            <item.icon className="h-7 w-7 text-sky-600" />
            <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">{item.text}</p>
          </div>
        ))}
      </section>

      <section id="partners" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">العيادات المشاركة</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{participating.length} شريك يوضح خصم البطاقة داخل المنصة</p>
            </div>
            <Link href="/booking" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white">
              <CalendarCheck className="h-4 w-4" />
              احجز الآن
            </Link>
          </div>

          {participating.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              لا توجد عيادات مفعّلة حالياً. الباقات جاهزة، ويتم عرض الشركاء هنا فور تفعيلهم من لوحة الطبيب أو الأدمن.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {participating.map((doctor) => (
                <article key={doctor.id} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-lg font-black text-slate-950">{doctor.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {[doctor.city, doctor.area].filter(Boolean).join(" - ") || "غير محدد"}
                  </p>
                  <p className="mt-3 inline-block rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
                    {doctor.discount_value || "خصم خاص"} {doctor.discount_note ? `- ${doctor.discount_note}` : ""}
                  </p>
                  <div className="mt-3">
                    <Link href={`/doctors/${doctor.id}`} className="text-xs font-black text-sky-700 underline underline-offset-4">
                      عرض ملف الطبيب
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

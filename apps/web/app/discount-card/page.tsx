"use client";

import { useEffect, useMemo, useState } from "react";

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
    <main className="min-h-screen bg-slate-50 px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-sm font-black text-sky-300">بطاقة الخصم</p>
          <h1 className="mt-2 text-3xl font-black">ASN-DC-2026-001</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-300">
            بطاقة عضوية تمنحك خصومات من الأطباء والعيادات المشتركين داخل المنصة، وكل شيء ظاهر ومترابط من داخل الموقع.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">كيف تعمل</h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
              <li>1. اعرض البطاقة في العيادة المشاركة.</li>
              <li>2. الطبيب يفعّل الخصم من لوحته الخاصة.</li>
              <li>3. الخصم يظهر في الصفحة الشخصية للطبيب وفي هذه الصفحة.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">مزايا البطاقة</h2>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">خصومات على الخدمات داخل العيادات المشاركة</div>
              <div className="rounded-2xl bg-slate-50 p-4">عرض موحد وواضح للأطباء المشتركين</div>
              <div className="rounded-2xl bg-slate-50 p-4">تجربة حجز مرتبطة مباشرة بملف الطبيب</div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-950">الأطباء المشاركون</h2>
            <a href="/booking" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white">
              احجز الآن
            </a>
          </div>

          {loading ? (
            <div className="mt-5 h-24 animate-pulse rounded-2xl bg-slate-100" />
          ) : participating.length === 0 ? (
            <p className="mt-5 text-sm font-semibold text-slate-500">لا توجد عيادات مفعلة حالياً، لكن البطاقة جاهزة للتفعيل من لوحة الطبيب.</p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {participating.map((doctor) => (
                <article key={doctor.id} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-lg font-black text-slate-950">{doctor.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {doctor.city || "غير محدد"} {doctor.area ? `- ${doctor.area}` : ""}
                  </p>
                  <p className="mt-3 text-sm font-bold text-sky-700">
                    {doctor.discount_value || "خصم خاص"} {doctor.discount_note ? `- ${doctor.discount_note}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

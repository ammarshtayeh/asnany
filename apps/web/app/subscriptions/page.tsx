"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Star, Sparkles } from "lucide-react";
import {
  RECOMMENDED_PACKAGE_SLUG,
  SUBSCRIPTION_PERIOD_LABELS,
  type SubscriptionPackage,
} from "@pal-dental/shared";

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ package_id: "", advertiser_name: "", advertiser_type: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const preselectSlug =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("package") || "" : "";

    fetch("/api/subscriptions/packages")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data?.packages) ? data.packages : [];
        setPackages(rows);
        if (preselectSlug) {
          const match = rows.find((p: SubscriptionPackage) => p.slug === preselectSlug);
          if (match) setForm((c) => ({ ...c, package_id: match.id }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === form.package_id) || null,
    [packages, form.package_id],
  );

  const submit = async () => {
    if (!form.package_id || !form.advertiser_name.trim()) {
      setMessage("اختر الباقة وأدخل اسم العيادة أو الشركة.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const res = await fetch("/api/subscriptions/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setMessage(data?.error || "تعذر إرسال الطلب");
      return;
    }
    setMessage("تم إرسال طلب الاشتراك بنجاح. سيتواصل معك فريق ملامح خلال 24–48 ساعة لتفعيل الباقة.");
    setForm({ package_id: "", advertiser_name: "", advertiser_type: "", phone: "", notes: "" });
  };

  return (
    <main className="min-h-screen animate-fade-in bg-transparent pb-24" dir="rtl">
      <div className="section-shell pb-2 pt-3 sm:pt-4">
        <section className="page-hero-dark relative overflow-hidden px-6 py-14 text-right text-white sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-primary/15 blur-[100px]" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="relative z-10 mx-auto max-w-5xl">
          <Link href="/join" className="btn-malama-ghost mb-6 inline-flex px-4 py-2 text-xs sm:text-sm">
            <ArrowRight className="h-4 w-4" /> انضم كطبيب شريك
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#fde68a]">
            <Sparkles className="h-3.5 w-3.5" /> باقات ملامح للأطباء والشركاء
          </span>
          <h1 className="mt-4 text-4xl font-black md:text-5xl">اختر باقتك وابدأ الظهور</h1>
          <p className="mt-3 max-w-2xl text-slate-300 font-semibold leading-7">
            ثلاث باقات واضحة: دليل، مميز، وإعلانات. كل باقة توضّح بالضبط ماذا تحصل — بدون التباس. الأسعار بالدولار الأمريكي.
          </p>
          </div>
        </section>
      </div>

      <div className="section-shell relative z-10 -mt-12 pb-24">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {(loading ? [] : packages).map((pkg) => {
          const recommended = pkg.slug === RECOMMENDED_PACKAGE_SLUG;
          const selected = form.package_id === pkg.id;
          return (
            <article
              key={pkg.id}
              className={`bento-card shine-border relative p-6 transition hover:-translate-y-1 ${
                selected ? "ring-2 ring-slate-950" : recommended ? "border-primary/30" : ""
              }`}
            >
              {recommended ? (
                <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-black text-white">
                  <Star className="h-3 w-3 fill-current" /> الأكثر طلباً
                </span>
              ) : null}
              <h2 className="text-2xl font-black text-slate-950">{pkg.name}</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">{pkg.subtitle}</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-black text-emerald-600">${pkg.price_usd}</span>
                <span className="pb-1 text-sm font-black text-slate-500">{SUBSCRIPTION_PERIOD_LABELS[pkg.billing_period]}</span>
              </div>
              {pkg.original_price_usd ? (
                <p className="mt-1 text-sm font-bold text-rose-500 line-through">${pkg.original_price_usd}</p>
              ) : null}
              <ul className="mt-6 space-y-2">
                {(pkg.features || []).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, package_id: pkg.id }))}
                className={`mt-6 w-full rounded-2xl py-3 font-black transition ${
                  selected ? "bg-slate-950 text-white" : recommended ? "bg-primary text-white hover:bg-primary-dark" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                }`}
              >
                {selected ? "✓ الباقة المختارة" : "اختيار هذه الباقة"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-10 max-w-3xl bento-card shine-border p-6">
        <h3 className="text-xl font-black text-slate-950">طلب تفعيل الباقة</h3>
        {selectedPackage ? (
          <p className="mt-2 text-sm font-bold text-emerald-700">الباقة المختارة: {selectedPackage.name}</p>
        ) : (
          <p className="mt-2 text-sm font-bold text-amber-600">اختر باقة من الأعلى أولاً</p>
        )}
        <div className="mt-4 grid gap-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-right" placeholder="اسم العيادة / الشركة *" value={form.advertiser_name} onChange={(e) => setForm((c) => ({ ...c, advertiser_name: e.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-right" placeholder="نوع النشاط (طبيب، مختبر، تجميل...)" value={form.advertiser_type} onChange={(e) => setForm((c) => ({ ...c, advertiser_type: e.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-right" placeholder="رقم الهاتف / واتساب" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} />
          <textarea className="min-h-24 rounded-xl border border-slate-200 px-4 py-3 font-bold text-right" placeholder="ملاحظات إضافية" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
          <button type="button" onClick={submit} disabled={submitting || !form.package_id} className="rounded-2xl bg-emerald-600 py-3 font-black text-white disabled:opacity-60">
            {submitting ? "جارٍ الإرسال..." : "إرسال طلب الاشتراك"}
          </button>
          {message ? (
            <p className={`text-sm font-black ${message.includes("تم") ? "text-emerald-700" : "text-slate-700"}`}>{message}</p>
          ) : null}
        </div>
      </div>
      </div>
    </main>
  );
}

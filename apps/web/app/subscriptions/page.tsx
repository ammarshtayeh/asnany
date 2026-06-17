"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Package = {
  id: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  price_usd: number;
  original_price_usd?: number | null;
  billing_period: "monthly" | "yearly" | "per_ad";
  features?: string[] | null;
};

const periodLabel = {
  monthly: "شهرياً",
  yearly: "سنوياً",
  per_ad: "لكل إعلان",
} as const;

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ package_id: "", advertiser_name: "", advertiser_type: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/subscriptions/packages")
      .then((res) => res.json())
      .then((data) => setPackages(Array.isArray(data?.packages) ? data.packages : []))
      .finally(() => setLoading(false));
  }, []);

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
    setMessage("تم إرسال طلب الاشتراك. سيتواصل معك فريق ملامح لتفعيل الباقة.");
    setForm({ package_id: "", advertiser_name: "", advertiser_type: "", phone: "", notes: "" });
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24" dir="rtl">
      <section className="bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl text-right">
          <Link href="/join" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold">
            <ArrowRight className="h-4 w-4" /> العودة لانضمام الأطباء
          </Link>
          <h1 className="mt-6 text-4xl font-black">باقات ملامح للأطباء والشركاء</h1>
          <p className="mt-3 max-w-2xl text-slate-300 font-semibold">اختر الباقة المناسبة لعيادتك أو مركزك. الأسعار بالدولار الأمريكي.</p>
        </div>
      </section>

      <div className="mx-auto -mt-10 max-w-6xl px-4 grid gap-6 lg:grid-cols-3">
        {(loading ? [] : packages).map((pkg) => (
          <article key={pkg.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-slate-950">{pkg.name}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{pkg.subtitle}</p>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-black text-emerald-600">${pkg.price_usd}</span>
              <span className="pb-1 text-sm font-black text-slate-500">{periodLabel[pkg.billing_period]}</span>
            </div>
            {pkg.original_price_usd ? (
              <p className="mt-1 text-sm font-bold text-rose-500 line-through">${pkg.original_price_usd} سنوياً</p>
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
              className={`mt-6 w-full rounded-2xl py-3 font-black transition ${form.package_id === pkg.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
            >
              {form.package_id === pkg.id ? "تم اختيار الباقة" : "اختيار الباقة"}
            </button>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <h3 className="text-xl font-black text-slate-950">طلب تفعيل الباقة</h3>
        <div className="mt-4 grid gap-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 font-bold" placeholder="اسم العيادة / الشركة" value={form.advertiser_name} onChange={(e) => setForm((c) => ({ ...c, advertiser_name: e.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 font-bold" placeholder="نوع النشاط (طبيب، مختبر، تجميل...)" value={form.advertiser_type} onChange={(e) => setForm((c) => ({ ...c, advertiser_type: e.target.value }))} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 font-bold" placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} />
          <textarea className="min-h-24 rounded-xl border border-slate-200 px-4 py-3 font-bold" placeholder="ملاحظات إضافية" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
          <button type="button" onClick={submit} disabled={submitting} className="rounded-2xl bg-emerald-600 py-3 font-black text-white disabled:opacity-60">
            {submitting ? "جارٍ الإرسال..." : "إرسال طلب الاشتراك"}
          </button>
          {message ? <p className="text-sm font-black text-slate-700">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}

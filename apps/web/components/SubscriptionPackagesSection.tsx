"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Sparkles, Star } from "lucide-react";
import {
  RECOMMENDED_PACKAGE_SLUG,
  SUBSCRIPTION_PERIOD_LABELS,
  type SubscriptionPackage,
} from "@pal-dental/shared";

type Props = {
  compact?: boolean;
  showCta?: boolean;
};

export default function SubscriptionPackagesSection({ compact = false, showCta = true }: Props) {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions/packages")
      .then((res) => res.json())
      .then((data) => setPackages(Array.isArray(data?.packages) ? data.packages : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </section>
    );
  }

  if (!packages.length) return null;

  return (
    <section className={`${compact ? "py-10" : "py-16"} px-4`} dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-black text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            للأطباء والعيادات
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl font-black text-slate-950">باقات الاشتراك — ماذا نقدّم؟</h2>
          <p className="mt-2 max-w-2xl text-sm font-bold text-slate-500 leading-7">
            اختر الباقة المناسبة لعيادتك: من الظهور في الدليل إلى الحجوزات والإعلانات المميزة. الأسعار بالدولار الأمريكي.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((pkg) => {
            const recommended = pkg.slug === RECOMMENDED_PACKAGE_SLUG;
            return (
              <article
                key={pkg.id}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-lg transition hover:-translate-y-1 ${
                  recommended ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-200"
                }`}
              >
                {recommended ? (
                  <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-black text-white">
                    <Star className="h-3 w-3 fill-current" /> الأكثر طلباً
                  </span>
                ) : null}
                <h3 className="text-xl font-black text-slate-950">{pkg.name}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{pkg.subtitle}</p>
                <div className="mt-5 flex items-end gap-2">
                  <span className="text-3xl font-black text-emerald-600">${pkg.price_usd}</span>
                  <span className="pb-1 text-xs font-black text-slate-500">
                    {SUBSCRIPTION_PERIOD_LABELS[pkg.billing_period]}
                  </span>
                </div>
                {pkg.original_price_usd ? (
                  <p className="mt-1 text-sm font-bold text-rose-500 line-through">${pkg.original_price_usd}</p>
                ) : null}
                <ul className="mt-5 flex-1 space-y-2">
                  {(pkg.features || []).slice(0, compact ? 3 : 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {showCta ? (
                  <Link
                    href={`/subscriptions?package=${pkg.slug}`}
                    className={`mt-6 block rounded-2xl py-3 text-center text-sm font-black transition ${
                      recommended ? "bg-violet-600 text-white hover:bg-violet-700" : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    اشترك الآن
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>

        {showCta ? (
          <div className="mt-8 text-center">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm hover:bg-slate-50"
            >
              مقارنة كاملة وطلب تفعيل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

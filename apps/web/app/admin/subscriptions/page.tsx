"use client";

import { useEffect, useState } from "react";

type Subscription = {
  id: string;
  advertiser_name?: string | null;
  advertiser_type?: string | null;
  status: string;
  amount_usd?: number | null;
  notes?: string | null;
  created_at?: string | null;
  subscription_packages?: { name?: string | null; slug?: string | null } | null;
  doctors?: { name?: string | null; city?: string | null } | null;
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const load = async () => {
    const res = await fetch("/api/admin/subscriptions");
    const data = await res.json();
    setSubscriptions(Array.isArray(data?.subscriptions) ? data.subscriptions : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">الاشتراكات والنظام المالي</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">متابعة طلبات الباقات وتفعيلها أو إلغاؤها.</p>
      </div>

      <div className="grid gap-4">
        {subscriptions.map((item) => (
          <div key={item.id} className="rounded-2xl border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="text-right">
                <p className="text-lg font-black text-slate-950">{item.advertiser_name || item.doctors?.name || "طلب اشتراك"}</p>
                <p className="text-sm font-bold text-slate-500">{item.subscription_packages?.name} · ${item.amount_usd}</p>
                <p className="text-xs font-bold text-slate-400">{item.notes}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => updateStatus(item.id, "active")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">تفعيل</button>
                <button type="button" onClick={() => updateStatus(item.id, "cancelled")} className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-black text-white">إلغاء</button>
              </div>
            </div>
          </div>
        ))}
        {!subscriptions.length ? <p className="text-sm font-bold text-slate-500">لا توجد طلبات اشتراك حالياً.</p> : null}
      </div>
    </div>
  );
}

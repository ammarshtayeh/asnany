"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Edit3, Plus, Save, Trash2 } from "lucide-react";

type Plan = {
  id?: string;
  name: string;
  subtitle?: string;
  price: number | string;
  currency: string;
  duration_months: number | string;
  badge?: string;
  benefits: string[];
  limits?: string[];
  sort_order: number | string;
  is_featured: boolean;
  is_active: boolean;
};

const emptyPlan: Plan = {
  name: "",
  subtitle: "",
  price: "",
  currency: "₪",
  duration_months: 12,
  badge: "",
  benefits: [],
  limits: [],
  sort_order: 0,
  is_featured: false,
  is_active: true,
};

function listToText(value?: string[]) {
  return (value || []).join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminDiscountCardPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<Plan>(emptyPlan);
  const [benefitsText, setBenefitsText] = useState("");
  const [limitsText, setLimitsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [storageReady, setStorageReady] = useState(true);

  const editing = Boolean(form.id);
  const activePlans = useMemo(() => plans.filter((plan) => plan.is_active).length, [plans]);

  const loadPlans = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discount-card-plans");
    const data = await res.json();
    setPlans(Array.isArray(data.plans) ? data.plans : []);
    setStorageReady(data.storageReady !== false);
    setLoading(false);
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const resetForm = () => {
    setForm(emptyPlan);
    setBenefitsText("");
    setLimitsText("");
    setMessage("");
  };

  const editPlan = (plan: Plan) => {
    setForm(plan);
    setBenefitsText(listToText(plan.benefits));
    setLimitsText(listToText(plan.limits));
    setMessage("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      benefits: textToList(benefitsText),
      limits: textToList(limitsText),
    };

    const res = await fetch("/api/admin/discount-card-plans", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "تعذر حفظ الباقة");
      return;
    }

    resetForm();
    await loadPlans();
    setMessage("تم حفظ الباقة بنجاح");
  };

  const removePlan = async (id?: string) => {
    if (!id || !confirm("حذف هذه الباقة؟")) return;
    const res = await fetch("/api/admin/discount-card-plans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "تعذر حذف الباقة");
      return;
    }
    await loadPlans();
  };

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black text-sky-600">بطاقة الخصومات</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">إدارة الباقات والأسعار</h1>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-7 text-slate-500">
            من هنا تتحكم بالسعر، مدة الاشتراك، المزايا، والشارة التي تظهر للمستخدم في الموقع والتطبيق.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-black text-slate-400">باقات فعالة</p>
          <p className="text-2xl font-black text-slate-950">{activePlans}</p>
        </div>
      </div>

      {!storageReady ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-800">
          الباقات الافتراضية ظاهرة حالياً، لكن الحفظ يحتاج تشغيل migration الخاص بجدول discount_card_plans.
        </div>
      ) : null}

      {message ? <div className="mb-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">{message}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            {editing ? <Edit3 className="h-5 w-5 text-sky-600" /> : <Plus className="h-5 w-5 text-sky-600" />}
            <h2 className="text-xl font-black text-slate-950">{editing ? "تعديل باقة" : "إضافة باقة"}</h2>
          </div>

          <div className="grid gap-3">
            <Field label="اسم الباقة" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field label="وصف قصير" value={form.subtitle || ""} onChange={(value) => setForm({ ...form, subtitle: value })} />
            <div className="grid grid-cols-3 gap-2">
              <Field label="السعر" value={String(form.price)} onChange={(value) => setForm({ ...form, price: value })} type="number" required />
              <Field label="العملة" value={form.currency} onChange={(value) => setForm({ ...form, currency: value })} />
              <Field label="المدة/شهر" value={String(form.duration_months)} onChange={(value) => setForm({ ...form, duration_months: value })} type="number" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="شارة" value={form.badge || ""} onChange={(value) => setForm({ ...form, badge: value })} placeholder="الأكثر طلباً" />
              <Field label="الترتيب" value={String(form.sort_order)} onChange={(value) => setForm({ ...form, sort_order: value })} type="number" />
            </div>
            <TextArea label="المزايا - كل ميزة بسطر" value={benefitsText} onChange={setBenefitsText} required />
            <TextArea label="الشروط - كل شرط بسطر" value={limitsText} onChange={setLimitsText} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Toggle label="مميزة" value={form.is_featured} onChange={(value) => setForm({ ...form, is_featured: value })} />
              <Toggle label="فعالة" value={form.is_active} onChange={(value) => setForm({ ...form, is_active: value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button disabled={saving} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white disabled:opacity-60">
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ الباقة"}
              </button>
              {editing ? (
                <button type="button" onClick={resetForm} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700">
                  إلغاء
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-black text-slate-950">الباقات الحالية</h2>
          {loading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-bold text-slate-500">
              لا توجد باقات بعد.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {plans.map((plan) => (
                <article key={plan.id || plan.name} className={`rounded-2xl border p-4 ${plan.is_featured ? "border-sky-200 bg-sky-50/50" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">{plan.name}</h3>
                        {plan.badge ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-black text-amber-700">{plan.badge}</span> : null}
                        {!plan.is_active ? <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-black text-rose-700">مخفية</span> : null}
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-500">{plan.subtitle}</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="mt-4 text-3xl font-black text-slate-950">
                    {plan.price} <span className="text-base text-slate-500">{plan.currency}</span>
                    <span className="mr-2 text-xs font-black text-slate-400">/ {plan.duration_months} شهر</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm font-bold text-slate-600">
                    {(plan.benefits || []).slice(0, 4).map((benefit) => <li key={benefit}>• {benefit}</li>)}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => editPlan(plan)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-800">
                      <Edit3 className="h-4 w-4" />
                      تعديل
                    </button>
                    <button onClick={() => removePlan(plan.id)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-700">
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        required={required}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-sky-300 focus:bg-white"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold outline-none focus:border-sky-300 focus:bg-white"
      />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-slate-950" />
    </label>
  );
}

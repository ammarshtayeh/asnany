"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, CreditCard, MapPin, Send } from "lucide-react";

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
  const [form, setForm] = useState({ full_name: "", phone: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : Array.isArray(data?.doctors) ? data.doctors : []);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  const participating = useMemo(
    () => doctors.filter((doctor) => doctor.accepts_discount_card || doctor.discount_value || doctor.discount_note),
    [doctors],
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const res = await fetch("/api/discount-card/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setMessage(data.error || "تعذر إرسال الطلب");
      return;
    }
    setForm({ full_name: "", phone: "", city: "" });
    setMessage("وصل طلبك. سنراجع البطاقة ونتواصل معك للتفعيل.");
  };

  return (
    <main className="min-h-screen animate-fade-in bg-transparent pb-24" dir="rtl">
      <section className="section-shell pb-8 pt-4">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_430px] lg:items-center">
          <div className="text-right">
            <Link href="/" className="btn-malama-outline mb-7 inline-flex text-xs">
              <ArrowRight className="h-4 w-4" />
              الرئيسية
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-primary/5 px-4 py-2 text-sm font-black text-primary">
              <CreditCard className="h-4 w-4" />
              بطاقة خصم أسناني
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              اطلب بطاقة الخصم واستخدمها عند العيادات المشاركة.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-8 text-slate-500">
              لا يوجد اشتراك معقد أو باقات كثيرة. أرسل بياناتك، والأدمن يتابع الطلب ويفعّل البطاقة. بعدها تظهر للطبيب أنك مشترك عند مراجعة الحجز.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["طلب سريع", "تفعيل من الأدمن", "تظهر للطبيب"].map((item) => (
                <div key={item} className="bento-card p-4 text-sm font-black text-slate-700">
                  <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="bento-card shine-border p-5 md:p-6">
            <div className="mb-5 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black text-slate-400">بطاقة خصم ملامح</p>
              <p className="mt-8 text-2xl font-black">طلب بطاقة خصم</p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-300">بعد التفعيل، يظهر للطبيب أن صاحب هذا الرقم مشترك بالبطاقة.</p>
            </div>
            <div className="grid gap-3">
              <Field label="الاسم الرباعي" value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value })} required />
              <Field label="رقم الهاتف" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required inputMode="tel" />
              <Field label="المدينة" value={form.city} onChange={(value) => setForm({ ...form, city: value })} required />
              {message ? <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-800">{message}</p> : null}
              <button disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white disabled:opacity-60">
                <Send className="h-4 w-4" />
                {submitting ? "جاري الإرسال..." : "اطلب البطاقة"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="bento-card shine-border mx-auto max-w-6xl p-5 md:p-7">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">العيادات المشاركة</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{participating.length} عيادة توضّح خصم البطاقة داخل المنصة</p>
            </div>
            <Link href="/booking" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white">
              <CalendarCheck className="h-4 w-4" />
              احجز الآن
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-bold text-slate-400">جاري التحميل...</div>
          ) : participating.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/50 p-8 text-center">
              <p className="text-sm font-black text-slate-800">العيادات المشاركة تُفعّل تدريجياً</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                اطلب بطاقتك الآن — ستظهر العيادات هنا فور تفعيل خصم البطاقة من بيانات الطبيب.
              </p>
              <Link href="/join" className="mt-4 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white">
                انضم كطبيب شريك
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {participating.map((doctor) => (
                <article key={doctor.id} className="bento-card p-4">
                  <h3 className="text-lg font-black text-slate-950">{doctor.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {[doctor.city, doctor.area].filter(Boolean).join(" - ") || "غير محدد"}
                  </p>
                  <p className="mt-3 inline-block rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
                    {doctor.discount_value || "خصم خاص"} {doctor.discount_note ? `- ${doctor.discount_note}` : ""}
                  </p>
                  <div className="mt-3">
                    <Link href={`/doctors/${doctor.id}`} className="text-xs font-black text-primary underline underline-offset-4">
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

function Field({
  label,
  value,
  onChange,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "text" | "tel";
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        inputMode={inputMode}
        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none focus:border-blue-300 focus:bg-white"
      />
    </label>
  );
}

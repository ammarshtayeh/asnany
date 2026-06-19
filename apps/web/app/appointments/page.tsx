"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock, Search, ShieldCheck } from "lucide-react";

type Appointment = {
  id: string;
  date?: string;
  time?: string | null;
  status?: string;
  patient_full_name?: string | null;
  patient_name?: string | null;
  notes?: string | null;
  doctors?: {
    name?: string | null;
    city?: string | null;
    area?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
};

const statusCopy: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-700 border-amber-100" },
  confirmed: { label: "مؤكد", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled: { label: "ملغي", className: "bg-rose-50 text-rose-700 border-rose-100" },
  completed: { label: "مكتمل", className: "bg-sky-50 text-sky-700 border-sky-100" },
};

export default function AppointmentsPage() {
  const [phoneValue, setPhoneValue] = useState("");
  const [identityLast4, setIdentityLast4] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const cleanPhone = useMemo(() => phoneValue.replace(/[^0-9]/g, ""), [phoneValue]);
  const cleanIdentity = useMemo(() => identityLast4.replace(/[^0-9]/g, "").slice(0, 4), [identityLast4]);
  const canSearch = cleanPhone.length >= 9;

  const loadAppointments = useCallback(async (phoneOverride?: string, identityOverride?: string) => {
    const phone = (phoneOverride ?? phoneValue).replace(/[^0-9]/g, "");
    const identity = (identityOverride ?? identityLast4).replace(/[^0-9]/g, "").slice(0, 4);
    if (phone.length < 9) return;
    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const params = new URLSearchParams({ phone });
      if (identity.length === 4) {
        params.set("identity_last4", identity);
      }
      const res = await fetch(`/api/appointments?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "تعذر جلب الحجوزات");
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (err) {
      setAppointments([]);
      setError(err instanceof Error ? err.message : "تعذر جلب الحجوزات");
    } finally {
      setLoading(false);
    }
  }, [phoneValue, identityLast4]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPhone = params.get("phone") || params.get("query") || "";
    const initialIdentity = params.get("identity_last4") || "";
    const normalizedPhone = initialPhone.replace(/[^0-9]/g, "");
    const normalizedIdentity = initialIdentity.replace(/[^0-9]/g, "").slice(0, 4);
    if (normalizedPhone.length >= 9) {
      setPhoneValue(initialPhone);
      if (normalizedIdentity.length === 4) {
        setIdentityLast4(normalizedIdentity);
      }
      void loadAppointments(normalizedPhone, normalizedIdentity);
    }
  }, [loadAppointments]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8" dir="rtl">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-100">
          <ArrowRight className="h-4 w-4" />
          الرئيسية
        </Link>

        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-sky-600">متابعة آمنة</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">حجوزاتي</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-7 text-slate-500">
                أدخل رقم الهاتف المستخدم في الحجز. يمكنك إضافة آخر 4 أرقام من الهوية (اختياري) لتضييق النتائج.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-400 focus-within:bg-white">
              <input
                value={phoneValue}
                onChange={(event) => setPhoneValue(event.target.value)}
                inputMode="tel"
                className="w-full bg-transparent py-3 text-right text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="رقم الهاتف المستخدم في الحجز"
              />
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-400 focus-within:bg-white">
              <ShieldCheck className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={identityLast4}
                onChange={(event) => setIdentityLast4(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                inputMode="numeric"
                maxLength={4}
                className="w-full bg-transparent py-3 text-right text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="آخر 4 أرقام من الهوية (اختياري)"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => loadAppointments()}
            disabled={!canSearch || loading}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-sky-600 disabled:opacity-50 sm:w-auto"
          >
            <Search className="h-4 w-4" />
            {loading ? "جاري البحث..." : "عرض الحجوزات"}
          </button>

          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
        </div>

        <div className="mt-5 grid gap-3">
          {!searched ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              حجوزاتك ستظهر هنا بعد التحقق.
            </div>
          ) : appointments.length === 0 && !loading ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center">
              <p className="text-lg font-black text-slate-900">لا توجد حجوزات لهذه البيانات</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">تأكد من رقم الهاتف، أو ابدأ حجزاً جديداً من صفحة الطبيب.</p>
            </div>
          ) : (
            appointments.map((appointment) => {
              const status = statusCopy[appointment.status || "pending"] || statusCopy.pending;
              return (
                <article key={appointment.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{appointment.doctors?.name || "الطبيب"}</h2>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {[appointment.doctors?.city, appointment.doctors?.area].filter(Boolean).join(" - ") || "عيادة ملامح"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${status.className}`}>{status.label}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-black text-slate-700">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <CalendarCheck2 className="h-4 w-4 text-sky-500" />
                      {appointment.date || "بدون تاريخ"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      {appointment.time || "بدون وقت"}
                    </span>
                  </div>
                  {appointment.notes ? <p className="mt-3 text-sm font-semibold leading-7 text-slate-500">{appointment.notes}</p> : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

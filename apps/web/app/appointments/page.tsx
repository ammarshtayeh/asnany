"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Clock, Search } from "lucide-react";
import WebPushOptIn from "@/components/WebPushOptIn";

type Appointment = {
  id: string;
  booking_ref?: string | null;
  date?: string;
  time?: string | null;
  status?: string;
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
  const [refValue, setRefValue] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const cleanPhone = useMemo(() => phoneValue.replace(/[^0-9]/g, ""), [phoneValue]);
  const cleanRef = useMemo(() => refValue.trim().toUpperCase().replace(/\s+/g, ""), [refValue]);
  const canSearch = cleanPhone.length >= 9 && cleanRef.length >= 6;

  const loadAppointments = useCallback(async (phoneOverride?: string, refOverride?: string) => {
    const phone = (phoneOverride ?? phoneValue).replace(/[^0-9]/g, "");
    const ref = (refOverride ?? refValue).trim().toUpperCase().replace(/\s+/g, "");
    if (phone.length < 9 || ref.length < 6) return;
    setLoading(true);
    setSearched(true);
    setError("");

    try {
      const params = new URLSearchParams({ phone, ref });
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
  }, [phoneValue, refValue]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPhone = params.get("phone") || "";
    const initialRef = params.get("ref") || params.get("booking_ref") || "";
    const normalizedPhone = initialPhone.replace(/[^0-9]/g, "");
    const normalizedRef = initialRef.trim().toUpperCase().replace(/\s+/g, "");
    if (normalizedPhone.length >= 9 && normalizedRef.length >= 6) {
      setPhoneValue(initialPhone);
      setRefValue(initialRef);
      void loadAppointments(normalizedPhone, normalizedRef);
    }
  }, [loadAppointments]);

  return (
    <main className="min-h-screen animate-fade-in bg-transparent pb-24 pt-4" dir="rtl">
      <section className="section-shell mx-auto max-w-3xl">
        <Link href="/" className="btn-malama-outline inline-flex text-xs">
          <ArrowRight className="h-4 w-4" />
          الرئيسية
        </Link>

        <div className="bento-card shine-border mt-6 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black text-sky-600">متابعة آمنة</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">حجوزاتي</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-7 text-slate-500">
                أدخل رقم الهاتف ورمز الحجز (مثل MLH-AB12CD) الذي ظهر بعد إرسال الطلب.
              </p>
            </div>
          </div>

          <label className="mt-6 flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-400 focus-within:bg-white">
            <input
              value={phoneValue}
              onChange={(event) => setPhoneValue(event.target.value)}
              inputMode="tel"
              className="w-full bg-transparent py-3 text-right text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="رقم الهاتف المستخدم في الحجز"
            />
          </label>

          <label className="mt-3 flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-400 focus-within:bg-white">
            <input
              value={refValue}
              onChange={(event) => setRefValue(event.target.value)}
              className="w-full bg-transparent py-3 text-right text-sm font-bold uppercase tracking-wider text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="رمز الحجز — MLH-XXXXXX"
            />
          </label>

          <button
            type="button"
            onClick={() => loadAppointments()}
            disabled={!canSearch || loading}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-sky-600 disabled:opacity-50 sm:w-auto"
          >
            <Search className="h-4 w-4" />
            {loading ? "جاري البحث..." : "عرض الحجز"}
          </button>

          {searched && canSearch ? <WebPushOptIn patientPhone={cleanPhone} /> : null}

          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
        </div>

        <div className="mt-5 grid gap-3">
          {!searched ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              رمز الحجز يظهر مباشرة بعد إرسال طلب الموعد — احفظه مع رقم هاتفك.
            </div>
          ) : null}

          {searched && !loading && appointments.length === 0 && !error ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              لا يوجد حجز مطابق لهذا الرقم والرمز.
            </div>
          ) : null}

          {appointments.map((item) => {
            const status = statusCopy[item.status || "pending"] || statusCopy.pending;
            return (
              <article key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">{item.doctors?.name || "عيادة ملامح"}</h2>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {[item.doctors?.city, item.doctors?.area].filter(Boolean).join(" — ")}
                    </p>
                    {item.booking_ref ? (
                      <p className="mt-2 text-xs font-black tracking-wider text-amber-700">{item.booking_ref}</p>
                    ) : null}
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2">
                    <CalendarCheck2 className="h-4 w-4 text-sky-600" />
                    {item.date || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2">
                    <Clock className="h-4 w-4 text-sky-600" />
                    {item.time || "—"}
                  </span>
                </div>
                {item.notes ? <p className="mt-3 text-sm font-semibold text-slate-500">{item.notes}</p> : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

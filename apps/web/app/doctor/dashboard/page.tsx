"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarCheck2,
  Clock,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { AppointmentRecord, Doctor } from "@/lib/types";

const DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function DoctorDashboardPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    whatsapp: "",
    city: "",
    area: "",
    address: "",
    bio: "",
    is_available: true,
    availability_note: "",
    working_hours: {} as Record<string, string>,
  });

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
      today: appointments.filter((item) => item.date === today).length,
      total: appointments.length,
    };
  }, [appointments]);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/doctor/me");
    const data = await res.json();
    if (res.ok) {
      setDoctor(data.doctor);
      setAppointments(data.appointments || []);
      setForm({
        phone: data.doctor?.phone || "",
        whatsapp: data.doctor?.whatsapp || "",
        city: data.doctor?.city || "",
        area: data.doctor?.area || "",
        address: data.doctor?.address || "",
        bio: data.doctor?.bio || "",
        is_available: data.doctor?.is_available !== false,
        availability_note: data.doctor?.availability_note || "",
        working_hours: data.doctor?.working_hours || {},
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/doctor/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      alert(data.error || "تعذر الحفظ");
      return;
    }
    setDoctor(data.doctor);
    alert("تم حفظ بيانات العيادة");
  };

  const updateAppointment = async (id: string, status: string) => {
    const res = await fetch("/api/doctor/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "تعذر تحديث الموعد");
      return;
    }
    setAppointments((current) => current.map((item) => (item.id === id ? data.appointment : item)));
  };

  const todaysAppointments = appointments.filter((item) => item.date === new Date().toISOString().slice(0, 10));
  const nextPending = appointments.filter((item) => item.status === "pending").slice(0, 3);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6" dir="rtl">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-28 animate-pulse rounded-3xl bg-white" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-3xl bg-white lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="bg-gradient-to-l from-sky-500/20 via-transparent to-emerald-500/20 px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-sky-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  لوحة الطبيب
                </div>
                <div>
                  <h1 className="text-3xl font-black md:text-4xl">أهلاً د. {doctor?.name}</h1>
                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    {doctor?.city} {doctor?.area ? `- ${doctor.area}` : ""} · {doctor?.address || "بدون عنوان مفصل"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-200">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {doctor?.verified ? "حساب موثق" : "بحاجة لتوثيق"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    {doctor?.is_available ? "العيادة مفتوحة" : "العيادة مغلقة الآن"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/doctor/notifications" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
                  <Bell className="h-4 w-4" />
                  الإشعارات
                </Link>
                <form action="/api/doctor/logout" method="POST">
                  <button className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
                    <LogOut className="h-4 w-4" />
                    خروج
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <Stat icon={Clock} label="قيد المراجعة" value={stats.pending} />
          <Stat icon={CalendarCheck2} label="مواعيد مؤكدة" value={stats.confirmed} />
          <Stat icon={UserRoundCheck} label="حجوزات اليوم" value={stats.today} />
          <Stat icon={Users} label="إجمالي الحجوزات" value={stats.total} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">إدارة الحجوزات</h2>
                <p className="text-sm font-bold text-slate-500">راجع الطلبات الجديدة وحدد الحالة بسرعة من مكان واحد.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-600">
                {todaysAppointments.length} اليوم
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <CalendarCheck2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-black text-slate-700">لا توجد حجوزات بعد</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">ستظهر الطلبات الجديدة فور إرسالها من صفحة الحجز.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200 hover:shadow-md">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${
                          item.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "completed"
                            ? "bg-sky-50 text-sky-700"
                            : item.status === "cancelled"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{item.date} · {item.time || "بدون وقت"}</span>
                      </div>
                      <select
                        value={item.status}
                        onChange={(event) => updateAppointment(item.id, event.target.value)}
                        className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-lg font-black text-slate-950">{item.patient_full_name || item.patient_name}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{item.patient_phone}</p>
                        <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                          <span>الهوية: {item.patient_identity || "غير مدخلة"}</span>
                          <span>العنوان: {item.patient_address || "غير مدخل"}</span>
                          {item.patient_email ? <span>البريد: {item.patient_email}</span> : null}
                        </div>
                      </div>
                      {item.notes ? (
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">ملاحظات</p>
                          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{item.notes}</p>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-500">لا توجد ملاحظات إضافية.</p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">الحالة الحالية للعيادة</h2>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-black text-slate-800">مفتوح الآن في العيادة</span>
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(event) => setForm((current) => ({ ...current, is_available: event.target.checked }))}
                  className="h-5 w-5"
                />
              </label>
              <textarea
                value={form.availability_note}
                onChange={(event) => setForm((current) => ({ ...current, availability_note: event.target.value }))}
                placeholder="مثال: متاح للطوارئ حتى الساعة 8 مساءً"
                className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-sky-300"
              />
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">طلبات بانتظار القرار</h2>
              <div className="mt-4 space-y-3">
                {nextPending.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">لا توجد طلبات معلقة حالياً.</p>
                ) : (
                  nextPending.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-sm font-black text-slate-950">{item.patient_full_name || item.patient_name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{item.date} · {item.time || "بدون وقت"}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">تحديث بيانات العيادة</h2>
              <div className="mt-4 grid gap-3">
                <Field label="هاتف العيادة" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                <Field label="واتساب" value={form.whatsapp} onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))} />
                <Field label="المدينة" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
                <Field label="المنطقة" value={form.area} onChange={(value) => setForm((current) => ({ ...current, area: value }))} />
                <Field label="العنوان التفصيلي" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">دوام الأسبوع</h2>
              <div className="mt-4 space-y-2">
                {DAYS.map((day) => (
                  <label key={day} className="grid grid-cols-[72px_1fr] items-center gap-2 text-sm font-black text-slate-700">
                    <span>{day}</span>
                    <input
                      value={form.working_hours[day] || ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          working_hours: { ...current.working_hours, [day]: event.target.value },
                        }))
                      }
                      placeholder="09:00 ص - 05:00 م أو مغلق"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={updateProfile}
                disabled={saving}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-sky-600 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ بيانات العيادة"}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="mb-3 h-6 w-6 text-sky-600" />
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-sky-300"
      />
    </label>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarCheck2, Clock, LogOut, Save, UserRoundCheck } from "lucide-react";
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
    return {
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
      today: appointments.filter((item) => item.date === new Date().toISOString().slice(0, 10)).length,
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
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-sky-300">لوحة الطبيب</p>
              <h1 className="mt-1 text-3xl font-black">أهلاً د. {doctor?.name}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                {doctor?.city} {doctor?.area ? `- ${doctor.area}` : ""}
              </p>
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
        </header>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <Stat icon={Clock} label="قيد المراجعة" value={stats.pending} />
          <Stat icon={CalendarCheck2} label="مواعيد مؤكدة" value={stats.confirmed} />
          <Stat icon={UserRoundCheck} label="حجوزات اليوم" value={stats.today} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">حجوزات المرضى</h2>
                <p className="text-sm font-bold text-slate-500">تظهر هنا بيانات المريض المطلوبة عند الحجز.</p>
              </div>
            </div>
            {appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <CalendarCheck2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-black text-slate-700">لا توجد حجوزات بعد.</p>
                <p className="mt-2 text-sm font-semibold text-slate-500">ستظهر الحجوزات الجديدة فور إرسالها من صفحة الطبيب.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-950">{item.patient_full_name || item.patient_name}</h3>
                        <p className="mt-1 text-sm font-bold text-slate-500">{item.patient_phone}</p>
                        {item.patient_email ? (
                          <a
                            href={`mailto:${item.patient_email}`}
                            className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:underline"
                          >
                            {item.patient_email}
                          </a>
                        ) : null}
                        <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 md:grid-cols-2">
                          <span>الهوية: {item.patient_identity || "غير مدخلة"}</span>
                          <span>العنوان: {item.patient_address || "غير مدخل"}</span>
                          <span>التاريخ: {item.date}</span>
                          <span>الوقت: {item.time || "غير محدد"}</span>
                        </div>
                        {item.notes ? <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">{item.notes}</p> : null}
                      </div>
                      <select
                        value={item.status}
                        onChange={(event) => updateAppointment(item.id, event.target.value)}
                        className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 outline-none"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">حالة العيادة الآن</h2>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-black text-slate-800">موجود ومتاح في العيادة</span>
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

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">بيانات التواصل</h2>
              <div className="mt-4 grid gap-3">
                <Field label="هاتف العيادة" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                <Field label="واتساب" value={form.whatsapp} onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))} />
                <Field label="المدينة" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
                <Field label="المنطقة" value={form.area} onChange={(value) => setForm((current) => ({ ...current, area: value }))} />
                <Field label="العنوان التفصيلي" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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

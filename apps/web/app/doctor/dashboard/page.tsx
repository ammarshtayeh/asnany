"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarCheck2,
  CreditCard,
  Clock,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
  Users,
  CheckCircle,
  AlertCircle,
  Phone,
  FileText,
  DollarSign
} from "lucide-react";
import { AppointmentRecord, Doctor } from "@/lib/types";
import NotificationSoundBridge from "@/components/NotificationSoundBridge";

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

  const upcomingAppointments = useMemo(() => {
    return [...appointments]
      .filter((item) => item.status !== "cancelled")
      .sort((left, right) => {
        const leftStamp = `${left.date}T${left.time || "23:59"}`;
        const rightStamp = `${right.date}T${right.time || "23:59"}`;
        return leftStamp.localeCompare(rightStamp);
      })
      .slice(0, 4);
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
    alert("تم حفظ بيانات العيادة بنجاح!");
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
      <main className="min-h-screen bg-slate-50 p-6 flex flex-col justify-center items-center" dir="rtl">
        <div className="w-10 h-10 rounded-full border-4 border-sky-500 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-sm">جاري تحميل لوحة التحكم الخاصة بك...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-right" dir="rtl">
      <NotificationSoundBridge href="/doctor/notifications" />
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Welcome Card */}
        <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl border border-slate-900">
          <div className="bg-gradient-to-l from-sky-500/10 via-transparent to-emerald-500/10 px-6 py-8 relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-black text-sky-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  لوحة الأخصائي المعتمد
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight">أهلاً د. {doctor?.name}</h1>
                  <p className="mt-2 text-xs md:text-sm font-semibold text-slate-400 flex items-center gap-1 justify-start">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{doctor?.city} {doctor?.area ? `· ${doctor.area}` : ""} · {doctor?.address || "العنوان غير محدد بالتفصيل"}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] md:text-xs font-bold text-slate-300 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    {doctor?.verified ? "حساب موثق وعام" : "حساب تحت المراجعة"}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 border ${doctor?.is_available ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                    <Stethoscope className="h-3.5 w-3.5" />
                    {doctor?.is_available ? "متاح لاستقبال الحجوزات" : "مغلق مؤقتاً"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/doctor/notifications" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-xs md:text-sm font-black text-white transition-all">
                  <Bell className="h-4 w-4 text-sky-400" />
                  الإشعارات
                </Link>
                <form action="/api/doctor/logout" method="POST">
                  <button type="submit" className="inline-flex items-center gap-2 bg-white/5 hover:bg-red-500/10 border border-white/10 px-5 py-3 rounded-2xl text-xs md:text-sm font-black text-white transition-all cursor-pointer">
                    <LogOut className="h-4 w-4 text-red-400" />
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Stat icon={Clock} label="حجوزات قيد المراجعة" value={stats.pending} color="text-amber-500" bg="bg-amber-50" />
          <Stat icon={CalendarCheck2} label="حجوزات مؤكدة" value={stats.confirmed} color="text-emerald-500" bg="bg-emerald-50" />
          <Stat icon={UserRoundCheck} label="مواعيد اليوم" value={stats.today} color="text-sky-500" bg="bg-sky-50" />
          <Stat icon={Users} label="إجمالي الحجوزات" value={stats.total} color="text-violet-500" bg="bg-violet-50" />
        </section>

        {/* Quick Summary Cards (Upcoming) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">أقرب الحجوزات القادمة</h2>
              <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">مراجعة سريعة لأقرب مواعيد المرضى لترتيب جدول عيادتك.</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black self-start ${doctor?.is_available ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              <span className={`w-2 h-2 rounded-full ${doctor?.is_available ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span>{doctor?.is_available ? "العيادة متاحة الآن" : "العيادة غير متاحة"}</span>
            </div>
          </div>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {upcomingAppointments.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-400">
                لا توجد حجوزات مؤكدة قادمة حالياً.
              </div>
            ) : (
              upcomingAppointments.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-black text-slate-600 border border-slate-200/50">
                        {item.date}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 font-mono" dir="ltr">{item.time || "غير محدد"}</span>
                    </div>
                    <h3 className="mt-3 text-base font-black text-slate-950">{item.patient_full_name || item.patient_name}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500 font-mono" dir="ltr">{item.patient_phone}</p>
                    <span className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black ${
                      item.discount_card_status === "active"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}>
                      <CreditCard className="h-3 w-3" />
                      {item.discount_card_status === "active" ? "مشترك بطاقة الخصم" : "غير مشترك"}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-md">
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Dashboard Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          
          {/* Main Booking Management Section */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-900">إدارة طلبات الحجوزات</h2>
                  <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">تعديل حالة الحجوزات مباشرة والاطلاع على تفاصيل المرضى.</p>
                </div>
                <div className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-black text-slate-600 self-start sm:self-auto">
                  {todaysAppointments.length} حجوزات اليوم
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                  <CalendarCheck2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <p className="font-black text-slate-700 text-lg">لا توجد حجوزات مسجلة بعد</p>
                  <p className="mt-1 text-xs md:text-sm font-semibold text-slate-400">ستظهر الطلبات هنا مباشرة فور إرسالها من المرضى.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md hover:border-sky-200">
                      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                            item.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : item.status === "completed"
                              ? "bg-sky-50 text-sky-700 border border-sky-100"
                              : item.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {STATUS_LABELS[item.status] || item.status}
                          </span>
                          <span className="text-xs font-bold text-slate-500 font-mono" dir="ltr">{item.date} · {item.time || "غير محدد"}</span>
                        </div>
                        <select
                          value={item.status}
                          onChange={(event) => updateAppointment(item.id, event.target.value)}
                          className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-800 outline-none focus:border-sky-500"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{item.patient_full_name || item.patient_name}</h3>
                          <p className="mt-1 text-xs md:text-sm font-semibold text-slate-500 font-mono" dir="ltr">{item.patient_phone}</p>
                          <span className={`mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${
                            item.discount_card_status === "active"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}>
                            <CreditCard className="h-3.5 w-3.5" />
                            {item.discount_card_status === "active" ? "مشترك بطاقة الخصم" : "غير مشترك"}
                          </span>
                          <div className="mt-4 space-y-2 text-xs md:text-sm font-medium text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                            <p><span className="font-bold text-slate-700">رقم الهوية:</span> {item.patient_identity || "غير متوفر"}</p>
                            <p><span className="font-bold text-slate-700">العنوان:</span> {item.patient_address || "غير محدد"}</p>
                            {item.patient_email && <p><span className="font-bold text-slate-700">البريد:</span> {item.patient_email}</p>}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ملاحظات وحالة المريض</p>
                          <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                            {item.notes || "لا توجد ملاحظات إضافية من المريض."}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar controls for Clinic Profile, Availability and Working Hours */}
          <aside className="space-y-6">
            
            {/* Availability Control */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-1.5 justify-start">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>حالة العيادة الحالية</span>
              </h2>
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-4 hover:bg-slate-100/60 transition">
                <span className="font-black text-sm text-slate-800">العيادة مفتوحة وتستقبل مرضى</span>
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(event) => setForm((current) => ({ ...current, is_available: event.target.checked }))}
                  className="h-5 w-5 rounded-md accent-sky-600"
                />
              </label>
              <textarea
                value={form.availability_note}
                onChange={(event) => setForm((current) => ({ ...current, availability_note: event.target.value }))}
                placeholder="مثال: متواجدون حالياً لاستقبال الحالات الطارئة وجلسات الليزر والأسنان."
                className="mt-3 min-h-[90px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold outline-none focus:border-sky-300 focus:bg-white transition"
              />
            </section>

            {/* Pending Requests List */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-1.5 justify-start">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>طلبات بحاجة للمراجعة</span>
              </h2>
              <div className="space-y-2.5">
                {nextPending.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-400 text-center">لا توجد طلبات معلقة حالياً.</p>
                ) : (
                  nextPending.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 p-3 bg-amber-50/20 flex flex-col gap-1">
                      <p className="text-xs font-black text-slate-900">{item.patient_full_name || item.patient_name}</p>
                      <p className="text-[10px] font-bold text-slate-500 font-mono" dir="ltr">{item.date} · {item.time || "غير محدد"}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Clinic Details Form */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-1.5 justify-start">
                <FileText className="w-5 h-5 text-sky-500" />
                <span>بيانات الاتصال والعنوان</span>
              </h2>
              <div className="grid gap-4">
                <Field label="هاتف العيادة" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                <Field label="رقم الواتساب (للتواصل المباشر)" value={form.whatsapp} onChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))} />
                <Field label="المدينة" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
                <Field label="المنطقة" value={form.area} onChange={(value) => setForm((current) => ({ ...current, area: value }))} />
                <Field label="العنوان التفصيلي" value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
              </div>
            </section>

            {/* Weekly Working Hours */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-1.5 justify-start">
                <Clock className="w-5 h-5 text-violet-500" />
                <span>ساعات العمل الأسبوعية</span>
              </h2>
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <label key={day} className="grid grid-cols-[80px_1fr] items-center gap-2 text-xs font-black text-slate-700">
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
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold outline-none focus:border-sky-300 focus:bg-white transition"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={updateProfile}
                disabled={saving}
                className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-xs font-black text-white hover:bg-sky-600 disabled:opacity-60 transition shadow-lg cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ والرفع..." : "حفظ وتحديث العيادة"}
              </button>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-black text-slate-950">{value}</p>
        <p className="mt-1 text-xs md:text-sm font-bold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-slate-500 mr-1">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold outline-none focus:border-sky-300 focus:bg-white transition"
      />
    </label>
  );
}

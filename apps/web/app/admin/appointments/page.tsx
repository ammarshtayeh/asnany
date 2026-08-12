"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CreditCard, Mail, Trash2, Phone } from "lucide-react";
import { AppointmentRecord } from "@/lib/types";

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  pending:   { label: "قيد المراجعة", style: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "مؤكد",         style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed: { label: "مكتمل",        style: "bg-primary/5 text-primary border-sky-200" },
  cancelled: { label: "ملغي",         style: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/appointments")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "تعذر تحديث الموعد"); return; }
    setAppointments((current) => current.map((item) => (item.id === id ? data.appointment : item)));
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("هل تريد حذف هذا الموعد نهائياً؟")) return;
    const res = await fetch("/api/admin/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "تعذر حذف الموعد"); return; }
    setAppointments((current) => current.filter((item) => item.id !== id));
  };

  const pending = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900">
          <Calendar className="h-8 w-8 text-primary" />
          إدارة الحجوزات
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-500">كل حجوزات الأطباء من قاعدة البيانات في مكان واحد</p>
      </header>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-black text-slate-950">{appointments.length}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">إجمالي الحجوزات</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-3xl font-black text-amber-700">{pending}</p>
          <p className="mt-1 text-sm font-bold text-amber-600">بانتظار التأكيد</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-3xl font-black text-emerald-700">
            {appointments.filter((a) => a.status === "confirmed").length}
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-600">مواعيد مؤكدة</p>
        </div>
      </div>

      {/* Appointments List */}
      <section className="bento-card shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-black text-slate-950">سجل الحجوزات</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="font-black text-slate-700">لا توجد حجوزات بعد.</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">ستظهر هنا عند وصول أول حجز.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((app) => {
              const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.pending;
              return (
                <article key={app.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-base font-black text-slate-950">
                          {app.patient_full_name || app.patient_name}
                        </h3>
                        <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-black ${statusInfo.style}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-black ${
                          app.discount_card_status === "active"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}>
                          <CreditCard className="h-3.5 w-3.5" />
                          {app.discount_card_status === "active" ? "مشترك بطاقة الخصم" : "غير مشترك"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {app.patient_phone}
                        </span>
                        {app.patient_email ? (
                          <a
                            href={`mailto:${app.patient_email}`}
                            className="flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {app.patient_email}
                          </a>
                        ) : null}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {app.date}
                        </span>
                        {app.time ? (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {app.time}
                          </span>
                        ) : null}
                      </div>
                      {app.notes ? (
                        <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                          ملاحظات: {app.notes}
                        </p>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 outline-none focus:border-sky-300"
                      >
                        <option value="pending">قيد المراجعة</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteAppointment(app.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                        title="حذف الموعد"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

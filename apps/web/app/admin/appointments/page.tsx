"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, AlertCircle, Trash2 } from "lucide-react";
import { Appointment } from "@pal-dental/shared";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/appointments")
      .then(res => res.json())
      .then(data => {
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
    if (!res.ok) {
      alert(data.error || "تعذر تحديث الموعد");
      return;
    }
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
    if (!res.ok) {
      alert(data.error || "تعذر حذف الموعد");
      return;
    }
    setAppointments((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" /> إدارة المواعيد
        </h1>
        <p className="text-slate-500 mt-1">عرض وتنظيم المواعيد الطبية ومتابعة القنوات النشطة</p>
      </div>

      {/* Booking Mode Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-right flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-amber-800 text-lg mb-1">وضع الحجز المباشر نشط حالياً (WhatsApp & Direct Call)</h3>
          <p className="text-amber-700 leading-relaxed text-sm font-medium">
            بناءً على طلبك، قمنا بتعطيل استمارات الحجز الذاتية عبر الموقع لحماية تجربة المرضى وتسريع خدمتهم. يتم الآن توجيه كافة المرضى للتواصل مباشرة مع العيادات الطبية عبر واتساب أو الاتصال الهاتفي.
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">سجل طلبات الحجز السابقة</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>لا يوجد أي طلبات حجز سابقة مسجلة في قاعدة البيانات حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">اسم المريض</th>
                  <th className="px-6 py-4">رقم الهاتف</th>
                  <th className="px-6 py-4">تاريخ الموعد</th>
                  <th className="px-6 py-4">الوقت المفضل</th>
                  <th className="px-6 py-4">حالة الحجز</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((app) => {
                  const pName = app.patientName || app.patient_name || "مريض";
                  const pPhone = app.patientPhone || app.patient_phone || "";
                  const pDate = app.date || "";
                  const pTime = app.time || "صباحاً";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{pName}</td>
                      <td className="px-6 py-4 text-slate-600">{pPhone}</td>
                      <td className="px-6 py-4 text-slate-600">{pDate}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {pTime}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={app.status || "pending"}
                          onChange={(event) => updateStatus(app.id, event.target.value)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="pending">قيد المراجعة</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteAppointment(app.id)}
                          className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          title="حذف الموعد"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

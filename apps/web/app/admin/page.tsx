import { Users, Calendar, Megaphone, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-black text-slate-900 mb-8">نظرة عامة</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">إجمالي الأطباء</p>
            <h3 className="text-2xl font-black text-slate-900">4</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">حجوزات اليوم</p>
            <h3 className="text-2xl font-black text-slate-900">12</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">إعلانات نشطة</p>
            <h3 className="text-2xl font-black text-slate-900">1</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">إجمالي الحجوزات</p>
            <h3 className="text-2xl font-black text-slate-900">156</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">آخر الحجوزات</h2>
            <Link href="/admin/appointments" className="text-primary text-sm font-bold hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">المريض</th>
                  <th className="px-6 py-4">الطبيب</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-slate-800">محمد علي</td>
                  <td className="px-6 py-4 text-slate-600">د. أحمد محمود</td>
                  <td className="px-6 py-4 text-slate-600">2026-06-01</td>
                  <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold">قيد الانتظار</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-slate-800">رنا خليل</td>
                  <td className="px-6 py-4 text-slate-600">د. سارة عيسى</td>
                  <td className="px-6 py-4 text-slate-600">2026-05-20</td>
                  <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold">مؤكد</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Ads */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">إعلانات تنتهي قريباً</h2>
            <Link href="/admin/ads" className="text-primary text-sm font-bold hover:underline">
              إدارة الإعلانات
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">المعلن</th>
                  <th className="px-6 py-4">النوع</th>
                  <th className="px-6 py-4">تاريخ الانتهاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-slate-800">مركز رام الله لزراعة الأسنان</td>
                  <td className="px-6 py-4 text-slate-600">بانر</td>
                  <td className="px-6 py-4 text-red-500 font-bold">2026-05-25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

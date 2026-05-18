import { Users, Calendar, Megaphone, CheckCircle2, Store } from "lucide-react";
import Link from "next/link";
import { getDoctors, getAdvertisements, getStores, getAppointments } from "@/lib/data";

export default async function AdminDashboard() {
  const [doctors, ads, stores, appointments] = await Promise.all([
    getDoctors(),
    getAdvertisements(),
    getStores(),
    getAppointments()
  ]);

  const totalDoctors = doctors.length;
  const activeAds = ads.length;
  const activeStores = stores.length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === "pending").length;

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
        <p className="text-slate-500 mt-1">نظرة عامة حية ومباشرة من قاعدة البيانات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">إجمالي الأطباء</p>
            <h3 className="text-2xl font-black text-slate-900">{totalDoctors}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">المتاجر الطبية</p>
            <h3 className="text-2xl font-black text-slate-900">{activeStores}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">إعلانات نشطة</p>
            <h3 className="text-2xl font-black text-slate-900">{activeAds}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">الحجوزات السابقة</p>
            <h3 className="text-2xl font-black text-slate-900">{totalAppointments}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Registered Doctors */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">آخر الأطباء المسجلين</h2>
            <Link href="/admin/doctors" className="text-primary text-sm font-bold hover:underline">
              إدارة الأطباء
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {doctors.length === 0 ? (
              <p className="p-8 text-center text-slate-400 font-medium">لا يوجد أطباء مسجلين حالياً في قاعدة البيانات.</p>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">الاسم</th>
                    <th className="px-6 py-4">المدينة</th>
                    <th className="px-6 py-4">التخصص</th>
                    <th className="px-6 py-4">حالة التوثيق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.slice(0, 5).map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 font-bold text-slate-800">د. {doctor.name}</td>
                      <td className="px-6 py-4 text-slate-600">{doctor.city}</td>
                      <td className="px-6 py-4 text-slate-600">{doctor.specialty?.[0] || "طبيب أسنان"}</td>
                      <td className="px-6 py-4">
                        {doctor.verified ? (
                          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">موثق</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">قيد المراجعة</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Supplier Stores */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">المتاجر الطبية المسجلة</h2>
            <Link href="/admin/stores" className="text-primary text-sm font-bold hover:underline">
              إدارة المتاجر
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {stores.length === 0 ? (
              <p className="p-8 text-center text-slate-400 font-medium">لا يوجد متاجر طبية مسجلة حالياً في قاعدة البيانات.</p>
            ) : (
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">اسم الشركة</th>
                    <th className="px-6 py-4">المدينة</th>
                    <th className="px-6 py-4">المبيعات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.slice(0, 5).map((store) => (
                    <tr key={store.id}>
                      <td className="px-6 py-4 font-bold text-slate-800">{store.store_name || store.storeName}</td>
                      <td className="px-6 py-4 text-slate-600">{store.city || "فلسطين"}</td>
                      <td className="px-6 py-4 text-slate-600">{store.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

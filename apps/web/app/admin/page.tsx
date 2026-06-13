import { Users, Calendar, Megaphone, CheckCircle2, Store, Sparkles, KeyRound, UserCheck, ShieldAlert, BadgeCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import { getDoctors, getAdvertisements, getStores, getAppointments, getMedicalServices } from "@/lib/data";

export default async function AdminDashboard() {
  const [doctors, ads, stores, appointments, services] = await Promise.all([
    getDoctors(),
    getAdvertisements(),
    getStores(),
    getAppointments(),
    getMedicalServices()
  ]);

  const totalDoctors = doctors.length;
  const activeAds = ads.length;
  const activeStores = stores.length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === "pending").length;
  const totalServices = services.length;

  return (
    <div className="p-4 md:p-8 font-sans bg-slate-50 min-h-screen text-right" dir="rtl">
      {/* Dashboard Top Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">نظرة عامة حية ومباشرة من قاعدة البيانات لمنصة ملامح.ps</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-2xl text-xs font-black self-start">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>الأول من نوعه في فلسطين 🇵🇸</span>
        </div>
      </div>

      {/* Main Announcement Banner (Glassmorphic Dark Mode style) */}
      <div className="mb-10 bg-slate-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-sky-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sky-400 font-black text-xs uppercase tracking-wider mb-2">تحديث المنصة الشامل</p>
            <h2 className="text-xl md:text-2xl font-black leading-snug">إدارة الأقسام والخدمات مربوطة بالكامل</h2>
            <p className="text-slate-400 mt-2 font-medium text-sm md:text-base max-w-2xl leading-relaxed">
              عيادات التجميل، أخصائيي الجلدية، البصريات والعيون، ومراكز الأنف والأذن والحنجرة أصبحت مفعلة وجاهزة للتحكم.
            </p>
          </div>
          <Link 
            href="/admin/services" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-6 py-3.5 rounded-2xl font-black hover:from-amber-500 hover:to-amber-600 transition-all hover:scale-[1.02] active:scale-95 text-sm shadow-lg shadow-amber-500/10 self-start lg:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            إدارة الخدمات الطبية ({totalServices})
          </Link>
        </div>
      </div>

      {/* Quick Management Shortcuts */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Link 
          href="/admin/doctors" 
          className="group flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
            <UserCheck className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 group-hover:text-sky-600 transition-colors">إدارة الأطباء والعيادات</h3>
            <p className="mt-1 text-xs md:text-sm font-semibold text-slate-500">مراجعة بيانات الأطباء، الصور والتخصصات — {totalDoctors} طبيب مسجل</p>
          </div>
        </Link>
        <Link 
          href="/admin/doctor-accounts" 
          className="group flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <KeyRound className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 group-hover:text-emerald-600 transition-colors">حسابات دخول الأطباء</h3>
            <p className="mt-1 text-xs md:text-sm font-semibold text-slate-500">إدارة حسابات الدخول وكلمات المرور الخاصة بالأطباء لتعديل عياداتهم</p>
          </div>
        </Link>
        <Link
          href="/admin/discount-card"
          className="group flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 group-hover:text-blue-600 transition-colors">طلبات بطاقة الخصم</h3>
            <p className="mt-1 text-xs md:text-sm font-semibold text-slate-500">مراجعة الطلبات، تفعيل المشتركين، وإظهار حالة البطاقة للطبيب داخل المواعيد</p>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs md:text-sm">إجمالي الأطباء</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{totalDoctors}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs md:text-sm">المتاجر الطبية</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{activeStores}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs md:text-sm">إعلانات نشطة</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{activeAds}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center gap-5 transition hover:shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs md:text-sm">الحجوزات السابقة</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">{totalAppointments}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Registered Doctors Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/85 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-950">آخر الأطباء المسجلين</h2>
            <Link href="/admin/doctors" className="text-sky-600 text-xs font-black hover:text-sky-700 transition">
              إدارة الأطباء
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {doctors.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold text-sm">
                لا يوجد أطباء مسجلين حالياً في قاعدة البيانات.
              </div>
            ) : (
              <table className="w-full text-right text-sm border-collapse min-w-[500px]">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100">الاسم</th>
                    <th className="px-6 py-4 border-b border-slate-100">المدينة</th>
                    <th className="px-6 py-4 border-b border-slate-100">التخصص</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-center">حالة التوثيق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {doctors.slice(0, 5).map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-900">د. {doctor.name}</td>
                      <td className="px-6 py-4 text-slate-600">{doctor.city}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl text-xs font-black border border-slate-200/30">
                          {Array.isArray(doctor.specialty) ? doctor.specialty[0] : (doctor.specialty || doctor.category || "عام")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {doctor.verified ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black border border-emerald-100">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            موثق
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-black border border-amber-100">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            مراجعة
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Supplier Stores Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/85 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-950">المتاجر الطبية المسجلة</h2>
            <Link href="/admin/stores" className="text-sky-600 text-xs font-black hover:text-sky-700 transition">
              إدارة المتاجر
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {stores.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold text-sm">
                لا يوجد متاجر طبية مسجلة حالياً في قاعدة البيانات.
              </div>
            ) : (
              <table className="w-full text-right text-sm border-collapse min-w-[500px]">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4 border-b border-slate-100">اسم الشركة</th>
                    <th className="px-6 py-4 border-b border-slate-100">المدينة</th>
                    <th className="px-6 py-4 border-b border-slate-100">رقم الهاتف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {stores.slice(0, 5).map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-900">{store.store_name || store.storeName}</td>
                      <td className="px-6 py-4 text-slate-600">{store.city || "فلسطين"}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono" dir="ltr">{store.phone}</td>
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

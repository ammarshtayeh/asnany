import { Users, CheckCircle2, Store, Sparkles, KeyRound, UserCheck, ShieldAlert, BadgeCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import { getAdminDashboardStats, getAdminRecentDoctors, getAdminRecentStores } from "@/lib/admin-dashboard";
import AdminDashboardVisuals from "@/components/admin/AdminDashboardVisuals";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default async function AdminDashboard() {
  const [stats, doctors, stores] = await Promise.all([
    getAdminDashboardStats(),
    getAdminRecentDoctors(5),
    getAdminRecentStores(5),
  ]);

  const { totalDoctors, verifiedDoctors, pendingDoctors, activeAds, activeStores, totalAppointments, pendingAppointments, totalServices } = stats;

  const statCards = [
    { label: "إجمالي الأطباء", value: totalDoctors, icon: Users, tone: "bg-[#eef5f3] text-primary" },
    { label: "موثّقون", value: verifiedDoctors, icon: BadgeCheck, tone: "bg-[#e8f2ee] text-[#0c5e47]" },
    { label: "بانتظار التوثيق", value: pendingDoctors, icon: ShieldAlert, tone: "bg-[#f7f1e0] text-[#8a7020]" },
    { label: "إجمالي الحجوزات", value: totalAppointments, icon: CheckCircle2, tone: "bg-[#eef5f3] text-primary" },
    { label: "حجوزات معلّقة", value: pendingAppointments, icon: Sparkles, tone: "bg-[#f7f1e0] text-[#8a7020]" },
    { label: "متاجر + إعلانات", value: activeStores + activeAds, icon: Store, tone: "bg-[#eef5f3] text-primary" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f0] p-3 font-sans text-right sm:p-4 md:p-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">لوحة التحكم</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">نظرة عامة حية ومباشرة من قاعدة البيانات لمنصة ملامح.ps</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/15 bg-[#eef5f3] px-4 py-2 text-xs font-extrabold text-primary">
          <Sparkles className="h-4 w-4" />
          <span>الأول من نوعه في فلسطين 🇵🇸</span>
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[1.5rem] bg-primary p-5 text-white shadow-soft sm:mb-8 sm:p-6 md:p-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-white/80">تحديث المنصة الشامل</p>
            <h2 className="font-display text-lg font-extrabold leading-snug text-white sm:text-xl md:text-2xl">
              إدارة الأقسام والخدمات مربوطة بالكامل
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-white/80 md:text-base">
              عيادات التجميل، أخصائيي الجلدية، البصريات والعيون، ومراكز الأنف والأذن والحنجرة أصبحت مفعلة وجاهزة للتحكم.
            </p>
          </div>
          <Link href="/admin/services" className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-extrabold text-primary transition hover:bg-[#f7f5f0] lg:self-auto">
            <Sparkles className="h-4 w-4" />
            إدارة الخدمات الطبية ({totalServices})
          </Link>
        </div>
      </div>

      <AdminDashboardVisuals stats={stats} />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {[
          {
            href: "/admin/doctors",
            icon: UserCheck,
            title: "إدارة الأطباء والعيادات",
            desc: `مراجعة بيانات الأطباء، الصور والتخصصات — ${totalDoctors} طبيب مسجل`,
          },
          {
            href: "/admin/doctor-accounts",
            icon: KeyRound,
            title: "حسابات دخول الأطباء",
            desc: "إدارة حسابات الدخول وكلمات المرور الخاصة بالأطباء لتعديل عياداتهم",
          },
          {
            href: "/admin/discount-card",
            icon: CreditCard,
            title: "طلبات بطاقة الخصم",
            desc: "مراجعة الطلبات، تفعيل المشتركين، وإظهار حالة البطاقة للطبيب داخل المواعيد",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-4 rounded-[1.25rem] border border-[#e8e4dc] bg-white p-4 shadow-soft transition hover:border-primary/25 hover:shadow-bento-hover sm:gap-5 sm:p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef5f3] text-primary transition group-hover:bg-primary group-hover:text-white sm:h-14 sm:w-14">
              <item.icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-950 transition group-hover:text-primary sm:text-lg">{item.title}</h3>
              <p className="mt-1 text-xs font-semibold leading-6 text-slate-500 sm:text-sm">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="flex items-center gap-3 rounded-[1.25rem] border border-[#e8e4dc] bg-white p-3 shadow-soft sm:gap-4 sm:p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${card.tone}`}>
              <card.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold text-slate-500 sm:text-xs">{card.label}</p>
              <h3 className="mt-0.5 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">
                <AnimatedCounter target={card.value} duration={1000} />
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-[#e8e4dc] bg-white shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[#faf8f5]/80 px-4 py-4 sm:px-6">
            <h2 className="font-display text-base font-extrabold text-slate-950 sm:text-lg">آخر الأطباء المسجلين</h2>
            <Link href="/admin/doctors" className="shrink-0 text-xs font-extrabold text-primary">
              إدارة الأطباء
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {doctors.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-slate-400 sm:p-10">لا يوجد أطباء مسجلين حالياً في قاعدة البيانات.</div>
            ) : (
              <table className="w-full min-w-[480px] border-collapse text-right text-sm">
                <thead className="bg-[#faf8f5] text-xs font-bold text-slate-500">
                  <tr>
                    <th className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">الاسم</th>
                    <th className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">المدينة</th>
                    <th className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">التخصص</th>
                    <th className="border-b border-slate-100 px-4 py-3 text-center sm:px-6 sm:py-4">حالة التوثيق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="transition-colors hover:bg-[#faf8f5]/70">
                      <td className="px-4 py-3 font-extrabold text-slate-900 sm:px-6 sm:py-4">د. {doctor.name}</td>
                      <td className="px-4 py-3 text-slate-600 sm:px-6 sm:py-4">{doctor.city}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <span className="rounded-full bg-[#f3f0ea] px-2.5 py-1 text-xs font-extrabold text-slate-600">
                          {Array.isArray(doctor.specialty) ? doctor.specialty[0] : doctor.specialty || doctor.category || "عام"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center sm:px-6 sm:py-4">
                        {doctor.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            موثق
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                            <ShieldAlert className="h-3.5 w-3.5" />
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

        <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-[#e8e4dc] bg-white shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-[#faf8f5]/80 px-4 py-4 sm:px-6">
            <h2 className="font-display text-base font-extrabold text-slate-950 sm:text-lg">المتاجر الطبية المسجلة</h2>
            <Link href="/admin/stores" className="shrink-0 text-xs font-extrabold text-primary">
              إدارة المتاجر
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            {stores.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-slate-400 sm:p-10">لا يوجد متاجر طبية مسجلة حالياً في قاعدة البيانات.</div>
            ) : (
              <table className="w-full min-w-[420px] border-collapse text-right text-sm">
                <thead className="bg-[#faf8f5] text-xs font-bold text-slate-500">
                  <tr>
                    <th className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">اسم الشركة</th>
                    <th className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">المدينة</th>
                    <th className="border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">رقم الهاتف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {stores.map((store) => (
                    <tr key={store.id} className="transition-colors hover:bg-[#faf8f5]/70">
                      <td className="px-4 py-3 font-extrabold text-slate-900 sm:px-6 sm:py-4">{store.store_name || store.storeName}</td>
                      <td className="px-4 py-3 text-slate-600 sm:px-6 sm:py-4">{store.city || "فلسطين"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 sm:px-6 sm:py-4" dir="ltr">
                        {store.phone}
                      </td>
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

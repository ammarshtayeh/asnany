import Link from "next/link";
import { ArrowRight, CalendarCheck2, MapPin, Phone, UserRound } from "lucide-react";

import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices, getDoctorById } from "@/lib/data";
import type { Doctor as SharedDoctor } from "@pal-dental/shared";

function normalizeDoctorId(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function BookingDoctorCard({ doctor }: { doctor: SharedDoctor }) {
  const workingHours = doctor.working_hours || {};
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 backdrop-blur-md shadow-2xl shadow-slate-950/5">
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 px-6 py-6 text-white border-b border-amber-500/15 relative">
        <div className="absolute top-0 right-0 h-full w-24 bg-amber-500/5 blur-xl pointer-events-none" />
        <p className="text-xs font-black text-amber-400 tracking-wider">تم فتح الحجز على الطبيب المختار</p>
        <h2 className="mt-2 text-2xl font-black">{doctor.name}</h2>
        <p className="mt-1 text-sm font-bold text-slate-300">
          {Array.isArray(doctor.specialty) ? doctor.specialty.join("، ") : doctor.specialty || "طبيب أسنان"} - {doctor.city}
        </p>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm leading-7 text-slate-600 font-semibold">
            إذا وصلت من صفحة الطبيب أو الخريطة، فأنت الآن داخل مسار حجز مرتبط مباشرة بهذا الملف. هذا يسهّل عليك استكمال الموعد بسرعة وبشكل مباشر.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-black">
            {doctor.is_available !== false ? (
              <span className="rounded-full bg-emerald-50 border border-emerald-200/50 px-3 py-1.5 text-emerald-700">متاح حالياً</span>
            ) : (
              <span className="rounded-full bg-rose-50 border border-rose-200/50 px-3 py-1.5 text-rose-700">غير متاح الآن</span>
            )}
            {doctor.verified ? (
              <span className="rounded-full bg-slate-950 border border-slate-800 px-3 py-1.5 text-amber-400">موثق</span>
            ) : null}
            {doctor.is_featured ? (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-700">مميز</span>
            ) : null}
            {doctor.accepts_insurance ? (
              <span className="rounded-full bg-sky-50 border border-sky-200/50 px-3 py-1.5 text-sky-700">يقبل التأمين</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/doctors/${doctor.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-900 px-5 py-3.5 text-xs sm:text-sm font-black text-white transition hover:scale-[1.02]"
            >
              <UserRound className="h-4 w-4" />
              فتح ملف الطبيب
            </Link>
            <Link
              href={`/doctors/${doctor.id}#booking`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3.5 text-xs sm:text-sm font-black text-slate-950 transition hover:from-amber-300 hover:to-amber-400 hover:scale-[1.02]"
            >
              <CalendarCheck2 className="h-4 w-4" />
              الذهاب لنموذج الحجز
            </Link>
          </div>

          {doctor.availability_note ? (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">تنبيه الدوام</p>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{doctor.availability_note}</p>
            </div>
          ) : null}

          {Object.keys(workingHours).length ? (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">الدوام الأسبوعي</p>
              <div className="mt-3 grid gap-2 text-sm font-black text-slate-600 sm:grid-cols-2">
                {Object.entries(workingHours).slice(0, 4).map(([day, value]) => (
                  <span key={day} className="rounded-xl bg-white border border-slate-100 px-3 py-2 text-xs">
                    {day}: {typeof value === "string" ? value : JSON.stringify(value)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/50 p-4">
          {doctor.image_url ? (
            <div className="mb-4 h-52 overflow-hidden rounded-2xl bg-slate-200 relative border border-slate-200">
              <img src={doctor.image_url} alt={doctor.name} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="space-y-3 text-xs sm:text-sm font-black text-slate-700">
            {doctor.address || doctor.area ? (
              <div className="flex items-start gap-2 bg-white border border-slate-100 p-3 rounded-xl">
                <MapPin className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>{doctor.address || doctor.area}</span>
              </div>
            ) : null}
            {doctor.phone || doctor.whatsapp ? (
              <div className="flex items-start gap-2 bg-white border border-slate-100 p-3 rounded-xl">
                <Phone className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{doctor.phone || doctor.whatsapp}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams?: Promise<{ doctorId?: string | string[] }>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const doctorId = normalizeDoctorId(resolvedSearchParams.doctorId);
  const [listings, selectedDoctor] = await Promise.all([
    getMedicalServices("booking"),
    doctorId ? getDoctorById(doctorId) : Promise.resolve(undefined),
  ]);

  return (
    <ServiceLandingPage
      badge="الحجز الإلكتروني"
      title="نظام حجز ذكي للمرضى والأطباء"
      description="ابدأ رحلتك من هنا: اختر الطبيب أو الخدمة المناسبة، وواصل مباشرة مع الملف المختار أو مع قائمة الحجز المتاحة حسب التخصص والمدينة."
      features={[
        "اختيار الطبيب أو الخدمة أو المدينة مع مسار واضح للحجز.",
        "الانتقال مباشرة إلى ملف الطبيب إذا فتحت الصفحة من زر احجز الآن.",
        "مقارنة الخدمات المتاحة ومزوديها في مكان واحد.",
        "تواصل سريع مع الطبيب أو مقدم الخدمة بعد اختيارك.",
      ]}
      actions={[
        { label: "ابحث عن طبيب", href: "/doctors/search" },
        { label: "تابع حجوزاتك", href: "/appointments" },
      ]}
      listings={listings}
      emptyLabel="سيتم عرض خدمات الحجز المتاحة قريباً."
      topSlot={selectedDoctor ? <BookingDoctorCard doctor={selectedDoctor} /> : undefined}
    />
  );
}

import Link from "next/link";
import { ArrowRight, CalendarCheck2, MapPin, Phone, UserRound } from "lucide-react";

import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices, getDoctorById } from "@/lib/data";
import type { Doctor as SharedDoctor } from "@pal-dental/shared";

function normalizeDoctorId(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function BookingDoctorCard({ doctor }: { doctor: SharedDoctor }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-sky-100 bg-white shadow-xl shadow-sky-100/40">
      <div className="bg-gradient-to-l from-sky-600 to-slate-900 px-6 py-5 text-white">
        <p className="text-xs font-black text-sky-100">تم فتح الحجز على الطبيب المختار</p>
        <h2 className="mt-2 text-2xl font-black">{doctor.name}</h2>
        <p className="mt-1 text-sm font-medium text-sky-100/90">
          {Array.isArray(doctor.specialty) ? doctor.specialty.join("، ") : doctor.specialty || "طبيب أسنان"} - {doctor.city}
        </p>
      </div>

      <div className="grid gap-4 p-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm leading-7 text-slate-600 font-medium">
            إذا وصلت من صفحة الطبيب أو الخريطة، فأنت الآن داخل حجز مرتبط مباشرة بهذا الملف. هذا يفيدك في استكمال الموعد بسرعة بدون ما تضيع بين صفحة عامة وصفحة الطبيب.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
            {doctor.verified ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">موثق</span>
            ) : null}
            {doctor.is_featured ? (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">مميز</span>
            ) : null}
            {doctor.accepts_insurance ? (
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">يقبل التأمين</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/doctors/${doctor.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              <UserRound className="h-4 w-4" />
              فتح ملف الطبيب
            </Link>
            <Link
              href={`/doctors/${doctor.id}#booking`}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-5 py-3 text-sm font-black text-sky-700 transition hover:bg-sky-100"
            >
              <CalendarCheck2 className="h-4 w-4" />
              الذهاب لنموذج الحجز
            </Link>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          {doctor.image_url ? (
            <div className="mb-4 h-48 overflow-hidden rounded-2xl bg-slate-200">
              <img src={doctor.image_url} alt={doctor.name} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="space-y-3 text-sm font-bold text-slate-700">
            {doctor.address || doctor.area ? (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-sky-600" />
                <span>{doctor.address || doctor.area}</span>
              </div>
            ) : null}
            {doctor.phone || doctor.whatsapp ? (
              <div className="flex items-start gap-2">
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
        { label: "سجل عيادتك", href: "/join" },
      ]}
      listings={listings}
      emptyLabel="سيتم عرض خدمات الحجز المتاحة قريباً."
      topSlot={selectedDoctor ? <BookingDoctorCard doctor={selectedDoctor} /> : undefined}
    />
  );
}

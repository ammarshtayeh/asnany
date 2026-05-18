import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function BookingPage() {
  const listings = await getMedicalServices("booking");

  return (
    <ServiceLandingPage
      badge="الحجز الإلكتروني"
      title="نظام حجز ذكي للمرضى والأطباء"
      description="تجربة حجز واضحة تبدأ باختيار الطبيب أو المركز والموعد المناسب، ثم تأكيد الطلب وإرساله لصاحب الخدمة لإدارته من لوحة التحكم."
      features={[
        "اختيار الطبيب أو المركز والمدينة والخدمة المطلوبة.",
        "تأكيد الحجز وإرسال تنبيهات للمريض وصاحب الخدمة.",
        "لوحة للطبيب لإدارة المواعيد والمرضى والتقارير اليومية.",
        "إمكانية إضافة رسائل SMS وواتساب وتذكيرات تلقائية لاحقاً.",
      ]}
      actions={[
        { label: "ابحث واحجز", href: "/" },
        { label: "سجل عيادتك", href: "/join" },
      ]}
      listings={listings}
      emptyLabel="لا توجد باقات أو خدمات حجز مفعلة بعد."
    />
  );
}

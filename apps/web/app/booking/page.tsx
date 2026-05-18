import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function BookingPage() {
  const listings = await getMedicalServices("booking");

  return (
    <ServiceLandingPage
      badge="الحجز الإلكتروني"
      title="نظام حجز ذكي للمرضى والأطباء"
      description="تجربة حجز واضحة تبدأ باختيار الطبيب أو المركز والموعد المناسب، ثم إرسال الطلب وتأكيده بطريقة سهلة ومنظمة."
      features={[
        "اختيار الطبيب أو المركز والمدينة والخدمة المطلوبة.",
        "تأكيد الحجز وإرسال تنبيهات للمريض وصاحب الخدمة.",
        "متابعة منظمة للمواعيد والطلبات من طرف مقدم الخدمة.",
        "إمكانية إضافة رسائل SMS وواتساب وتذكيرات تلقائية لاحقاً.",
      ]}
      actions={[
        { label: "ابحث واحجز", href: "/" },
        { label: "سجل عيادتك", href: "/join" },
      ]}
      listings={listings}
      emptyLabel="سيتم عرض خدمات الحجز المتاحة قريباً."
    />
  );
}

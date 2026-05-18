import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function LabsPage() {
  const listings = await getMedicalServices("lab");

  return (
    <ServiceLandingPage
      badge="المختبرات الطبية"
      title="دليل المختبرات وحجز الفحوصات"
      description="مساحة مخصصة للمختبرات الطبية تشمل أسعار الفحوصات، طلب فحص منزلي، وجدولة التحاليل ونتائج إلكترونية كمرحلة تطوير."
      features={[
        "ملفات مختبرات تشمل الفحوصات المتاحة، الأسعار، أوقات العمل، والموقع.",
        "طلب فحص منزلي أو حجز زيارة للمختبر من خلال نموذج واضح.",
        "تهيئة مستقبلية لرفع النتائج الإلكترونية وربطها بحساب المستخدم.",
        "اشتراكات للمختبرات وحملات تعريفية بالخدمات الجديدة.",
      ]}
      actions={[
        { label: "أضف مختبرك", href: "/join" },
        { label: "اطلب شراكة", href: "/advertise" },
      ]}
      listings={listings}
      emptyLabel="لا توجد مختبرات مفعلة بعد. أضف أول مختبر من لوحة التحكم."
    />
  );
}

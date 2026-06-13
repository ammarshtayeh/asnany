import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export const metadata = {
  title: "المختبرات الطبية | ملامح",
  description: "تصفّح المختبرات الطبية المعتمدة في فلسطين — فحوصات، أسعار، وخدمة منزلية.",
};

export default async function LabsPage() {
  const listings = await getMedicalServices("lab");

  return (
    <ServiceLandingPage
      badge="المختبرات الطبية"
      title="دليل المختبرات وطلب الفحوصات"
      description="ابحث عن المختبر الأقرب إليك وتعرّف على الخدمات والأسعار قبل زيارتك. شفافية كاملة في المعلومات لتجربة أهدأ وأوضح."
      features={[
        "ملفات مختبرات تشمل الفحوصات المتاحة، الأسعار، أوقات العمل، والموقع.",
        "إمكانية طلب فحص منزلي أو حجز زيارة مباشرةً من صفحة المختبر.",
        "معلومات محدّثة تساعدك على المقارنة واختيار الأنسب لاحتياجاتك.",
        "اشتراكات للمختبرات وحملات تعريفية بالخدمات الجديدة.",
      ]}
      actions={[
        { label: "سجّل مختبرك", href: "/join" },
        { label: "اطلب شراكة", href: "/advertise" },
      ]}
      listings={listings}
      emptyLabel="سيتم عرض المختبرات الطبية المعتمدة قريباً."
      detailsBasePath="/labs"
    />
  );
}

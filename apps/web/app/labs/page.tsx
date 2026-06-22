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
      emptyCta={{
        title: "كن أول مختبر معتمد على ملامح",
        description: "سجّل مختبرك ليظهر في دليل التحاليل — معلومات واضحة، تواصل مباشر، ووصول لمرضى يبحثون عن فحوصات موثوقة.",
        primaryHref: "/join",
        primaryLabel: "سجّل مختبرك",
        secondaryHref: "/advertise",
        secondaryLabel: "أعلن معنا",
        whatsappMessage: "مرحباً، أريد تسجيل مختبر طبي على ملامح.ps",
        tips: ["رام الله", "نابلس", "الخليل", "تحاليل منزلية"],
      }}
      detailsBasePath="/labs"
    />
  );
}

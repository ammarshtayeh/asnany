import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function ConsultationsPage() {
  const listings = await getMedicalServices("consultation");

  return (
    <ServiceLandingPage
      badge="الاستشارات الطبية"
      title="استشارات كتابية وصوتية ومرئية"
      description="نواة خدمة الاستشارات الرقمية: يشرح المريض حالته، يرفع صور الأشعة أو التقارير، ثم يتم توجيهه للطبيب أو التخصص المناسب."
      features={[
        "استشارة كتابية أولية مع إمكانية إرفاق الصور والتقارير.",
        "تهيئة لاحقة لاستشارات صوتية ومرئية ودردشة مباشرة.",
        "فرز الحالات حسب التخصص: عصب، تقويم، زراعة، أطفال، تجميل.",
        "استشارات مميزة مدفوعة ومتابعة الحالات بعد الزيارة.",
      ]}
      actions={[
        { label: "ابدأ من البحث", href: "/" },
        { label: "انضم كطبيب مستشار", href: "/join" },
      ]}
      listings={listings}
      emptyLabel="سيتم عرض خدمات الاستشارة المعتمدة قريباً."
    />
  );
}

import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function PartnersPage() {
  const listings = await getMedicalServices("partner");

  return (
    <ServiceLandingPage
      badge="الشركات والمنتجات الطبية"
      title="مساحة للشركات الداعمة والمنتجات الطبية"
      description="قسم للشركات الطبية وشركات الأدوية والتجميل والأجهزة والمنتجات، مع فرص إعلان ورعاية وحملات تسويق موجهة."
      features={[
        "ملفات للشركات والمنتجات والعروض الخاصة.",
        "إعلانات بانر وفيديو ومقالات ممولة وحملات دعائية.",
        "ربط الشركات بالأطباء والعيادات والمختبرات والجمهور.",
        "تهيئة مستقبلية لمتجر إلكتروني لمنتجات الأسنان والعناية.",
      ]}
      actions={[
        { label: "أعلن معنا", href: "/advertise" },
        { label: "تصفح الموردين", href: "/stores" },
      ]}
      listings={listings}
      emptyLabel="لا توجد شركات شريكة مفعلة بعد. أضف أول شريك من لوحة التحكم."
    />
  );
}

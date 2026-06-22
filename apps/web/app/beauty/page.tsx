import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export const metadata = {
  title: "مراكز التجميل | ملامح",
  description: "اكتشف مراكز التجميل المعتمدة — خدمات الليزر، البشرة، الفيلر والبوتوكس، وزراعة الشعر في فلسطين.",
};

export default async function BeautyPage() {
  const listings = await getMedicalServices("beauty");

  return (
    <ServiceLandingPage
      badge="مراكز التجميل"
      title="دليل مراكز التجميل والعناية"
      description="تصفّح أبرز مراكز التجميل المعتمدة في فلسطين — من خدمات البشرة والليزر إلى الفيلر وزراعة الشعر. كل ما تحتاجه في مكان واحد، بمعلومات موثوقة وشفافة."
      features={[
        "ملفات تفصيلية تشمل الخدمات، الأسعار التقريبية، أوقات الدوام، والصور.",
        "عروض موسمية وصور قبل وبعد عند توفرها وموافقة المركز.",
        "فلترة حسب المدينة، نوع الخدمة، والسعر لتسهيل اختيارك.",
        "ظهور مميز ومساحات إعلانية مخصصة للمراكز والشركات.",
      ]}
      actions={[
        { label: "سجّل مركزك", href: "/join" },
        { label: "أعلن عن عرض", href: "/advertise" },
      ]}
      listings={listings}
      emptyCta={{
        title: "سجّل مركز التجميل الخاص بك",
        description: "اعرض خدماتك — ليزر، فيلر، بشرة، ابتسامة — أمام جمهور يبحث عن عناية موثوقة في فلسطين.",
        primaryHref: "/join",
        primaryLabel: "انضم كشريك",
        secondaryHref: "/advertise",
        secondaryLabel: "أعلن عن عرض",
        whatsappMessage: "مرحباً، أريد تسجيل مركز تجميل على ملامح.ps",
        tips: ["ليزر", "فيلر وبوتوكس", "تبييض أسنان", "عناية بشرة"],
      }}
      detailsBasePath="/beauty"
    />
  );
}

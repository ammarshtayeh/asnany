import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function BeautyPage() {
  const listings = await getMedicalServices("beauty");

  return (
    <ServiceLandingPage
      badge="مراكز التجميل"
      title="دليل مراكز التجميل والعناية بالبشرة"
      description="قسم متخصص لخدمات الليزر، البشرة، الفيلر والبوتوكس، زراعة الشعر، والعروض التجميلية الموثوقة في فلسطين."
      features={[
        "ملفات مراكز تشمل الخدمات، المدينة، الصور، أوقات الدوام، وطرق التواصل.",
        "عروض تجميل موسمية وصور قبل وبعد عند توفرها وبموافقة المركز.",
        "فلترة حسب المدينة، نوع الخدمة، السعر التقريبي، والتقييم.",
        "مساحة إعلانية للشركات والمراكز وحملات ظهور مميز.",
      ]}
      actions={[
        { label: "سجل مركزك", href: "/join" },
        { label: "أعلن عن عرض", href: "/advertise" },
      ]}
      listings={listings}
      emptyLabel="لا توجد مراكز تجميل مفعلة بعد. أضف أول مركز من لوحة التحكم."
    />
  );
}

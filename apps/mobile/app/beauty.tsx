import { ServicePage } from "../components/ServicePage";

export default function BeautyScreen() {
  return (
    <ServicePage
      emoji="💆"
      badge="مراكز التجميل"
      title="دليل مراكز التجميل والعناية بالبشرة"
      description="قسم متخصص لخدمات الليزر، البشرة، الفيلر والبوتوكس، زراعة الشعر، والعروض التجميلية الموثوقة في فلسطين."
      accentColor="#ec4899"
      serviceType="beauty"
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
      emptyLabel="سيتم عرض مراكز التجميل المعتمدة قريباً."
    />
  );
}

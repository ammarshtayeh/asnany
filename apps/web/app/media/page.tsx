import ServiceLandingPage from "@/components/ServiceLandingPage";
import { getMedicalServices } from "@/lib/data";

export default async function MediaPage() {
  const listings = await getMedicalServices("media");

  return (
    <ServiceLandingPage
      badge="الميديا الطبية"
      title="أخبار، مقالات، فيديوهات، ودراسات طبية"
      description="القسم الإعلامي للمنصة: محتوى صحي موثوق، تغطية فعاليات، مقابلات، فيديوهات توعوية، ودراسات مبسطة للجمهور."
      features={[
        "أخبار طب الأسنان والتجميل والمؤتمرات والإنجازات الطبية.",
        "مقالات توعية عن الوقاية، مشاكل الأسنان، التغذية، والعادات الصحية.",
        "فيديوهات قصيرة ومقابلات وتغطيات إعلامية قابلة للنشر على السوشال.",
        "قسم دراسات وأبحاث بلغة مبسطة مع مصادر ومراجعة طبية.",
      ]}
      actions={[
        { label: "اقرأ المقالات", href: "/blog" },
        { label: "رعاية محتوى", href: "/advertise" },
      ]}
      listings={listings}
      emptyLabel="لا توجد جهات إعلامية أو رعايات محتوى مفعلة بعد."
    />
  );
}

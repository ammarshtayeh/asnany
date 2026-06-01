import { StaticPage } from "../components/StaticPage";

export default function AboutScreen() {
  return (
    <StaticPage
      title="عن أسناني"
      subtitle="منصة تجمع البحث والحجز ولوحات الطبيب والأدمن في تجربة واحدة متناسقة."
      points={["بحث سريع عن الأطباء", "حجز يجمع بيانات المريض الأساسية", "لوحة خاصة للطبيب", "إدارة مستقلة للأدمن"]}
    />
  );
}

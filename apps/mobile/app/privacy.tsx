import { StaticPage } from "../components/StaticPage";

export default function PrivacyScreen() {
  return (
    <StaticPage
      title="سياسة الخصوصية"
      subtitle="حماية البيانات داخل التطبيق والموقع، مع توضيح ما نجمعه وكيف نستخدمه."
      points={[
        "المنصة فكرة ومشروع عمار اشتية وجميع الحقوق محفوظة",
        "نستخدم البيانات للحجز وإدارة المواعيد فقط",
        "لا نبيع البيانات لأطراف خارجية",
      ]}
    />
  );
}

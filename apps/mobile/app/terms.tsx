import { StaticPage } from "../components/StaticPage";

export default function TermsScreen() {
  return <StaticPage title="الشروط" subtitle="ملخص الشروط وسياسة الاستخدام داخل التطبيق." points={["خصوصية البيانات", "وضوح الأدوار", "حفظ المعلومات الطبية"]} />;
}

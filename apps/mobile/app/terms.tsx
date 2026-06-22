import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { StackCard, StackPageLayout, StackSecondaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";

const CLAUSES = [
  { num: "1", title: "طبيعة الخدمات ومسؤوليتنا", body: "تعتبر منصة ملامح.ps بمثابة دليل جغرافي وإعلامي يسهل ربط المرضى بالعيادات والأطباء. نحن لا نقدم أي استشارات طبية ولا نتحمل أي مسؤولية قانونية ناتجة عن العلاجات الطبية أو القرارات المهنية المتخذة داخل العيادات المسجلة." },
  { num: "2", title: "شروط تسجيل وعضوية الأطباء", body: "يلتزم كل طبيب يسجل عيادته بتقديم معلومات حقيقية وصحيحة ومحدثة. تحتفظ الإدارة بالحق في تعليق أو حذف أي حساب يتبين تقديمه لمعلومات مضللة." },
  { num: "3", title: "سياسة التقييمات والمراجعات", body: "تتيح المنصة للمرضى إضافة تقييماتهم لخدمات العيادات. نلتزم بنشر المراجعات بشفافية ومراجعتها لمنع الإساءة أو التقييمات الكاذبة." },
  { num: "4", title: "الخصوصية وحماية البيانات", body: "نحن نحترم خصوصية المرضى والأطباء ونتعهد بالحفاظ على سرية وتأمين كافة البيانات الشخصية ولن نقوم بنشرها أو بيعها لأي جهات خارجية." },
];

export default function TermsScreen() {
  return (
    <StackPageLayout
      badge="✨ الضوابط والاتفاقية القانونية"
      title="الشروط والأحكام"
      subtitle="يرجى قراءة شروط وأحكام استخدام بوابة ملامح.ps"
    >
      <StackCard>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 10 }}>⚖️ مقدمة وبنود الاستخدام</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right", marginBottom: 10 }}>
          مرحباً بكم في ملامح.ps. يمثل دخولك وتصفحك للموقع أو التطبيق موافقة تامة على الالتزام بكافة البنود والشروط الواردة في هذه الاتفاقية.
        </Text>
        <Pressable onPress={() => router.push("/privacy")}>
          <Text style={{ color: theme.teal, fontWeight: "900", fontSize: 13, textAlign: "right" }}>← راجع أيضاً سياسة الخصوصية</Text>
        </Pressable>
      </StackCard>

      {CLAUSES.map((clause) => (
        <StackCard key={clause.num}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 13, fontWeight: "900", color: theme.teal }}>{clause.num}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: "900", color: theme.text, flex: 1, textAlign: "right" }}>{clause.title}</Text>
          </View>
          <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right" }}>{clause.body}</Text>
        </StackCard>
      ))}

      <StackSecondaryButton label="العودة للرئيسية" onPress={() => router.replace("/")} />
    </StackPageLayout>
  );
}

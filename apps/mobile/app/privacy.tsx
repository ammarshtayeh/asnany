import { Text, View } from "react-native";
import { router } from "expo-router";
import { StackCard, StackPageLayout, StackSecondaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";

const ITEMS = [
  { emoji: "🔒", bg: "#eff6ff", title: "البيانات التي نجمعها", desc: "الاسم، رقم الهاتف، رقم الهوية، العنوان، بيانات الحجز، والمعلومات التي يضيفها الطبيب أو الأدمن لإتمام الخدمة." },
  { emoji: "✅", bg: "#f0fdf4", title: "كيف نستخدمها", desc: "تُستخدم البيانات لإرسال طلبات الحجز، إدارة جدول الطبيب، تحسين نتائج البحث، وتسهيل التواصل داخل المنصة." },
  { emoji: "💾", bg: "#faf5ff", title: "حفظ البيانات", desc: "تُحفظ البيانات داخل قاعدة البيانات الخاصة بالمنصة وفق الصلاحيات المخصصة لكل من المريض والطبيب والأدمن." },
  { emoji: "🤝", bg: "#fff1f2", title: "مشاركة البيانات", desc: "لا نبيع بيانات المستخدمين لأطراف خارجية. بيانات الطبيب تُعرض للمستخدمين ضمن نطاق الخدمة فقط." },
];

const NOTES = [
  "قد نحدّث السياسة عند إضافة خدمات جديدة أو تحسينات تشغيلية.",
  "استخدامك للموقع أو التطبيق يعني موافقتك على هذه السياسة.",
  "أي بيانات علاجية أو مواعيد تظهر للطبيب بهدف إدارة الحجز فقط.",
];

export default function PrivacyScreen() {
  return (
    <StackPageLayout
      badge="✨ سياسة الخصوصية وحماية البيانات"
      title="سياسة الخصوصية"
      subtitle="نحافظ على بياناتك الطبية والشخصية ضمن تجربة واضحة وآمنة"
    >
      <StackCard>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 10 }}>🛡️ سياسة الخصوصية</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right" }}>
          منصة ملامح.ps هي فكرة ومشروع عمار اشتية، وجميع الحقوق محفوظة له. تم إعداد هذه المنصة لتسهيل الوصول إلى أطباء وصحة وجمال الوجه في فلسطين مع الالتزام بحماية بيانات المستخدمين.
        </Text>
      </StackCard>

      {ITEMS.map((item) => (
        <StackCard key={item.title}>
          <View style={{ flexDirection: "row-reverse", gap: 12, alignItems: "flex-start" }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.bg, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: theme.textMuted, fontWeight: "600", textAlign: "right", lineHeight: 20 }}>{item.desc}</Text>
            </View>
          </View>
        </StackCard>
      ))}

      <StackCard>
        <Text style={{ fontSize: 15, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 12 }}>ملاحظات مهمة</Text>
        {NOTES.map((note) => (
          <Text key={note} style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", textAlign: "right", lineHeight: 22, marginBottom: 8 }}>
            • {note}
          </Text>
        ))}
        <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: "600", textAlign: "right", marginTop: 8 }}>🛡️ آخر تحديث: يونيو 2026</Text>
      </StackCard>

      <StackSecondaryButton label="العودة للرئيسية" onPress={() => router.replace("/")} />
    </StackPageLayout>
  );
}

import { Linking, Text, View } from "react-native";
import { router } from "expo-router";
import { StackCard, StackPageLayout, StackPrimaryButton, StackSecondaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";
import { whatsappHref } from "../lib/site-contact";

export default function JoinScreen() {
  const openWhatsapp = () => {
    void Linking.openURL(
      whatsappHref("مرحباً ملامح، أنا طبيب وأرغب في الانضمام وإعلان عيادتي على منصتكم."),
    );
  };

  return (
    <StackPageLayout
      badge="✨ بوابة الأطباء الشركاء"
      title="انضم كطبيب شريك"
      subtitle="اجعل عيادتك تظهر لآلاف المرضى شهرياً في فلسطين"
    >
      <View style={{ backgroundColor: theme.goldMuted, borderRadius: theme.radius.xl, padding: 16, borderWidth: 1, borderColor: "#fde68a", marginBottom: 4 }}>
        <Text style={{ fontSize: 11, fontWeight: "900", color: "#b45309", textAlign: "right" }}>⭐ عرض الأطباء الأوائل</Text>
        <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text, textAlign: "right", marginTop: 4 }}>أولوية ظهور + مزايا حصرية</Text>
      </View>

      <StackCard>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 8 }}>📝 التسجيل الإلكتروني</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right", marginBottom: 12 }}>
          سجّل عيادتك مع GPS وصور العيادة — مراجعة سريعة من الإدارة.
        </Text>
        {["تحديد موقع GPS", "نبذة وساعات العمل", "تفعيل من لوحة التحكم"].map((point) => (
          <View key={point} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Text style={{ color: theme.tealLight }}>✓</Text>
            <Text style={{ flex: 1, textAlign: "right", fontWeight: "700", fontSize: 13, color: theme.textMuted }}>{point}</Text>
          </View>
        ))}
        <View style={{ gap: 10, marginTop: 14 }}>
          <StackPrimaryButton label="عرض باقات الاشتراك" onPress={() => router.push("/subscriptions")} />
          <StackSecondaryButton label="تعبئة استمارة التسجيل" onPress={() => router.push("/doctors/register")} />
        </View>
      </StackCard>

      <StackCard>
        <Text style={{ fontSize: 18, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 8 }}>💬 واتساب مباشر</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right", marginBottom: 12 }}>
          تحدث مع الإدارة وسنساعدك في إنشاء وتفعيل حسابك.
        </Text>
        <StackPrimaryButton label="تواصل عبر واتساب" onPress={openWhatsapp} />
      </StackCard>

      <View style={{ backgroundColor: theme.goldMuted, borderRadius: theme.radius.lg, padding: 14, borderWidth: 1, borderColor: "#fde68a" }}>
        <Text style={{ fontSize: 12, fontWeight: "900", color: "#92400e", textAlign: "right" }}>⚠️ نراجع الرخصة والمستندات قبل التفعيل.</Text>
      </View>
    </StackPageLayout>
  );
}

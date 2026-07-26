import { StackCard, StackPageLayout, StackPrimaryButton, StackSecondaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

function Pillar({ icon, title, body, color, bg }: { icon: keyof typeof Feather.glyphMap; title: string; body: string; color: string; bg: string }) {
  return (
    <StackCard>
      <View style={{ alignItems: "flex-end" }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: bg, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          <Feather name={icon} size={20} color={color} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text, textAlign: "right" }}>{title}</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right", marginTop: 6 }}>{body}</Text>
      </View>
    </StackCard>
  );
}

export default function AboutScreen() {
  return (
    <StackPageLayout
      badge="✨ قصة ورؤية ملامح"
      title="عن منصة ملامح.ps"
      subtitle="أول دليل رقمي متكامل لصحة وجمال الوجه في فلسطين"
    >
      <StackCard>
        <Text style={{ fontSize: 20, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 10 }}>رؤيتنا ورسالتنا</Text>
        <Text style={{ color: theme.textMuted, fontSize: 14, fontWeight: "600", lineHeight: 24, textAlign: "right" }}>
          تأسست منصة ملامح.ps لتكون المرجع الأول لصحة وجمال الوجه — سهولة، سرعة، وثقة مبنية على تقييمات حقيقية.
        </Text>
      </StackCard>

      <Pillar icon="shield" title="دقة وموثوقية" body="جميع بيانات العيادات والأطباء يتم التحقق منها قبل التفعيل." color={theme.teal} bg={theme.tealMuted} />
      <Pillar icon="heart" title="سهولة للمريض" body="خرائط واضحة وتوجيه جغرافي للوصول الفوري للعيادة." color={theme.tealLight} bg={theme.tealMuted} />
      <Pillar icon="award" title="محتوى موثوق" body="مجلة طبية، عروض، وحجوزات موثوقة لرفع الوعي الصحي." color={theme.goldLight} bg={theme.goldMuted} />

      <StackCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="users" size={18} color={theme.teal} />
          <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text }}>خدمة قطاع الصحة الفلسطيني</Text>
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 22, textAlign: "right" }}>
          تغطية لأطباء من شتى التخصصات في كافة المحافظات الفلسطينية.
        </Text>
      </StackCard>
    </StackPageLayout>
  );
}

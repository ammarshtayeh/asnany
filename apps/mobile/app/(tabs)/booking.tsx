import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { OutlineButton, PrimaryButton, ScreenHero, SurfaceCard } from "../../components/ui/premium";

const STEPS = [
  { icon: "search" as const, title: "اختر الطبيب", desc: "من دليل الأطباء المعتمدين" },
  { icon: "edit-3" as const, title: "عبّئ بياناتك", desc: "الاسم، الهاتف، والموعد المناسب" },
  { icon: "bell" as const, title: "تابع حالتك", desc: "إشعار فوري عند تأكيد الحجز" },
];

export default function BookingTabScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        paddingTop={12}
        badge="حجز سريع وآمن"
        title="احجز موعدك"
        subtitle="اختر الطبيب المناسب واحجز من التطبيق مباشرة — بدون مكالمات أو انتظار."
      />

      <View style={{ paddingHorizontal: 16, marginTop: -16, gap: 12 }}>
        {STEPS.map((step, index) => (
          <SurfaceCard key={step.title} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
              <Feather name={step.icon} size={18} color={theme.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "900", color: theme.text, textAlign: "right", fontSize: 14 }}>
                {index + 1}. {step.title}
              </Text>
              <Text style={{ marginTop: 3, fontSize: 12, fontWeight: "600", color: theme.textMuted, textAlign: "right" }}>{step.desc}</Text>
            </View>
          </SurfaceCard>
        ))}

        <PrimaryButton label="ابدأ الحجز الآن" icon="calendar" onPress={() => router.push("/(tabs)/doctors")} style={{ marginTop: 8 }} />
        <OutlineButton label="متابعة حجوزاتي السابقة" onPress={() => router.push("/appointments")} />
      </View>
    </ScrollView>
  );
}

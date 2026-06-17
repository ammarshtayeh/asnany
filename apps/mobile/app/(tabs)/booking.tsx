import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

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
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ backgroundColor: theme.navy, borderRadius: 26, padding: 24, marginBottom: 18 }}>
        <View style={{ alignSelf: "flex-end", backgroundColor: "rgba(16,185,129,0.2)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 }}>
          <Text style={{ color: "#6ee7b7", fontWeight: "900", fontSize: 11 }}>حجز سريع وآمن</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", textAlign: "right" }}>احجز موعدك</Text>
        <Text style={{ color: "#94a3b8", marginTop: 8, fontWeight: "600", textAlign: "right", lineHeight: 22, fontSize: 13 }}>
          اختر الطبيب المناسب واحجز من التطبيق مباشرة — بدون مكالمات أو انتظار.
        </Text>
      </View>

      <View style={{ gap: 10, marginBottom: 20 }}>
        {STEPS.map((step, index) => (
          <View
            key={step.title}
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 16,
              flexDirection: "row-reverse",
              alignItems: "center",
              gap: 12,
              borderWidth: 1,
              borderColor: "#f1f5f9",
            }}
          >
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
              <Feather name={step.icon} size={18} color={theme.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "900", color: "#0f172a", textAlign: "right" }}>
                {index + 1}. {step.title}
              </Text>
              <Text style={{ marginTop: 2, fontSize: 12, fontWeight: "600", color: "#64748b", textAlign: "right" }}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/booking")}
        style={({ pressed }) => ({
          backgroundColor: theme.teal,
          borderRadius: 18,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.9 : 1,
          marginBottom: 10,
        })}
      >
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>ابدأ الحجز الآن</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/appointments")}
        style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          paddingVertical: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#e2e8f0",
        }}
      >
        <Text style={{ color: "#0f172a", fontWeight: "900", fontSize: 14 }}>متابعة حجوزاتي السابقة</Text>
      </Pressable>
    </ScrollView>
  );
}

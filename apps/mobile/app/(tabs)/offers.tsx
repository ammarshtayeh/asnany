import { ScrollView, Text, View } from "react-native";
import { AppCard } from "../../components/AppCard";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { AppButton } from "../../components/Buttons";
import { router } from "expo-router";

export default function OffersScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>العروض القريبة</AppTitle>
        <AppSubtitle>نفس فكرة الموقع: عروض موضعية وسريعة الفهم، مرتبة بحسب المدينة والاحتياج.</AppSubtitle>
        <View style={{ gap: 12, marginTop: 12 }}>
          {["تبييض", "تقويم", "زراعة", "تنظيف"].map((item) => (
            <View key={item} style={{ backgroundColor: "#eff6ff", borderRadius: 18, padding: 14 }}>
              <Text style={{ textAlign: "right", fontWeight: "900", color: "#0f172a" }}>{item}</Text>
              <Text style={{ textAlign: "right", color: "#475569", marginTop: 4, fontWeight: "700" }}>اعرف العروض المتوفرة حسب المنطقة والطبيب.</Text>
            </View>
          ))}
        </View>
        <AppButton label="استكشف الأطباء" onPress={() => router.push("/")} style={{ marginTop: 12 }} />
      </AppCard>
    </ScrollView>
  );
}

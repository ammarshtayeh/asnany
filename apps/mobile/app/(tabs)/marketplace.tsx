import { ScrollView, Text, View } from "react-native";
import { AppCard } from "../../components/AppCard";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { AppButton } from "../../components/Buttons";
import { router } from "expo-router";

export default function MarketplaceScreen() {
  const entries = [
    { title: "المتجر", desc: "منتجات العناية الفموية والاحتياجات اليومية." },
    { title: "المجلة", desc: "محتوى تثقيفي ونصائح صحية." },
    { title: "المختبرات", desc: "مرجع مختصر للمختبرات والخدمات." },
    { title: "الشركاء", desc: "تواصل مع جهات مساندة داخل المنظومة." },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>المزيد</AppTitle>
        <AppSubtitle>كل الروابط الداعمة موجودة هنا مثل الويب، مع نفس روح التنظيم.</AppSubtitle>
        <View style={{ gap: 12, marginTop: 12 }}>
          {entries.map((item) => (
            <View key={item.title} style={{ borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: "#e2e8f0", padding: 14 }}>
              <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>{item.title}</Text>
              <Text style={{ textAlign: "right", color: "#64748b", marginTop: 4, fontWeight: "700" }}>{item.desc}</Text>
            </View>
          ))}
        </View>
        <AppButton label="اذهب للصفحة الرئيسية" onPress={() => router.push("/")} style={{ marginTop: 12 }} />
      </AppCard>
    </ScrollView>
  );
}

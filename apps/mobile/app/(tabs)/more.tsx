import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/Buttons";
import { AppSubtitle, AppTitle } from "../../components/AppText";

const routes = [
  { label: "احجز الآن", path: "/booking" },
  { label: "بطاقة الخصم", path: "/discount-card" },
  { label: "دخول الطبيب", path: "/doctor/login" },
  { label: "دخول الأدمن", path: "/admin/login" },
  { label: "تسجيل طبيب", path: "/doctors/register" },
  { label: "تحديد الموقع", path: "/doctors/set-location" },
  { label: "المجلة", path: "/blog" },
  { label: "العروض", path: "/offers" },
  { label: "المتجر", path: "/stores" },
  { label: "الخصوصية", path: "/privacy" },
];

export default function MoreScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>خيارات إضافية</AppTitle>
        <AppSubtitle>كل المسارات الرئيسية بنفس الترتيب حتى ما يضيع المستخدم بين الويب والموبايل.</AppSubtitle>
        <View style={{ gap: 10, marginTop: 12 }}>
          {routes.map((item) => (
            <AppButton key={item.path} label={item.label} variant="secondary" onPress={() => router.push(item.path as any)} />
          ))}
        </View>
      </AppCard>
    </ScrollView>
  );
}

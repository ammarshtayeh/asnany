import { ScrollView, Text, View } from "react-native";
import { AppCard } from "./AppCard";
import { AppButton } from "./Buttons";
import { AppSubtitle, AppTitle } from "./AppText";
import { router } from "expo-router";

export function StaticPage({
  title,
  subtitle,
  points = [],
}: {
  title: string;
  subtitle: string;
  points?: string[];
}) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>{title}</AppTitle>
        <AppSubtitle>{subtitle}</AppSubtitle>
        <View style={{ gap: 10, marginTop: 12 }}>
          {points.map((point) => (
            <View key={point} style={{ borderRadius: 18, backgroundColor: "#eff6ff", padding: 14 }}>
              <Text style={{ textAlign: "right", fontWeight: "800", color: "#0f172a" }}>{point}</Text>
            </View>
          ))}
        </View>
        <AppButton
          label="الرجوع"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          style={{ marginTop: 12 }}
        />
      </AppCard>
    </ScrollView>
  );
}

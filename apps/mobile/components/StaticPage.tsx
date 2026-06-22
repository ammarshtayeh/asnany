import { Text, View } from "react-native";
import { router } from "expo-router";
import { StackCard, StackPageLayout, StackSecondaryButton } from "./ui/StackPageLayout";
import { theme } from "../constants/theme";

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
    <StackPageLayout title={title} subtitle={subtitle}>
      <StackCard>
        {points.map((point) => (
          <View key={point} style={{ borderRadius: 18, backgroundColor: theme.tealMuted, padding: 14, marginBottom: 10 }}>
            <Text style={{ textAlign: "right", fontWeight: "800", color: theme.text }}>{point}</Text>
          </View>
        ))}
        <StackSecondaryButton
          label="الرجوع"
          onPress={() => (router.canGoBack() ? router.back() : router.push("/"))}
        />
      </StackCard>
    </StackPageLayout>
  );
}

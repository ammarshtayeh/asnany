import { ReactNode } from "react";
import { Pressable, ScrollView, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

export function StackBackChip({ label = "رجوع" }: { label?: string }) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      style={{
        position: "absolute",
        top: 12,
        right: 16,
        zIndex: 20,
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        borderRadius: theme.radius.pill,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Feather name="arrow-right" size={14} color={theme.white} />
      <Text style={{ color: theme.white, fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

export function StackHero({
  badge,
  title,
  subtitle,
  paddingTop,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  paddingTop: number;
}) {
  return (
    <View
      style={{
        backgroundColor: theme.navy,
        minHeight: 240,
        justifyContent: "flex-end",
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: paddingTop + 48,
        borderBottomLeftRadius: theme.radius.xxl,
        borderBottomRightRadius: theme.radius.xxl,
        overflow: "hidden",
        ...theme.shadow.float,
      }}
    >
      <View style={{ position: "absolute", top: -50, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(16,185,129,0.14)" }} />
      <View style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(212,175,55,0.1)" }} />
      <StackBackChip />
      {badge ? (
        <View
          style={{
            alignSelf: "flex-end",
            backgroundColor: "rgba(212,175,55,0.12)",
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.35)",
            borderRadius: theme.radius.pill,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 11 }}>{badge}</Text>
        </View>
      ) : null}
      <Text style={{ fontSize: 28, fontWeight: "900", color: theme.white, textAlign: "right", lineHeight: 36, letterSpacing: -0.5 }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: "#cbd5e1", fontSize: 14, fontWeight: "600", marginTop: 8, textAlign: "right", lineHeight: 22 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function StackCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[theme.shadow.card, { backgroundColor: theme.card, borderRadius: theme.radius.xl, padding: 20, borderWidth: 1, borderColor: theme.borderLight }, style]}>{children}</View>;
}

export function StackPageLayout({
  badge,
  title,
  subtitle,
  children,
  bottomPad = 40,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  bottomPad?: number;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + bottomPad + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <StackHero badge={badge} title={title} subtitle={subtitle} paddingTop={insets.top} />
      <View style={{ padding: 16, gap: 14, marginTop: -20 }}>{children}</View>
    </ScrollView>
  );
}

export function StackPrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.teal,
        borderRadius: theme.radius.lg,
        paddingVertical: 15,
        alignItems: "center",
        ...theme.shadow.glow,
      }}
    >
      <Text style={{ color: theme.white, fontWeight: "900", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function StackSecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.navy,
        borderRadius: theme.radius.lg,
        paddingVertical: 15,
        alignItems: "center",
      }}
    >
      <Text style={{ color: theme.white, fontWeight: "900", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

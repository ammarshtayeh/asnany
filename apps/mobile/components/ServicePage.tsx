import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ServicePageProps {
  badge: string;
  title: string;
  description: string;
  features: string[];
  actions: Array<{ label: string; href: string }>;
  emptyLabel: string;
  accentColor?: string;
  emoji?: string;
}

export function ServicePage({
  badge,
  title,
  description,
  features,
  actions,
  emptyLabel,
  accentColor = "#0ea5e9",
  emoji = "🏥",
}: ServicePageProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ backgroundColor: "#0f172a", minHeight: 210, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: accentColor, opacity: 0.15 }} />
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12, flexDirection: "row", gap: 6, alignItems: "center" }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>{emoji} {badge}</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right" }}>{title}</Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "right" }}>{description}</Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 14 }}>ما يميز هذه الخدمة</Text>
          <View style={{ gap: 10 }}>
            {features.map((feature) => (
              <View key={feature} style={{ flexDirection: "row-reverse", gap: 10, alignItems: "flex-start" }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: accentColor + "20", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                  <Text style={{ color: accentColor, fontWeight: "900", fontSize: 12 }}>✓</Text>
                </View>
                <Text style={{ color: "#475569", fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, lineHeight: 20 }}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 28, alignItems: "center", borderWidth: 1.5, borderColor: "#f1f5f9", borderStyle: "dashed" }}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>{emoji}</Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#94a3b8", textAlign: "center" }}>{emptyLabel}</Text>
        </View>

        <View style={{ gap: 10 }}>
          {actions.map((action, i) => (
            <Pressable
              key={action.href}
              onPress={() => router.push(action.href as any)}
              style={{
                backgroundColor: i === 0 ? "#0f172a" : "#f1f5f9",
                borderRadius: 16,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <Text style={{ color: i === 0 ? "#fff" : "#475569", fontWeight: "900", fontSize: 14 }}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

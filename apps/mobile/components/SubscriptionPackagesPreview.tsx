import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  RECOMMENDED_PACKAGE_SLUG,
  SUBSCRIPTION_PERIOD_LABELS,
  type SubscriptionPackage,
} from "@pal-dental/shared";
import { apiFetch } from "../lib/api";
import { theme } from "../constants/theme";

type Props = {
  compact?: boolean;
};

export function SubscriptionPackagesPreview({ compact = false }: Props) {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiFetch<{ packages?: SubscriptionPackage[] }>("/api/subscriptions/packages").then(({ data }) => {
      setPackages(Array.isArray(data?.packages) ? data.packages : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator color={theme.teal} />
      </View>
    );
  }

  if (!packages.length) return null;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: compact ? 16 : 18, fontWeight: "900", color: theme.text, textAlign: "right" }}>
            باقات الاشتراك
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: theme.textMuted, textAlign: "right", marginTop: 2 }}>
            للأطباء والعيادات — اختر ما يناسبك
          </Text>
        </View>
        <Pressable onPress={() => router.push("/subscriptions")} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
          <Text style={{ color: theme.teal, fontWeight: "900", fontSize: 12 }}>عرض الكل</Text>
          <Feather name="arrow-left" size={14} color={theme.teal} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
        {packages.map((pkg) => {
          const recommended = pkg.slug === RECOMMENDED_PACKAGE_SLUG;
          return (
            <Pressable
              key={pkg.id}
              onPress={() => router.push("/subscriptions")}
              style={{
                width: compact ? 240 : 260,
                backgroundColor: theme.card,
                borderRadius: 20,
                padding: 16,
                borderWidth: 2,
                borderColor: recommended ? theme.purple : theme.border,
                ...theme.shadow.card,
              }}
            >
              {recommended ? (
                <View style={{ alignSelf: "flex-end", backgroundColor: theme.purpleMuted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 }}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: theme.purple }}>⭐ الأكثر طلباً</Text>
                </View>
              ) : null}
              <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text, textAlign: "right" }}>{pkg.name}</Text>
              <Text style={{ fontSize: 11, fontWeight: "700", color: theme.textMuted, textAlign: "right", marginTop: 2 }} numberOfLines={2}>
                {pkg.subtitle}
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "900", color: theme.tealLight, textAlign: "right", marginTop: 10 }}>
                ${pkg.price_usd}
                <Text style={{ fontSize: 11, color: theme.textMuted }}> {SUBSCRIPTION_PERIOD_LABELS[pkg.billing_period]}</Text>
              </Text>
              {(pkg.features || []).slice(0, 2).map((f) => (
                <Text key={f} style={{ fontSize: 11, fontWeight: "700", color: theme.textMuted, textAlign: "right", marginTop: 4 }} numberOfLines={1}>
                  ✓ {f}
                </Text>
              ))}
              <View
                style={{
                  marginTop: 12,
                  backgroundColor: recommended ? theme.purple : theme.navy,
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.white, fontWeight: "900", fontSize: 12 }}>اشترك الآن</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

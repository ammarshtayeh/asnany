import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RECOMMENDED_PACKAGE_SLUG,
  SUBSCRIPTION_PERIOD_LABELS,
  type SubscriptionPackage,
} from "@pal-dental/shared";
import { apiFetch } from "../lib/api";
import { useAppToast } from "../components/AppToast";
import { theme } from "../constants/theme";

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAppToast();

  useEffect(() => {
    void apiFetch<{ packages?: Package[] }>("/api/subscriptions/packages").then(({ data }) => {
      setPackages(Array.isArray(data?.packages) ? data.packages : []);
      setLoading(false);
    });
  }, []);

  const submit = async () => {
    if (!selectedId || !name.trim()) {
      showToast({ type: "info", title: "بيانات ناقصة", message: "اختر الباقة وأدخل اسم العيادة." });
      return;
    }
    setSubmitting(true);
    const { response, data } = await apiFetch("/api/subscriptions/request", {
      method: "POST",
      body: JSON.stringify({
        package_id: selectedId,
        advertiser_name: name,
        advertiser_type: type,
        phone,
        notes,
      }),
    });
    setSubmitting(false);
    if (!response.ok) {
      showToast({ type: "error", title: "تعذر الإرسال", message: data?.error || "حاول لاحقاً" });
      return;
    }
    showToast({ type: "success", title: "تم إرسال الطلب", message: "سيتواصل معك فريق ملامح لتفعيل الباقة." });
    setName("");
    setType("");
    setPhone("");
    setNotes("");
    setSelectedId("");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }}>
      <Pressable onPress={() => router.back()} style={{ alignSelf: "flex-end", marginBottom: 12 }}>
        <Text style={{ fontWeight: "900", color: "#0f172a" }}>رجوع</Text>
      </Pressable>
      <Text style={{ fontSize: 28, fontWeight: "900", color: theme.text, textAlign: "right" }}>باقات ملامح</Text>
      <Text style={{ marginTop: 6, color: theme.textMuted, fontWeight: "700", textAlign: "right", lineHeight: 22 }}>
        اختر الباقة المناسبة لعيادتك. كل باقة توضّح ماذا تحصل — ثم أرسل طلب التفعيل.
      </Text>

      <View style={{ gap: 12, marginTop: 18 }}>
        {packages.map((pkg) => {
          const recommended = pkg.slug === RECOMMENDED_PACKAGE_SLUG;
          return (
          <Pressable
            key={pkg.id}
            onPress={() => setSelectedId(pkg.id)}
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 18,
              borderWidth: 2,
              borderColor: selectedId === pkg.id ? theme.navy : recommended ? theme.purple : theme.border,
            }}
          >
            {recommended ? (
              <Text style={{ alignSelf: "flex-end", fontSize: 10, fontWeight: "900", color: theme.purple, marginBottom: 4 }}>⭐ الأكثر طلباً</Text>
            ) : null}
            <Text style={{ fontSize: 20, fontWeight: "900", color: theme.text, textAlign: "right" }}>{pkg.name}</Text>
            <Text style={{ marginTop: 4, color: theme.textMuted, fontWeight: "700", textAlign: "right" }}>{pkg.subtitle}</Text>
            <Text style={{ marginTop: 10, fontSize: 28, fontWeight: "900", color: theme.tealLight, textAlign: "right" }}>
              ${pkg.price_usd} <Text style={{ fontSize: 13, color: theme.textMuted }}>{SUBSCRIPTION_PERIOD_LABELS[pkg.billing_period]}</Text>
            </Text>
            {pkg.original_price_usd ? (
              <Text style={{ color: "#ef4444", fontWeight: "800", textAlign: "right", textDecorationLine: "line-through" }}>
                ${pkg.original_price_usd}
              </Text>
            ) : null}
            {(pkg.features || []).map((feature) => (
              <Text key={feature} style={{ marginTop: 6, color: theme.text, fontWeight: "700", textAlign: "right" }}>
                ✓ {feature}
              </Text>
            ))}
          </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 20, backgroundColor: theme.card, borderRadius: 24, padding: 16, gap: 10, borderWidth: 1, borderColor: theme.border }}>
        <Text style={{ fontSize: 18, fontWeight: "900", textAlign: "right", color: theme.text }}>طلب تفعيل الباقة</Text>
        <TextInput value={name} onChangeText={setName} placeholder="اسم العيادة / الشركة" placeholderTextColor={theme.textSoft} style={inputStyle} />
        <TextInput value={type} onChangeText={setType} placeholder="نوع النشاط" placeholderTextColor={theme.textSoft} style={inputStyle} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="رقم الهاتف" placeholderTextColor={theme.textSoft} keyboardType="phone-pad" style={inputStyle} />
        <TextInput value={notes} onChangeText={setNotes} placeholder="ملاحظات" placeholderTextColor={theme.textSoft} multiline style={[inputStyle, { minHeight: 90 }]} />
        <Pressable onPress={submit} disabled={submitting} style={{ backgroundColor: theme.teal, borderRadius: 18, paddingVertical: 14, opacity: submitting ? 0.7 : 1 }}>
          <Text style={{ color: theme.white, fontWeight: "900", textAlign: "center" }}>{submitting ? "جارٍ الإرسال..." : "إرسال طلب الاشتراك"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 12,
  textAlign: "right" as const,
  fontWeight: "700" as const,
  backgroundColor: theme.bg,
  color: theme.text,
};

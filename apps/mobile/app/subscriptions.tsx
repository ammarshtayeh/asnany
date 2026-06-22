import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import {
  RECOMMENDED_PACKAGE_SLUG,
  SUBSCRIPTION_PERIOD_LABELS,
  type SubscriptionPackage,
} from "@pal-dental/shared";
import { apiFetch } from "../lib/api";
import { useAppToast } from "../components/AppToast";
import { StackCard, StackPageLayout, StackPrimaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";

export default function SubscriptionsScreen() {
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
    void apiFetch<{ packages?: SubscriptionPackage[] }>("/api/subscriptions/packages").then(({ data }) => {
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
    <StackPageLayout
      badge="⭐ باقات ملامح"
      title="اختر باقتك وابدأ الظهور"
      subtitle="ثلاث باقات واضحة للأطباء والشركاء — ثم أرسل طلب التفعيل"
    >
      {packages.map((pkg) => {
        const recommended = pkg.slug === RECOMMENDED_PACKAGE_SLUG;
        const selected = selectedId === pkg.id;
        return (
          <Pressable key={pkg.id} onPress={() => setSelectedId(pkg.id)}>
            <StackCard style={{ borderWidth: 2, borderColor: selected ? theme.navy : recommended ? theme.purple : theme.borderLight }}>
              {recommended ? (
                <Text style={{ alignSelf: "flex-end", fontSize: 10, fontWeight: "900", color: theme.purple, marginBottom: 4 }}>⭐ الأكثر طلباً</Text>
              ) : null}
              <Text style={{ fontSize: 20, fontWeight: "900", color: theme.text, textAlign: "right" }}>{pkg.name}</Text>
              <Text style={{ marginTop: 4, color: theme.textMuted, fontWeight: "700", textAlign: "right" }}>{pkg.subtitle}</Text>
              <Text style={{ marginTop: 10, fontSize: 28, fontWeight: "900", color: theme.tealLight, textAlign: "right" }}>
                ${pkg.price_usd}{" "}
                <Text style={{ fontSize: 13, color: theme.textMuted }}>{SUBSCRIPTION_PERIOD_LABELS[pkg.billing_period]}</Text>
              </Text>
              {(pkg.features || []).map((feature) => (
                <Text key={feature} style={{ marginTop: 6, color: theme.text, fontWeight: "700", textAlign: "right" }}>
                  ✓ {feature}
                </Text>
              ))}
              {selected ? (
                <Text style={{ marginTop: 10, color: theme.teal, fontWeight: "900", textAlign: "right" }}>✓ الباقة المختارة</Text>
              ) : null}
            </StackCard>
          </Pressable>
        );
      })}

      <StackCard>
        <Text style={{ fontSize: 18, fontWeight: "900", textAlign: "right", color: theme.text, marginBottom: 10 }}>طلب تفعيل الباقة</Text>
        <TextInput value={name} onChangeText={setName} placeholder="اسم العيادة / الشركة" placeholderTextColor={theme.textSoft} style={inputStyle} />
        <TextInput value={type} onChangeText={setType} placeholder="نوع النشاط" placeholderTextColor={theme.textSoft} style={inputStyle} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="رقم الهاتف" placeholderTextColor={theme.textSoft} keyboardType="phone-pad" style={inputStyle} />
        <TextInput value={notes} onChangeText={setNotes} placeholder="ملاحظات" placeholderTextColor={theme.textSoft} multiline style={[inputStyle, { minHeight: 90 }]} />
        <View style={{ marginTop: 12 }}>
          <StackPrimaryButton label={submitting ? "جارٍ الإرسال..." : "إرسال طلب الاشتراك"} onPress={submit} />
        </View>
      </StackCard>
    </StackPageLayout>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: theme.borderLight,
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 12,
  textAlign: "right" as const,
  fontWeight: "700" as const,
  backgroundColor: theme.bg,
  color: theme.text,
  marginTop: 8,
};

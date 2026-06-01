import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../../lib/api";
import { AppButton } from "../../components/Buttons";
import { AppCard } from "../../components/AppCard";
import { AppSubtitle, AppTitle } from "../../components/AppText";

export default function DoctorSetLocationScreen() {
  const [form, setForm] = useState({
    doctor_id: "",
    city: "",
    area: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { response, data } = await apiFetch("/api/doctors/set-location", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!response.ok) return Alert.alert("تعذر الحفظ", data?.error || "حاول مرة ثانية");
    Alert.alert("تم الحفظ", "تم تحديث موقع العيادة.");
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>تحديد موقع العيادة</AppTitle>
        <AppSubtitle>تحديث الموقع من داخل التطبيق حتى يظهر على الخريطة والبحث.</AppSubtitle>
        {[
          ["رقم الطبيب", "doctor_id"],
          ["المدينة", "city"],
          ["المنطقة", "area"],
          ["العنوان", "address"],
          ["خط العرض", "latitude"],
          ["خط الطول", "longitude"],
        ].map(([label, key]) => (
          <Field key={key} label={label} value={form[key as keyof typeof form]} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} />
        ))}
        <AppButton label={loading ? "جارٍ الحفظ..." : "حفظ الموقع"} onPress={submit} style={{ marginTop: 12 }} />
        <AppButton label="العودة" variant="secondary" onPress={() => router.back()} style={{ marginTop: 10 }} />
      </AppCard>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlign: "right",
          fontWeight: "700",
          color: "#0f172a",
        }}
      />
    </View>
  );
}

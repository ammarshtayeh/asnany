import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../../lib/api";
import { AppButton } from "../../components/Buttons";
import { AppCard } from "../../components/AppCard";
import { AppSubtitle, AppTitle } from "../../components/AppText";

export default function DoctorRegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    area: "",
    address: "",
    phone: "",
    whatsapp: "",
    specialty: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { response, data } = await apiFetch("/api/doctors/register", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        specialty: form.specialty
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    setLoading(false);
    if (!response.ok) return Alert.alert("تعذر التسجيل", data?.error || "تحقق من البيانات");
    Alert.alert("تم التسجيل", "أصبح بإمكان الطبيب الدخول من صفحة الدخول الخاصة به.");
    router.replace("/doctor/login");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>تسجيل طبيب</AppTitle>
        <AppSubtitle>النموذج داخل التطبيق نفسه، بدون أي صفحة خارجية.</AppSubtitle>
        {[
          ["الاسم", "name"],
          ["البريد", "email"],
          ["كلمة المرور", "password"],
          ["المدينة", "city"],
          ["المنطقة", "area"],
          ["العنوان", "address"],
          ["الهاتف", "phone"],
          ["واتساب", "whatsapp"],
          ["التخصصات مفصولة بفواصل", "specialty"],
        ].map(([label, key]) => (
          <Field key={key} label={label} value={form[key as keyof typeof form]} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} />
        ))}
        <Field label="نبذة" value={form.bio} onChangeText={(value) => setForm((current) => ({ ...current, bio: value }))} multiline />
        <AppButton label={loading ? "جارٍ الحفظ..." : "إنشاء حساب الطبيب"} onPress={submit} style={{ marginTop: 12 }} />
        <AppButton label="العودة" variant="secondary" onPress={() => router.back()} style={{ marginTop: 10 }} />
      </AppCard>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={{
          minHeight: multiline ? 88 : 48,
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

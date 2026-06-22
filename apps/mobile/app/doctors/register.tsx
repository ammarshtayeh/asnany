import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../../lib/api";
import { StackCard, StackPageLayout, StackPrimaryButton, StackSecondaryButton } from "../../components/ui/StackPageLayout";
import { theme } from "../../constants/theme";
import { useAppToast } from "../../components/AppToast";

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
  const { showToast } = useAppToast();

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
    if (!response.ok) {
      showToast({ type: "error", title: "تعذر التسجيل", message: data?.error || "تحقق من البيانات" });
      return;
    }
    showToast({ type: "success", title: "تم التسجيل", message: "أصبح بإمكان الطبيب الدخول من صفحته." });
    router.replace("/doctor/login");
  };

  return (
    <StackPageLayout badge="🩺 انضم لملامح" title="تسجيل طبيب" subtitle="النموذج داخل التطبيق — بدون صفحة خارجية">
      <StackCard>
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
        <View style={{ marginTop: 12, gap: 10 }}>
          <StackPrimaryButton label={loading ? "جارٍ الحفظ..." : "إنشاء حساب الطبيب"} onPress={submit} />
          <StackSecondaryButton label="العودة" onPress={() => router.back()} />
        </View>
      </StackCard>
    </StackPageLayout>
  );
}

function Field({ label, value, onChangeText, multiline }: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: theme.textMuted, marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={theme.textSoft}
        style={{
          minHeight: multiline ? 88 : 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.borderLight,
          backgroundColor: theme.bg,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlign: "right",
          fontWeight: "700",
          color: theme.text,
        }}
      />
    </View>
  );
}

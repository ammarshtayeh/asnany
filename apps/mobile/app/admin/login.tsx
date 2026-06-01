import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../../lib/api";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/Buttons";
import { AppSubtitle, AppTitle } from "../../components/AppText";

export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { response, data } = await apiFetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!response.ok) return Alert.alert("فشل الدخول", data?.error || "تحقق من البيانات");
    router.replace("/admin/doctor-accounts");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingTop: 48, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>دخول الأدمن</AppTitle>
        <AppSubtitle>للإدارة فقط. هنا يتم إنشاء حسابات الأطباء ومتابعة المنظومة.</AppSubtitle>
        <Field label="البريد" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry />
        <AppButton label={loading ? "جارٍ الدخول..." : "دخول"} onPress={submit} style={{ marginTop: 12 }} />
      </AppCard>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#94a3b8"
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

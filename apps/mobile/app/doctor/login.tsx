import { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { getMobileApiBaseUrl } from "../../lib/api-base";
import { doctorSession } from "../../lib/session";
import { onAuthLogin } from "../../lib/push-manager";
import { useAppToast } from "../../components/AppToast";
import { DOCTOR_LOGIN_EMAIL_PLACEHOLDER } from "../../lib/site-contact";
import { theme } from "../../constants/theme";

const API_BASE = getMobileApiBaseUrl();

export default function DoctorLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppToast();

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0 && !loading, [email, password, loading]);

  const signIn = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/doctor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "تعذر تسجيل الدخول");
      }

      await doctorSession.write({
        token: data?.token ?? data?.accessToken ?? undefined,
        doctor: data?.doctor ?? data?.user ?? data?.profile ?? data,
        raw: data,
      });

      const doctorId =
        data?.doctor?.id || data?.account?.doctor_id || data?.doctor_id || data?.id;
      await onAuthLogin("doctor", {
        authToken: data?.token ?? data?.accessToken,
        doctorId,
      });

      router.replace("/doctor/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تسجيل الدخول";
      showToast({ type: "error", title: "دخول الطبيب", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 36 }}>
          <View style={{ marginBottom: 20, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, padding: 20, ...theme.shadow.card }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ alignItems: "flex-end", flex: 1, paddingLeft: 12 }}>
                <Text style={{ fontSize: 26, fontWeight: "900", color: theme.text, textAlign: "right" }}>دخول الطبيب</Text>
                <Text style={{ marginTop: 8, fontSize: 13, fontWeight: "600", lineHeight: 20, color: theme.textMuted, textAlign: "right" }}>إدارة العيادة والمواعيد</Text>
              </View>
              <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
                <Feather name="arrow-right" size={20} color={theme.teal} />
              </Pressable>
            </View>
          </View>

          <View style={{ borderRadius: theme.radius.xl, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 20, ...theme.shadow.card }}>
            <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: "900", color: theme.teal, textAlign: "right" }}>البريد الإلكتروني</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={DOCTOR_LOGIN_EMAIL_PLACEHOLDER}
              placeholderTextColor={theme.textSoft}
              style={{ marginBottom: 16, minHeight: 56, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.bg, paddingHorizontal: 16, fontSize: 16, fontWeight: "600", color: theme.text, textAlign: "right" }}
            />

            <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: "900", color: theme.teal, textAlign: "right" }}>كلمة المرور</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.textSoft}
              style={{ marginBottom: 20, minHeight: 56, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.bg, paddingHorizontal: 16, fontSize: 16, fontWeight: "600", color: theme.text, textAlign: "right" }}
            />

            <Pressable
              onPress={signIn}
              disabled={!canSubmit}
              style={{ minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.pill, backgroundColor: canSubmit ? theme.teal : "#c5d0cd" }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>دخول</Text>}
            </Pressable>

            <View style={{ marginTop: 16, borderRadius: theme.radius.md, backgroundColor: theme.tealMuted, padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", lineHeight: 24, color: theme.textMuted, textAlign: "right" }}>
                إذا ما عندك حساب طبيب، الأدمن لازم ينشئه من لوحة إدارة الأطباء.
              </Text>
              <Pressable onPress={() => router.push("/admin/login")} style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "900", color: theme.teal, textAlign: "right" }}>الانتقال إلى دخول الأدمن</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

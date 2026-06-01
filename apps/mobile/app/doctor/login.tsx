import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { getMobileApiBaseUrl } from "../../lib/api-base";
import { doctorSession } from "../../lib/session";

const API_BASE = getMobileApiBaseUrl();

export default function DoctorLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

      router.replace("/doctor/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تسجيل الدخول";
      Alert.alert("دخول الطبيب", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-5 py-10">
          <View className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <Text className="text-3xl font-black text-white">دخول الطبيب</Text>
            <Text className="mt-2 text-sm font-medium leading-6 text-slate-300">
              ادخل بحساب الطبيب الذي أنشأه الأدمن لإدارة الدوام والحجوزات والظهور في التطبيق والموقع.
            </Text>
          </View>

          <View className="rounded-3xl bg-white p-5">
            <Text className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">البريد الإلكتروني</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="doctor@asnany.ps"
              className="mb-4 min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-950"
            />

            <Text className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">كلمة المرور</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              className="mb-5 min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-950"
            />

            <Pressable
              onPress={signIn}
              disabled={!canSubmit}
              className={`min-h-14 items-center justify-center rounded-2xl ${canSubmit ? "bg-sky-600" : "bg-slate-300"}`}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-black text-white">دخول</Text>}
            </Pressable>

            <View className="mt-4 rounded-2xl bg-slate-50 p-4">
              <Text className="text-sm font-bold leading-6 text-slate-600">
                إذا ما عندك حساب طبيب، الأدمن لازم ينشئه من لوحة إدارة الأطباء.
              </Text>
              <Pressable onPress={() => router.push("/admin/login")} className="mt-3">
                <Text className="text-sm font-black text-sky-700">الانتقال إلى دخول الأدمن</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

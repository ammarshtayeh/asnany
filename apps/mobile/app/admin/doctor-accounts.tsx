import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { getMobileApiBaseUrl } from "../../lib/api-base";
import { adminSession } from "../../lib/session";
import { useAppToast } from "../../components/AppToast";

const API_BASE = getMobileApiBaseUrl();

type DoctorAccountForm = {
  fullName: string;
  email: string;
  password: string;
  specialty: string;
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  discountValue: string;
  discountNote: string;
};

export default function DoctorAccountsScreen() {
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const { showToast } = useAppToast();
  const [form, setForm] = useState<DoctorAccountForm>({
    fullName: "",
    email: "",
    password: "",
    specialty: "",
    city: "",
    area: "",
    phone: "",
    whatsapp: "",
    discountValue: "",
    discountNote: "",
  });

  const canSubmit = useMemo(
    () => Boolean(form.fullName.trim() && form.email.trim() && form.password.trim() && form.specialty.trim() && form.city.trim()),
    [form]
  );

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    const session = await adminSession.read();
    if (!session?.token && !session?.admin) {
      router.replace("/admin/login");
      return;
    }
    setSessionReady(true);
    await refreshDoctors(session?.token);
  };

  const refreshDoctors = async (token?: string | null) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/doctor-accounts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "تعذر جلب الأطباء");
      }
      setDoctors(Array.isArray(data?.doctors) ? data.doctors : Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر جلب الأطباء";
      showToast({ type: "error", title: "حسابات الأطباء", message });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof DoctorAccountForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createDoctor = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const session = await adminSession.read();
      const response = await fetch(`${API_BASE}/api/admin/doctor-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          specialty: form.specialty.trim(),
          city: form.city.trim(),
          area: form.area.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim(),
          discount_value: form.discountValue.trim() || null,
          discount_note: form.discountNote.trim() || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "تعذر إنشاء الحساب");
      }
      showToast({ type: "success", title: "تم إنشاء الحساب", message: "تم إنشاء حساب الطبيب بنجاح." });
      setForm({
        fullName: "",
        email: "",
        password: "",
        specialty: "",
        city: "",
        area: "",
        phone: "",
        whatsapp: "",
        discountValue: "",
        discountNote: "",
      });
      await refreshDoctors(session?.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر إنشاء الحساب";
      showToast({ type: "error", title: "حسابات الأطباء", message });
    } finally {
      setSaving(false);
    }
  };

  if (!sessionReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617" }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View style={{ marginBottom: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 24 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 30, fontWeight: "900", color: "#fff", textAlign: "right" }}>حسابات الأطباء</Text>
            <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "500", color: "#cbd5e1", textAlign: "right" }}>لوحة تحكم الأدمن</Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </View>
        <Text style={{ marginTop: 12, fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#cbd5e1", textAlign: "right" }}>
          من هنا ينشئ الأدمن حسابات الأطباء ويحدد الخصم والبيانات الأساسية قبل دخول الطبيب للنظام.
        </Text>
        <Pressable
          onPress={() => router.push("/admin/login")}
          style={{ marginTop: 16, alignSelf: "flex-end", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 12 }}
        >
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>تبديل الحساب</Text>
        </Pressable>
      </View>

      <View style={{ marginBottom: 20, borderRadius: 24, backgroundColor: "#fff", padding: 20 }}>
        <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>إنشاء حساب طبيب</Text>

        <Input label="الاسم الكامل" value={form.fullName} onChangeText={(value) => updateField("fullName", value)} />
        <Input label="البريد الإلكتروني" value={form.email} onChangeText={(value) => updateField("email", value)} keyboardType="email-address" autoCapitalize="none" />
        <Input label="كلمة المرور" value={form.password} onChangeText={(value) => updateField("password", value)} secureTextEntry />
        <Input label="التخصص" value={form.specialty} onChangeText={(value) => updateField("specialty", value)} />
        <Input label="المدينة" value={form.city} onChangeText={(value) => updateField("city", value)} />
        <Input label="المنطقة" value={form.area} onChangeText={(value) => updateField("area", value)} />
        <Input label="رقم الهاتف" value={form.phone} onChangeText={(value) => updateField("phone", value)} keyboardType="phone-pad" />
        <Input label="واتساب" value={form.whatsapp} onChangeText={(value) => updateField("whatsapp", value)} keyboardType="phone-pad" />
        <Input label="قيمة الخصم" value={form.discountValue} onChangeText={(value) => updateField("discountValue", value)} placeholder="مثال: 20%" />
        <Input label="ملاحظة الخصم" value={form.discountNote} onChangeText={(value) => updateField("discountNote", value)} placeholder="اختياري" />

        <Pressable
          onPress={createDoctor}
          disabled={!canSubmit || saving}
          style={{ marginTop: 12, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: canSubmit && !saving ? "#0284c7" : "#cbd5e1" }}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>إنشاء الحساب</Text>}
        </Pressable>
      </View>

      <View style={{ borderRadius: 24, backgroundColor: "#fff", padding: 20 }}>
        <View style={{ marginBottom: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a" }}>الأطباء المسجلون</Text>
          <Pressable onPress={() => refreshDoctors()} style={{ borderRadius: 16, backgroundColor: "#f1f5f9", paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#334155" }}>تحديث</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color="#0284c7" />
        ) : doctors.length === 0 ? (
          <Text style={{ fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#64748b", textAlign: "right" }}>لا توجد حسابات أطباء بعد.</Text>
        ) : (
          doctors.map((doctor, index) => (
            <View key={doctor.id ?? index} style={{ marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{doctor.name ?? doctor.full_name ?? doctor.fullName ?? "طبيب"}</Text>
              <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "500", color: "#475569", textAlign: "right" }}>{doctor.email ?? "بريد غير متوفر"}</Text>
              <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "500", color: "#475569", textAlign: "right" }}>
                {doctor.specialty ?? doctor.specialty_name ?? "التخصص غير محدد"} - {doctor.city ?? "المدينة غير حددة"}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{ minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", paddingHorizontal: 16, fontSize: 16, fontWeight: "500", color: "#0f172a", textAlign: "right" }}
      />
    </View>
  );
}

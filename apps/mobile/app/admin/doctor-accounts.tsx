import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

import { getMobileApiBaseUrl } from "../../lib/api-base";
import { adminSession } from "../../lib/session";

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
      Alert.alert("حسابات الأطباء", message);
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
      Alert.alert("تم", "تم إنشاء حساب الطبيب بنجاح");
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
      Alert.alert("حسابات الأطباء", message);
    } finally {
      setSaving(false);
    }
  };

  if (!sessionReady) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-3xl font-black text-white">حسابات الأطباء</Text>
        <Text className="mt-2 text-sm font-medium leading-6 text-slate-300">
          من هنا ينشئ الأدمن حسابات الأطباء ويحدد الخصم والبيانات الأساسية قبل دخول الطبيب للنظام.
        </Text>
        <Pressable
          onPress={() => router.push("/admin/login")}
          className="mt-4 self-start rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
        >
          <Text className="text-sm font-black text-white">تبديل الحساب</Text>
        </Pressable>
      </View>

      <View className="mb-5 rounded-3xl bg-white p-5">
        <Text className="mb-4 text-lg font-black text-slate-950">إنشاء حساب طبيب</Text>

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
          className={`mt-3 min-h-14 items-center justify-center rounded-2xl ${canSubmit && !saving ? "bg-sky-600" : "bg-slate-300"}`}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-black text-white">إنشاء الحساب</Text>}
        </Pressable>
      </View>

      <View className="rounded-3xl bg-white p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-black text-slate-950">الأطباء المسجلون</Text>
          <Pressable onPress={() => refreshDoctors()} className="rounded-2xl bg-slate-100 px-4 py-2">
            <Text className="text-sm font-black text-slate-700">تحديث</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color="#0284c7" />
        ) : doctors.length === 0 ? (
          <Text className="text-sm font-medium leading-6 text-slate-500">لا توجد حسابات أطباء بعد.</Text>
        ) : (
          doctors.map((doctor, index) => (
            <View key={doctor.id ?? index} className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Text className="text-base font-black text-slate-950">{doctor.name ?? doctor.full_name ?? doctor.fullName ?? "طبيب"}</Text>
              <Text className="mt-1 text-sm font-medium text-slate-600">{doctor.email ?? "بريد غير متوفر"}</Text>
              <Text className="mt-1 text-sm font-medium text-slate-600">
                {doctor.specialty ?? doctor.specialty_name ?? "التخصص غير محدد"} - {doctor.city ?? "المدينة غير محددة"}
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
    <View className="mb-3">
      <Text className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-950"
      />
    </View>
  );
}

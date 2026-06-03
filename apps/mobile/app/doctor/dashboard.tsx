import { useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { getMobileApiBaseUrl } from "../../lib/api-base";
import { doctorSession } from "../../lib/session";
import { registerPushSubscription } from "../../lib/notifications";

type Appointment = {
  id: string;
  patient_full_name?: string;
  patient_phone?: string;
  patient_identity?: string;
  patient_address?: string;
  date?: string;
  time?: string;
  status?: string;
  notes?: string;
};

type DoctorProfile = {
  id?: string;
  name?: string;
  email?: string;
  city?: string;
  area?: string;
  phone?: string;
  whatsapp?: string;
  is_available?: boolean;
  accepts_discount_card?: boolean;
  discount_value?: string;
  discount_note?: string;
  working_hours?: Record<string, string>;
};

const API_BASE = getMobileApiBaseUrl();

export default function DoctorDashboardScreen() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<DoctorProfile>({});
  const [token, setToken] = useState<string | undefined>(undefined);
  const [hoursText, setHoursText] = useState("");

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    const session = await doctorSession.read();
    if (!session?.token && !session?.doctor) {
      router.replace("/doctor/login");
      return;
    }
    setToken(session?.token);
    void registerPushSubscription({
      role: "doctor",
      doctorId: (session?.doctor as any)?.id || (session?.raw as any)?.account?.doctor_id || session?.token,
      authToken: session?.token,
    }).catch(() => null);
    await refresh(session?.token);
    setReady(true);
  };

  const requestHeaders = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    [token]
  );

  const refresh = async (authToken?: string) => {
    setLoading(true);
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : requestHeaders;
      const [profileResponse, appointmentsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/doctor/me`, { headers }),
        fetch(`${API_BASE}/api/doctor/appointments`, { headers }),
      ]);

      const profileData = await profileResponse.json().catch(() => ({}));
      const appointmentsData = await appointmentsResponse.json().catch(() => ({}));

      if (!profileResponse.ok) {
        throw new Error(profileData?.error || "تعذر جلب ملف الطبيب");
      }

      if (!appointmentsResponse.ok) {
        throw new Error(appointmentsData?.error || "تعذر جلب الحجوزات");
      }

      const nextProfile: DoctorProfile = profileData?.doctor || profileData?.profile || profileData || {};
      setProfile(nextProfile);
      setHoursText(formatHours(nextProfile.working_hours));
      setAppointments(Array.isArray(appointmentsData?.appointments) ? appointmentsData.appointments : appointmentsData || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحميل لوحة الطبيب";
      Alert.alert("لوحة الطبيب", message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/doctor/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(requestHeaders || {}),
        },
        body: JSON.stringify({
          city: profile.city ?? "",
          area: profile.area ?? "",
          phone: profile.phone ?? "",
          whatsapp: profile.whatsapp ?? "",
          is_available: Boolean(profile.is_available),
          accepts_discount_card: Boolean(profile.accepts_discount_card),
          discount_value: profile.discount_value ?? "",
          discount_note: profile.discount_note ?? "",
          working_hours: parseHours(hoursText),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "تعذر حفظ الملف");
      }

      Alert.alert("تم", "تم حفظ بيانات الطبيب بنجاح");
      await refresh(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر حفظ الملف";
      Alert.alert("لوحة الطبيب", message);
    } finally {
      setSaving(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/doctor/appointments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(requestHeaders || {}),
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          status,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "تعذر تحديث الحجز");
      }
      await refresh(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر تحديث الحجز";
      Alert.alert("الحجوزات", message);
    }
  };

  const signOut = async () => {
    await doctorSession.clear();
    router.replace("/doctor/login");
  };

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-6">
        <Text className="text-3xl font-black text-white">لوحة الطبيب</Text>
        <Text className="mt-2 text-sm font-medium leading-6 text-slate-300">
          هنا الطبيب يدير الحضور، الخصم، والبيانات الأساسية، ويشوف الحجوزات التي وصلت له من الموقع والتطبيق.
        </Text>
        <View className="mt-4 flex-row gap-3">
          <Pressable onPress={() => router.push("/doctor/notifications")} className="rounded-2xl bg-sky-500 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Feather name="bell" size={16} color="#fff" />
              <Text className="text-sm font-black text-white">الإشعارات</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => refresh(token)} className="rounded-2xl bg-white/10 px-4 py-3">
            <Text className="text-sm font-black text-white">تحديث</Text>
          </Pressable>
          <Pressable onPress={signOut} className="rounded-2xl bg-rose-500 px-4 py-3">
            <Text className="text-sm font-black text-white">تسجيل خروج</Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-5 rounded-3xl bg-white p-5">
        <Text className="mb-4 text-lg font-black text-slate-950">بيانات العيادة</Text>

        <Field label="المدينة" value={profile.city ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, city: value }))} />
        <Field label="المنطقة" value={profile.area ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, area: value }))} />
        <Field label="الهاتف" value={profile.phone ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
        <Field label="واتساب" value={profile.whatsapp ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, whatsapp: value }))} keyboardType="phone-pad" />
        <Field label="قيمة الخصم" value={profile.discount_value ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, discount_value: value }))} />
        <Field label="ملاحظة الخصم" value={profile.discount_note ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, discount_note: value }))} />

        <View className="mt-2 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
          <View>
            <Text className="text-sm font-black text-slate-950">موجود في العيادة الآن</Text>
            <Text className="mt-1 text-xs font-medium text-slate-500">تظهر هذه الحالة في الموقع والتطبيق.</Text>
          </View>
          <Switch
            value={Boolean(profile.is_available)}
            onValueChange={(value) => setProfile((current) => ({ ...current, is_available: value }))}
          />
        </View>

        <View className="mt-2 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
          <View>
            <Text className="text-sm font-black text-slate-950">يقبل بطاقة الخصم</Text>
            <Text className="mt-1 text-xs font-medium text-slate-500">تظهر البطاقة للمستخدمين المشتركين.</Text>
          </View>
          <Switch
            value={Boolean(profile.accepts_discount_card)}
            onValueChange={(value) => setProfile((current) => ({ ...current, accepts_discount_card: value }))}
          />
        </View>

        <Text className="mt-4 mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">الدوام الأسبوعي</Text>
        <TextInput
          multiline
          value={hoursText}
          onChangeText={setHoursText}
          placeholder='{"السبت":"9:00 - 13:00","الأحد":"مغلق"}'
          className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-950"
        />

        <Pressable
          onPress={updateProfile}
          disabled={saving}
          className={`mt-4 min-h-14 items-center justify-center rounded-2xl ${saving ? "bg-slate-300" : "bg-sky-600"}`}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-black text-white">حفظ البيانات</Text>}
        </Pressable>
      </View>

      <View className="rounded-3xl bg-white p-5">
        <Text className="mb-4 text-lg font-black text-slate-950">الحجوزات الواردة</Text>

        {loading ? (
          <ActivityIndicator color="#0284c7" />
        ) : appointments.length === 0 ? (
          <Text className="text-sm font-medium leading-6 text-slate-500">لا توجد حجوزات حالياً.</Text>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Text className="text-base font-black text-slate-950">{appointment.patient_full_name ?? "مريض"}</Text>
              <Text className="mt-1 text-sm font-medium text-slate-600">
                {appointment.patient_phone ?? ""} {appointment.patient_identity ? `- ${appointment.patient_identity}` : ""}
              </Text>
              <Text className="mt-1 text-sm font-medium text-slate-600">
                {appointment.date ?? ""} {appointment.time ? `- ${appointment.time}` : ""}
              </Text>
              <Text className="mt-1 text-xs font-medium text-slate-500">{appointment.patient_address ?? ""}</Text>
              {appointment.notes ? <Text className="mt-2 text-sm font-medium text-slate-700">{appointment.notes}</Text> : null}
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  onPress={() => updateAppointmentStatus(appointment.id, "confirmed")}
                  className="rounded-2xl bg-emerald-600 px-4 py-2"
                >
                  <Text className="text-sm font-black text-white">تأكيد</Text>
                </Pressable>
                <Pressable
                  onPress={() => updateAppointmentStatus(appointment.id, "cancelled")}
                  className="rounded-2xl bg-rose-500 px-4 py-2"
                >
                  <Text className="text-sm font-black text-white">إلغاء</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad" | "email-address" | "numeric";
}) {
  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-950"
      />
    </View>
  );
}

function formatHours(hours?: Record<string, string>) {
  if (!hours) {
    return "";
  }
  try {
    return JSON.stringify(hours, null, 2);
  } catch {
    return "";
  }
}

function parseHours(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

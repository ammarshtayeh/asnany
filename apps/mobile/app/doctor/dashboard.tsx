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
  discount_card_status?: "active" | "none" | null;
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

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
      today: appointments.filter((item) => item.date === today).length,
      total: appointments.length,
    };
  }, [appointments]);

  const nextAppointments = useMemo(() => {
    return [...appointments]
      .filter((item) => item.status !== "cancelled")
      .sort((left, right) => {
        const leftStamp = `${left.date}T${left.time || "23:59"}`;
        const rightStamp = `${right.date}T${right.time || "23:59"}`;
        return leftStamp.localeCompare(rightStamp);
      })
      .slice(0, 3);
  }, [appointments]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617" }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View style={{ marginBottom: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 24 }}>
        <Text style={{ fontSize: 30, fontWeight: "900", color: "#fff", textAlign: "right" }}>لوحة الطبيب</Text>
        <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#cbd5e1", textAlign: "right" }}>
          هنا الطبيب يدير الحضور، الخصم، والبيانات الأساسية، ويشوف الحجوزات التي وصلت له من الموقع والتطبيق.
        </Text>
        <View style={{ marginTop: 16, flexDirection: "row-reverse", gap: 12 }}>
          <Pressable onPress={() => router.push("/doctor/notifications")} style={{ borderRadius: 16, backgroundColor: "#0ea5e9", paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              <Feather name="bell" size={16} color="#fff" />
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>الإشعارات</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => refresh(token)} style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>تحديث</Text>
          </Pressable>
          <Pressable onPress={signOut} style={{ borderRadius: 16, backgroundColor: "#f43f5e", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>تسجيل خروج</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginBottom: 20, flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 }}>
        <SummaryCard label="قيد المراجعة" value={stats.pending} />
        <SummaryCard label="مؤكدة" value={stats.confirmed} />
        <SummaryCard label="اليوم" value={stats.today} />
        <SummaryCard label="الإجمالي" value={stats.total} />
      </View>

      <View style={{ marginBottom: 20, borderRadius: 24, backgroundColor: "#fff", padding: 20 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>أقرب الحجوزات</Text>
            <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "500", color: "#64748b", textAlign: "right" }}>
              لمحة سريعة تساعد الطبيب يعرف مين جاي بعد شوي.
            </Text>
          </View>
          <View style={{ borderRadius: 999, backgroundColor: profile.is_available ? "#ecfdf5" : "#fef2f2", paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: profile.is_available ? "#047857" : "#e11d48" }}>
              {profile.is_available ? "العيادة متاحة الآن" : "العيادة مغلقة الآن"}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 16, gap: 10 }}>
          {nextAppointments.length === 0 ? (
            <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "dashed", padding: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#64748b", textAlign: "right" }}>
                لا توجد حجوزات قادمة حالياً. أول حجز جديد سيظهر هنا مباشرة.
              </Text>
            </View>
          ) : (
            nextAppointments.map((appointment) => (
              <View key={appointment.id} style={{ borderRadius: 16, backgroundColor: "#f8fafc", padding: 16 }}>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ borderRadius: 999, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, fontSize: 12, fontWeight: "900", color: "#475569" }}>
                    {appointment.date ?? ""}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8" }}>{appointment.time || "بدون وقت"}</Text>
                </View>
                <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>
                  {appointment.patient_full_name ?? appointment.patient_phone ?? "مريض"}
                </Text>
                <Text style={{ marginTop: 4, fontSize: 13, fontWeight: "500", color: "#475569", textAlign: "right" }}>
                  {appointment.patient_phone ?? ""}
                </Text>
                <DiscountCardBadge active={appointment.discount_card_status === "active"} />
              </View>
            ))
          )}
        </View>
      </View>

      <View style={{ marginBottom: 20, borderRadius: 24, backgroundColor: "#fff", padding: 20 }}>
        <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>بيانات العيادة</Text>

        <View style={{ marginBottom: 14, borderRadius: 16, backgroundColor: profile.is_available ? "#ecfdf5" : "#fef2f2", padding: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>
            {profile.is_available ? "العيادة متاحة حالياً" : "العيادة مغلقة الآن"}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "500", color: "#64748b", textAlign: "right" }}>
            {profile.is_available ? "ستظهر للمرضى على أنها مفتوحة ويمكن الحجز منها." : "سيظهر ذلك للمرضى حتى تعيد تفعيلها."}
          </Text>
        </View>

        <Field label="المدينة" value={profile.city ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, city: value }))} />
        <Field label="المنطقة" value={profile.area ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, area: value }))} />
        <Field label="الهاتف" value={profile.phone ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
        <Field label="واتساب" value={profile.whatsapp ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, whatsapp: value }))} keyboardType="phone-pad" />
        <Field label="قيمة الخصم" value={profile.discount_value ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, discount_value: value }))} />
        <Field label="ملاحظة الخصم" value={profile.discount_note ?? ""} onChangeText={(value) => setProfile((current) => ({ ...current, discount_note: value }))} />

        <View style={{ marginTop: 8, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderRadius: 16, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingVertical: 16 }}>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>موجود في العيادة الآن</Text>
            <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "500", color: "#64748b", textAlign: "right" }}>تظهر هذه الحالة في الموقع والتطبيق.</Text>
          </View>
          <Switch
            value={Boolean(profile.is_available)}
            onValueChange={(value) => setProfile((current) => ({ ...current, is_available: value }))}
          />
        </View>

        <View style={{ marginTop: 12, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderRadius: 16, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingVertical: 16 }}>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>يقبل بطاقة الخصم</Text>
            <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "500", color: "#64748b", textAlign: "right" }}>تظهر البطاقة للمستخدمين المشتركين.</Text>
          </View>
          <Switch
            value={Boolean(profile.accepts_discount_card)}
            onValueChange={(value) => setProfile((current) => ({ ...current, accepts_discount_card: value }))}
          />
        </View>

        <Text style={{ marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right" }}>الدوام الأسبوعي</Text>
        <TextInput
          multiline
          value={hoursText}
          onChangeText={setHoursText}
          placeholder='{"السبت":"9:00 - 13:00","الأحد":"مغلق"}'
          style={{ minHeight: 112, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", padding: 16, fontSize: 14, fontWeight: "500", color: "#0f172a", textAlign: "right" }}
        />

        <Pressable
          onPress={updateProfile}
          disabled={saving}
          style={{ marginTop: 16, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: saving ? "#cbd5e1" : "#0284c7" }}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>حفظ البيانات</Text>}
        </Pressable>
      </View>

      <View style={{ borderRadius: 24, backgroundColor: "#fff", padding: 20 }}>
        <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>الحجوزات الواردة</Text>

        {loading ? (
          <ActivityIndicator color="#0284c7" />
        ) : appointments.length === 0 ? (
          <Text style={{ fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#64748b", textAlign: "right" }}>لا توجد حجوزات حالياً.</Text>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={{ marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{appointment.patient_full_name ?? "مريض"}</Text>
              <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "500", color: "#475569", textAlign: "right" }}>
                {appointment.patient_phone ?? ""} {appointment.patient_identity ? `- ${appointment.patient_identity}` : ""}
              </Text>
              <DiscountCardBadge active={appointment.discount_card_status === "active"} />
              <Text style={{ marginTop: 4, fontSize: 14, fontWeight: "500", color: "#475569", textAlign: "right" }}>
                {appointment.date ?? ""} {appointment.time ? `- ${appointment.time}` : ""}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "500", color: "#64748b", textAlign: "right" }}>{appointment.patient_address ?? ""}</Text>
              {appointment.notes ? <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "500", color: "#334155", textAlign: "right" }}>{appointment.notes}</Text> : null}
              <View style={{ marginTop: 12, flexDirection: "row-reverse", gap: 8 }}>
                <Pressable
                  onPress={() => updateAppointmentStatus(appointment.id, "confirmed")}
                  style={{ borderRadius: 16, backgroundColor: "#059669", paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>تأكيد</Text>
                </Pressable>
                <Pressable
                  onPress={() => updateAppointmentStatus(appointment.id, "cancelled")}
                  style={{ borderRadius: 16, backgroundColor: "#f43f5e", paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>إلغاء</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function DiscountCardBadge({ active }: { active: boolean }) {
  return (
    <View style={{ marginTop: 8, alignSelf: "flex-end", flexDirection: "row-reverse", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: active ? "#bfdbfe" : "#e2e8f0", backgroundColor: active ? "#eff6ff" : "#f8fafc", paddingHorizontal: 10, paddingVertical: 6 }}>
      <Feather name="credit-card" size={13} color={active ? "#1d4ed8" : "#64748b"} />
      <Text style={{ color: active ? "#1d4ed8" : "#64748b", fontSize: 11, fontWeight: "900" }}>
        {active ? "مشترك بطاقة الخصم" : "غير مشترك"}
      </Text>
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ minWidth: 120, flex: 1, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: "#cbd5e1", textAlign: "right" }}>{label}</Text>
      <Text style={{ marginTop: 6, fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right" }}>{value}</Text>
    </View>
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
    <View style={{ marginBottom: 12 }}>
      <Text style={{ marginBottom: 8, fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{ minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", paddingHorizontal: 16, fontSize: 16, fontWeight: "500", color: "#0f172a", textAlign: "right" }}
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

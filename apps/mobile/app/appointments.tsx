import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { registerPushSubscription } from "../lib/notifications";
import { setStoredPatientPhone } from "../lib/push-manager";
import { AppButton } from "../components/Buttons";
import { AppCard } from "../components/AppCard";
import { AppSubtitle, AppTitle } from "../components/AppText";

type Appointment = {
  id: string;
  date?: string;
  time?: string | null;
  status?: "pending" | "confirmed" | "cancelled" | "completed" | string;
  notes?: string | null;
  patient_phone?: string | null;
  doctors?: {
    name?: string | null;
    city?: string | null;
    area?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
};

const statusStyle: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "قيد المراجعة", bg: "#fffbeb", text: "#b45309" },
  confirmed: { label: "مؤكد", bg: "#ecfdf5", text: "#047857" },
  cancelled: { label: "ملغي", bg: "#fef2f2", text: "#b91c1c" },
  completed: { label: "مكتمل", bg: "#eff6ff", text: "#2563eb" },
};

export default function PatientAppointmentsScreen() {
  const params = useLocalSearchParams<{ phone?: string; query?: string; identity_last4?: string }>();
  const [phoneValue, setPhoneValue] = useState(params.phone || params.query || "");
  const [identityLast4, setIdentityLast4] = useState((params.identity_last4 || "").replace(/[^0-9]/g, "").slice(0, 4));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const cleanPhone = useMemo(() => phoneValue.replace(/[^0-9]/g, ""), [phoneValue]);
  const cleanIdentity = useMemo(() => identityLast4.replace(/[^0-9]/g, "").slice(0, 4), [identityLast4]);
  const canSearch = cleanPhone.length >= 9;

  const loadAppointments = useCallback(async (phoneOverride?: string, identityOverride?: string) => {
    const phone = (phoneOverride ?? phoneValue).replace(/[^0-9]/g, "");
    const identity = (identityOverride ?? identityLast4).replace(/[^0-9]/g, "").slice(0, 4);
    if (phone.length < 9) return;

    setLoading(true);
    setSearched(true);
    setError("");
    const query = new URLSearchParams({ phone });
    if (identity.length === 4) {
      query.set("identity_last4", identity);
    }
    const { response, data } = await apiFetch<{ success?: boolean; appointments?: Appointment[]; error?: string }>(
      `/api/appointments?${query.toString()}`
    );
    setLoading(false);

    if (!response.ok) {
      setAppointments([]);
      setError(data?.error || "تعذر جلب الحجوزات");
      return;
    }

    const nextAppointments = Array.isArray(data?.appointments) ? data.appointments : [];
    setAppointments(nextAppointments);

    await setStoredPatientPhone(phone);
    void registerPushSubscription({
      role: "patient",
      patientPhone: phone,
    }).catch(() => null);
  }, [phoneValue, identityLast4]);

  useEffect(() => {
    const initialPhone = params.phone || params.query || "";
    const initialIdentity = (params.identity_last4 || "").replace(/[^0-9]/g, "").slice(0, 4);
    const normalizedPhone = initialPhone.replace(/[^0-9]/g, "");
    if (normalizedPhone.length >= 9) {
      setPhoneValue(initialPhone);
      if (initialIdentity.length === 4) {
        setIdentityLast4(initialIdentity);
      }
      void loadAppointments(normalizedPhone, initialIdentity);
    }
  }, [params.phone, params.query, params.identity_last4, loadAppointments]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Feather name="arrow-right" size={18} color="#334155" />
        <Text style={{ fontWeight: "800", color: "#334155" }}>رجوع</Text>
      </Pressable>

      <AppTitle>حجوزاتي</AppTitle>
      <AppSubtitle>أدخل رقم الهاتف. آخر 4 أرقام من الهوية اختياري.</AppSubtitle>

      <AppCard style={{ marginTop: 16, gap: 12 }}>
        <TextInput
          value={phoneValue}
          onChangeText={setPhoneValue}
          placeholder="رقم الهاتف"
          keyboardType="phone-pad"
          style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, textAlign: "right", fontWeight: "700" }}
        />
        <TextInput
          value={identityLast4}
          onChangeText={(v) => setIdentityLast4(v.replace(/[^0-9]/g, "").slice(0, 4))}
          placeholder="آخر 4 أرقام من الهوية (اختياري)"
          keyboardType="number-pad"
          maxLength={4}
          style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 14, textAlign: "right", fontWeight: "700" }}
        />
        <AppButton label={loading ? "جاري البحث..." : "عرض الحجوزات"} onPress={loadAppointments} disabled={!canSearch || loading} />
        {error ? <Text style={{ color: "#b91c1c", fontWeight: "700", textAlign: "right" }}>{error}</Text> : null}
      </AppCard>

      {loading ? <ActivityIndicator style={{ marginTop: 24 }} color="#0c5e47" /> : null}

      {!searched ? (
        <Text style={{ marginTop: 24, textAlign: "center", color: "#64748b", fontWeight: "600" }}>حجوزاتك ستظهر هنا بعد التحقق.</Text>
      ) : appointments.length === 0 && !loading ? (
        <Text style={{ marginTop: 24, textAlign: "center", color: "#64748b", fontWeight: "700" }}>لا توجد حجوزات لهذه البيانات.</Text>
      ) : (
        appointments.map((appointment) => {
          const status = statusStyle[appointment.status || "pending"] || statusStyle.pending;
          return (
            <AppCard key={appointment.id} style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "900", fontSize: 16, textAlign: "right" }}>{appointment.doctors?.name || "الطبيب"}</Text>
              <Text style={{ marginTop: 4, color: "#64748b", fontWeight: "600", textAlign: "right" }}>
                {[appointment.doctors?.city, appointment.doctors?.area].filter(Boolean).join(" - ")}
              </Text>
              <View style={{ marginTop: 8, alignSelf: "flex-end", backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: status.text, fontWeight: "800", fontSize: 12 }}>{status.label}</Text>
              </View>
              <Text style={{ marginTop: 8, fontWeight: "700", textAlign: "right" }}>
                {appointment.date} {appointment.time ? `— ${appointment.time}` : ""}
              </Text>
            </AppCard>
          );
        })
      )}
    </ScrollView>
  );
}

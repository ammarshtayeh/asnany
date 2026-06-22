import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { apiFetch } from "../lib/api";
import { registerPushSubscription } from "../lib/notifications";
import { setStoredPatientPhone } from "../lib/push-manager";
import { StackCard, StackPageLayout, StackPrimaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";

type Appointment = {
  id: string;
  date?: string;
  time?: string | null;
  status?: "pending" | "confirmed" | "cancelled" | "completed" | string;
  notes?: string | null;
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
  const params = useLocalSearchParams<{ phone?: string; query?: string }>();
  const [phoneValue, setPhoneValue] = useState(params.phone || params.query || "");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const cleanPhone = useMemo(() => phoneValue.replace(/[^0-9]/g, ""), [phoneValue]);
  const canSearch = cleanPhone.length >= 9;

  const loadAppointments = useCallback(async (phoneOverride?: string) => {
    const phone = (phoneOverride ?? phoneValue).replace(/[^0-9]/g, "");
    if (phone.length < 9) return;

    setLoading(true);
    setSearched(true);
    setError("");
    const query = new URLSearchParams({ phone });
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
    void registerPushSubscription({ role: "patient", patientPhone: phone }).catch(() => null);
  }, [phoneValue]);

  useEffect(() => {
    const initialPhone = params.phone || params.query || "";
    const normalizedPhone = initialPhone.replace(/[^0-9]/g, "");
    if (normalizedPhone.length >= 9) {
      setPhoneValue(initialPhone);
      void loadAppointments(normalizedPhone);
    }
  }, [params.phone, params.query, loadAppointments]);

  return (
    <StackPageLayout badge="📅 متابعة آمنة" title="حجوزاتي" subtitle="أدخل رقم الهاتف المستخدم في الحجز لعرض مواعيدك فقط">
      <StackCard>
        <TextInput
          value={phoneValue}
          onChangeText={setPhoneValue}
          placeholder="رقم الهاتف"
          keyboardType="phone-pad"
          placeholderTextColor={theme.textSoft}
          style={{ borderWidth: 1, borderColor: theme.borderLight, borderRadius: 14, padding: 14, textAlign: "right", fontWeight: "700", backgroundColor: theme.bg, color: theme.text }}
        />
        <View style={{ marginTop: 12 }}>
          <StackPrimaryButton label={loading ? "جاري البحث..." : "عرض الحجوزات"} onPress={() => void loadAppointments()} />
        </View>
        {error ? <Text style={{ color: "#b91c1c", fontWeight: "700", textAlign: "right", marginTop: 10 }}>{error}</Text> : null}
      </StackCard>

      {loading ? <ActivityIndicator style={{ marginTop: 8 }} color={theme.teal} /> : null}

      {!searched ? (
        <Text style={{ textAlign: "center", color: theme.textMuted, fontWeight: "600" }}>حجوزاتك ستظهر هنا بعد التحقق.</Text>
      ) : appointments.length === 0 && !loading ? (
        <StackCard>
          <Text style={{ textAlign: "center", color: theme.textMuted, fontWeight: "700" }}>لا توجد حجوزات لهذا الرقم.</Text>
        </StackCard>
      ) : (
        appointments.map((appointment) => {
          const status = statusStyle[appointment.status || "pending"] || statusStyle.pending;
          return (
            <StackCard key={appointment.id}>
              <Text style={{ fontWeight: "900", fontSize: 16, textAlign: "right", color: theme.text }}>{appointment.doctors?.name || "الطبيب"}</Text>
              <Text style={{ marginTop: 4, color: theme.textMuted, fontWeight: "600", textAlign: "right" }}>
                {[appointment.doctors?.city, appointment.doctors?.area].filter(Boolean).join(" - ")}
              </Text>
              <View style={{ marginTop: 8, alignSelf: "flex-end", backgroundColor: status.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: status.text, fontWeight: "800", fontSize: 12 }}>{status.label}</Text>
              </View>
              <Text style={{ marginTop: 8, fontWeight: "700", textAlign: "right", color: theme.text }}>
                {appointment.date} {appointment.time ? `— ${appointment.time}` : ""}
              </Text>
            </StackCard>
          );
        })
      )}
    </StackPageLayout>
  );
}

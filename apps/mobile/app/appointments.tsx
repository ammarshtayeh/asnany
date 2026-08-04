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
  booking_ref?: string | null;
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
  const params = useLocalSearchParams<{ phone?: string; query?: string; ref?: string; booking_ref?: string }>();
  const [phoneValue, setPhoneValue] = useState(params.phone || params.query || "");
  const [refValue, setRefValue] = useState(params.ref || params.booking_ref || "");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const cleanPhone = useMemo(() => phoneValue.replace(/[^0-9]/g, ""), [phoneValue]);
  const cleanRef = useMemo(() => refValue.trim().toUpperCase().replace(/\s+/g, ""), [refValue]);
  const canSearch = cleanPhone.length >= 9 && cleanRef.length >= 6;

  const loadAppointments = useCallback(async (phoneOverride?: string, refOverride?: string) => {
    const phone = (phoneOverride ?? phoneValue).replace(/[^0-9]/g, "");
    const ref = (refOverride ?? refValue).trim().toUpperCase().replace(/\s+/g, "");
    if (phone.length < 9 || ref.length < 6) return;

    setLoading(true);
    setSearched(true);
    setError("");
    const query = new URLSearchParams({ phone, ref });
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
  }, [phoneValue, refValue]);

  useEffect(() => {
    const initialPhone = params.phone || params.query || "";
    const initialRef = params.ref || params.booking_ref || "";
    const normalizedPhone = initialPhone.replace(/[^0-9]/g, "");
    const normalizedRef = String(initialRef).trim().toUpperCase().replace(/\s+/g, "");
    if (normalizedPhone.length >= 9 && normalizedRef.length >= 6) {
      setPhoneValue(initialPhone);
      setRefValue(String(initialRef));
      void loadAppointments(normalizedPhone, normalizedRef);
    }
  }, [params.phone, params.query, params.ref, params.booking_ref, loadAppointments]);

  return (
    <StackPageLayout badge="📅 متابعة آمنة" title="حجوزاتي" subtitle="أدخل رقم الهاتف ورمز الحجز (MLH-XXXXXX) لمتابعة موعدك">
      <StackCard>
        <TextInput
          value={phoneValue}
          onChangeText={setPhoneValue}
          placeholder="رقم الهاتف"
          keyboardType="phone-pad"
          placeholderTextColor={theme.textSoft}
          style={{ borderWidth: 1, borderColor: theme.borderLight, borderRadius: 14, padding: 14, textAlign: "right", fontWeight: "700", backgroundColor: theme.bg, color: theme.text }}
        />
        <TextInput
          value={refValue}
          onChangeText={setRefValue}
          placeholder="رمز الحجز — MLH-XXXXXX"
          autoCapitalize="characters"
          placeholderTextColor={theme.textSoft}
          style={{ marginTop: 10, borderWidth: 1, borderColor: theme.borderLight, borderRadius: 14, padding: 14, textAlign: "right", fontWeight: "800", backgroundColor: theme.bg, color: theme.text, letterSpacing: 1 }}
        />
        <View style={{ marginTop: 12, opacity: !canSearch || loading ? 0.6 : 1 }}>
          <StackPrimaryButton label={loading ? "جاري البحث..." : "عرض الحجز"} onPress={() => void loadAppointments()} />
        </View>
        {error ? <Text style={{ color: "#b91c1c", fontWeight: "700", textAlign: "right", marginTop: 10 }}>{error}</Text> : null}
      </StackCard>

      {loading ? <ActivityIndicator style={{ marginTop: 8 }} color={theme.teal} /> : null}

      {!searched ? (
        <Text style={{ textAlign: "center", color: theme.textMuted, fontWeight: "600" }}>رمز الحجز يظهر بعد إرسال طلب الموعد.</Text>
      ) : appointments.length === 0 && !loading ? (
        <StackCard>
          <Text style={{ textAlign: "center", color: theme.textMuted, fontWeight: "700" }}>لا يوجد حجز مطابق لهذا الرقم والرمز.</Text>
        </StackCard>
      ) : (
        appointments.map((item) => {
          const status = statusStyle[item.status || "pending"] || statusStyle.pending;
          return (
            <StackCard key={item.id}>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ textAlign: "right", fontWeight: "900", color: theme.text, fontSize: 16 }}>{item.doctors?.name || "عيادة ملامح"}</Text>
                  {item.booking_ref ? <Text style={{ textAlign: "right", fontWeight: "900", color: "#b45309", marginTop: 4 }}>{item.booking_ref}</Text> : null}
                </View>
                <View style={{ backgroundColor: status.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: status.text, fontWeight: "900", fontSize: 11 }}>{status.label}</Text>
                </View>
              </View>
              <Text style={{ textAlign: "right", color: theme.textMuted, fontWeight: "700", marginTop: 10 }}>
                {item.date || "—"} · {item.time || "—"}
              </Text>
              {item.notes ? <Text style={{ textAlign: "right", color: theme.textSoft, marginTop: 6 }}>{item.notes}</Text> : null}
            </StackCard>
          );
        })
      )}
    </StackPageLayout>
  );
}

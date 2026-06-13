import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { AppButton } from "../components/Buttons";
import { AppCard } from "../components/AppCard";
import { AppSubtitle, AppTitle } from "../components/AppText";

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
  const params = useLocalSearchParams<{ phone?: string }>();
  const [phone, setPhone] = useState(params.phone || "");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const cleanPhone = useMemo(() => phone.replace(/[^0-9]/g, ""), [phone]);
  const canSearch = cleanPhone.length >= 7;

  useEffect(() => {
    if (params.phone && params.phone.replace(/[^0-9]/g, "").length >= 7) {
      void loadAppointments(params.phone);
    }
  }, [params.phone]);

  const loadAppointments = async (nextPhone = phone) => {
    const normalized = nextPhone.replace(/[^0-9]/g, "");
    if (normalized.length < 7) return;

    setLoading(true);
    setSearched(true);
    const { response, data } = await apiFetch<{ success?: boolean; appointments?: Appointment[]; error?: string }>(
      `/api/appointments?phone=${encodeURIComponent(nextPhone)}`
    );
    setLoading(false);

    if (!response.ok) {
      setAppointments([]);
      return;
    }

    setAppointments(Array.isArray(data?.appointments) ? data.appointments : []);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "900" }}>متابعة بسيطة</Text>
          <Text style={{ color: "#0f172a", fontSize: 24, fontWeight: "900", marginTop: 3 }}>حجوزاتي</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>رقم الهاتف</AppTitle>
        <AppSubtitle>اكتب نفس الرقم المستخدم في الحجز. لا تحتاج حساب أو كلمة مرور.</AppSubtitle>
        <View style={{ marginTop: 14 }}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="مثال: 059xxxxxxx"
            placeholderTextColor="#94a3b8"
            style={{
              minHeight: 52,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
              paddingHorizontal: 14,
              textAlign: "right",
              color: "#0f172a",
              fontWeight: "800",
            }}
          />
        </View>
        <AppButton label={loading ? "جاري البحث..." : "عرض حجوزاتي"} onPress={() => loadAppointments()} disabled={!canSearch || loading} style={{ marginTop: 12 }} />
      </AppCard>

      <View style={{ marginTop: 14, gap: 10 }}>
        {loading ? (
          <View style={{ padding: 28, alignItems: "center" }}>
            <ActivityIndicator color="#0f172a" />
          </View>
        ) : !searched ? (
          <EmptyState title="حجوزاتك ستظهر هنا" text="ابحث برقم الهاتف لعرض آخر المواعيد وحالتها." />
        ) : appointments.length === 0 ? (
          <EmptyState title="لا توجد حجوزات" text="تأكد من الرقم أو ابدأ حجزاً جديداً من صفحة الطبيب." />
        ) : (
          appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
        )}
      </View>
    </ScrollView>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const status = statusStyle[appointment.status || "pending"] || statusStyle.pending;
  const doctorName = appointment.doctors?.name || "الطبيب";
  const place = [appointment.doctors?.city, appointment.doctors?.area].filter(Boolean).join(" - ");

  return (
    <View style={{ borderRadius: 22, backgroundColor: "#fff", padding: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", textAlign: "right" }}>{doctorName}</Text>
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "700", textAlign: "right", marginTop: 3 }}>{place || "عيادة ملامح"}</Text>
        </View>
        <View style={{ borderRadius: 999, backgroundColor: status.bg, paddingHorizontal: 12, paddingVertical: 7 }}>
          <Text style={{ color: status.text, fontSize: 12, fontWeight: "900" }}>{status.label}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 14 }}>
        <InfoPill icon="calendar" text={appointment.date || "بدون تاريخ"} />
        <InfoPill icon="clock" text={appointment.time || "بدون وقت"} />
      </View>
      {appointment.notes ? <Text style={{ marginTop: 10, color: "#64748b", fontSize: 12, lineHeight: 20, fontWeight: "700", textAlign: "right" }}>{appointment.notes}</Text> : null}
    </View>
  );
}

function InfoPill({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6, borderRadius: 14, backgroundColor: "#f8fafc", paddingHorizontal: 10, paddingVertical: 8 }}>
      <Feather name={icon} size={14} color="#0ea5e9" />
      <Text style={{ color: "#334155", fontSize: 12, fontWeight: "900" }}>{text}</Text>
    </View>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ borderRadius: 22, backgroundColor: "#fff", padding: 26, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" }}>
      <Feather name="calendar" size={30} color="#cbd5e1" />
      <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", marginTop: 12, textAlign: "center" }}>{title}</Text>
      <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "700", marginTop: 6, lineHeight: 21, textAlign: "center" }}>{text}</Text>
    </View>
  );
}

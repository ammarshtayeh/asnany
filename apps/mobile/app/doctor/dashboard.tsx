import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../../lib/api";
import { AppointmentRecord, Doctor } from "../../lib/types";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/Buttons";
import { AppSubtitle, AppTitle } from "../../components/AppText";

const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function DoctorDashboardScreen() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    whatsapp: "",
    city: "",
    area: "",
    address: "",
    bio: "",
    is_available: true,
    availability_note: "",
    working_hours: {} as Record<string, string>,
  });

  const load = async () => {
    setLoading(true);
    const { response, data } = await apiFetch<{ doctor?: Doctor; appointments?: AppointmentRecord[] }>("/api/doctor/me");
    if (!response.ok) {
      Alert.alert("تنبيه", data?.error || "يجب تسجيل الدخول كطبيب");
      router.replace("/doctor/login");
      return;
    }
    setDoctor(data?.doctor || null);
    setAppointments(data?.appointments || []);
    setForm({
      phone: data?.doctor?.phone || "",
      whatsapp: data?.doctor?.whatsapp || "",
      city: data?.doctor?.city || "",
      area: data?.doctor?.area || "",
      address: data?.doctor?.address || "",
      bio: data?.doctor?.bio || "",
      is_available: data?.doctor?.is_available !== false,
      availability_note: data?.doctor?.availability_note || "",
      working_hours: data?.doctor?.working_hours || {},
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(
    () => ({
      pending: appointments.filter((item) => item.status === "pending").length,
      confirmed: appointments.filter((item) => item.status === "confirmed").length,
      today: appointments.filter((item) => item.date === new Date().toISOString().slice(0, 10)).length,
    }),
    [appointments],
  );

  const saveProfile = async () => {
    setSaving(true);
    const { response, data } = await apiFetch("/api/doctor/profile", { method: "PATCH", body: JSON.stringify(form) });
    setSaving(false);
    if (!response.ok) return Alert.alert("تعذر الحفظ", data?.error || "حاول مرة ثانية");
    setDoctor(data?.doctor || null);
    Alert.alert("تم الحفظ", "تم تحديث بيانات العيادة.");
  };

  const updateAppointment = async (id: string, status: string) => {
    const { response, data } = await apiFetch("/api/doctor/appointments", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) return Alert.alert("تعذر التحديث", data?.error || "حاول مرة ثانية");
    setAppointments((current) => current.map((item) => (item.id === id ? data.appointment : item)));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <AppSubtitle>جارٍ تحميل لوحة الطبيب...</AppSubtitle>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>لوحة الطبيب</AppTitle>
        <AppSubtitle>أهلًا د. {doctor?.name || ""} - نفس لوحة الويب، لكن مصممة للموبايل.</AppSubtitle>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Stat label="قيد المراجعة" value={stats.pending} />
          <Stat label="مؤكدة" value={stats.confirmed} />
          <Stat label="اليوم" value={stats.today} />
        </View>
        <AppButton label="تحديث الصفحة" variant="secondary" onPress={load} style={{ marginTop: 12 }} />
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>الحجوزات</AppTitle>
        <View style={{ gap: 12, marginTop: 12 }}>
          {appointments.length === 0 ? (
            <AppSubtitle>لا توجد حجوزات بعد.</AppSubtitle>
          ) : (
            appointments.map((item) => (
              <View key={item.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "white", padding: 14 }}>
                <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>{item.patient_full_name || item.patient_name}</Text>
                <Text style={{ textAlign: "right", color: "#64748b", marginTop: 4, fontWeight: "700" }}>{item.patient_phone}</Text>
                <Text style={{ textAlign: "right", color: "#475569", marginTop: 4, fontWeight: "700" }}>
                  الهوية: {item.patient_identity || "غير مدخلة"} | العنوان: {item.patient_address || "غير مدخل"}
                </Text>
                <Text style={{ textAlign: "right", color: "#475569", marginTop: 4, fontWeight: "700" }}>
                  التاريخ: {item.date} | الوقت: {item.time}
                </Text>
                {item.notes ? <Text style={{ textAlign: "right", marginTop: 6, color: "#334155", fontWeight: "700" }}>{item.notes}</Text> : null}
                <View style={{ marginTop: 10 }}>
                  <Text style={{ textAlign: "right", color: "#64748b", fontWeight: "900", marginBottom: 6 }}>الحالة</Text>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                      <AppButton
                        key={status}
                        label={status}
                        variant={item.status === status ? "primary" : "secondary"}
                        onPress={() => updateAppointment(item.id, status)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>حالة العيادة</AppTitle>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <Switch value={form.is_available} onValueChange={(value) => setForm((current) => ({ ...current, is_available: value }))} />
          <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>موجود ومتاح في العيادة</Text>
        </View>
        <Field label="ملاحظة الحالة" value={form.availability_note} onChangeText={(value) => setForm((current) => ({ ...current, availability_note: value }))} multiline />
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>بيانات التواصل</AppTitle>
        <Field label="هاتف العيادة" value={form.phone} onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))} keyboardType="phone-pad" />
        <Field label="واتساب" value={form.whatsapp} onChangeText={(value) => setForm((current) => ({ ...current, whatsapp: value }))} keyboardType="phone-pad" />
        <Field label="المدينة" value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} />
        <Field label="المنطقة" value={form.area} onChangeText={(value) => setForm((current) => ({ ...current, area: value }))} />
        <Field label="العنوان التفصيلي" value={form.address} onChangeText={(value) => setForm((current) => ({ ...current, address: value }))} multiline />
        <Field label="نبذة" value={form.bio} onChangeText={(value) => setForm((current) => ({ ...current, bio: value }))} multiline />
        <AppTitle style={{ fontSize: 20, marginTop: 16 }}>الدوام الأسبوعي</AppTitle>
        {DAYS.map((day) => (
          <Field
            key={day}
            label={day}
            value={form.working_hours[day] || ""}
            onChangeText={(value) =>
              setForm((current) => ({
                ...current,
                working_hours: { ...current.working_hours, [day]: value },
              }))
            }
            placeholder="09:00 ص - 05:00 م"
          />
        ))}
        <AppButton label={saving ? "جارٍ الحفظ..." : "حفظ بيانات العيادة"} onPress={saveProfile} style={{ marginTop: 12 }} />
        <AppButton label="خروج" variant="secondary" onPress={() => router.replace("/doctor/login")} style={{ marginTop: 10 }} />
      </AppCard>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ backgroundColor: "#eff6ff", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, minWidth: 96 }}>
      <Text style={{ textAlign: "right", color: "#2563eb", fontWeight: "900", fontSize: 22 }}>{value}</Text>
      <Text style={{ textAlign: "right", color: "#475569", fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad";
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        style={{
          minHeight: multiline ? 88 : 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlign: "right",
          fontWeight: "700",
          color: "#0f172a",
        }}
      />
    </View>
  );
}

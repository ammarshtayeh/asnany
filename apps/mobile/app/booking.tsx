import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { registerPushSubscription } from "../lib/notifications";
import { AppCard } from "../components/AppCard";
import { AppButton } from "../components/Buttons";
import { AppSubtitle, AppTitle } from "../components/AppText";

const WEEKDAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

type DoctorPreview = {
  id: string;
  name?: string;
  city?: string;
  area?: string;
  working_hours?: Record<string, string>;
  is_available?: boolean;
  availability_note?: string;
};

export default function BookingScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const [doctor, setDoctor] = useState<DoctorPreview | null>(null);
  const [doctorLoading, setDoctorLoading] = useState(Boolean(doctorId));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDoctor = async () => {
      if (!doctorId) return;
      setDoctorLoading(true);
      const { response, data } = await apiFetch<{ error?: string }>("/api/doctors");
      if (cancelled) return;

      if (response.ok) {
        const list = Array.isArray(data) ? data : Array.isArray((data as any)?.doctors) ? (data as any).doctors : [];
        setDoctor(list.find((item: any) => item.id === doctorId) || null);
      } else {
        setDoctor(null);
      }
      setDoctorLoading(false);
    };

    loadDoctor();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  const selectedWeekday = useMemo(() => {
    if (!date) return "";
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return "";
    return WEEKDAY_AR[parsed.getDay()];
  }, [date]);

  const isDoctorAvailableForSlot = useMemo(() => {
    if (!doctor) return true;
    if (doctor.is_available === false) return false;

    const note = String(doctor.availability_note || "");
    if (note.includes("مغلق")) return false;

    const hours = doctor.working_hours || {};
    const dayHours = selectedWeekday ? String(hours[selectedWeekday] || "") : "";
    if (dayHours.includes("مغلق")) return false;

    return true;
  }, [doctor, selectedWeekday]);

  const canSubmit = useMemo(
    () => Boolean(fullName && phone && identity && address && date && time && doctorId),
    [fullName, phone, identity, address, date, time, doctorId]
  );

  const submit = async () => {
    if (!doctorId) return Alert.alert("تنبيه", "اختر طبيباً أولاً من صفحة الطبيب أو من القائمة.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email)) {
      return Alert.alert("خطأ في البيانات", "يرجى إدخال بريد إلكتروني صحيح");
    }

    if (!isDoctorAvailableForSlot) {
      return Alert.alert(
        "الطبيب غير متاح",
        selectedWeekday
          ? `الموعد المختار يبدو خارج دوام الطبيب يوم ${selectedWeekday}. اختر يوماً آخر.`
          : "الطبيب معلن أنه غير متاح الآن. اختر موعداً آخر."
      );
    }

    setLoading(true);
    const { response, data } = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctorId,
        patient_full_name: fullName,
        patient_email: email.trim() || null,
        patient_phone: phone,
        patient_identity: identity,
        patient_address: address,
        date,
        time,
        notes,
      }),
    });
    setLoading(false);

    if (!response.ok) {
      const message =
        response.status === 409
          ? data?.error || "هذا الموعد محجوز للتو. اختر وقتاً آخر من فضلك."
          : data?.error || "حاول مرة ثانية";
      return Alert.alert("تعذر الحجز", message);
    }

    void registerPushSubscription({
      role: "patient",
      patientPhone: phone,
    }).catch(() => null);

    Alert.alert("تم إرسال طلب الحجز", "سنرسل لك تنبيهاً عند تحديث حالة الموعد. يمكنك متابعة الحجز من صفحة حجوزاتي.", [
      { text: "لاحقاً", onPress: () => router.back(), style: "cancel" },
      { text: "حجوزاتي", onPress: () => router.replace({ pathname: "/appointments", params: { phone } } as any) },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>عيادات ملامح</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4 }}>حجز موعد جديد</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>حجز موعد</AppTitle>
        <AppSubtitle>املأ البيانات الأساسية فقط. بعد الإرسال تقدر تتابع حالة الحجز من صفحة حجوزاتي برقم الهاتف أو الاسم الرباعي.</AppSubtitle>

        {doctorId ? (
          <View style={{ marginTop: 12, borderRadius: 18, backgroundColor: "#eff6ff", padding: 14, borderWidth: 1, borderColor: "#dbeafe" }}>
            <Text style={{ textAlign: "right", fontWeight: "900", color: "#0f172a", marginBottom: 4 }}>
              {doctorLoading ? "جاري تحميل معلومات الطبيب..." : doctor?.name || "الطبيب المختار"}
            </Text>
            <Text style={{ textAlign: "right", fontWeight: "700", color: "#475569", fontSize: 12, lineHeight: 18 }}>
              {doctorLoading
                ? "نتأكد من الدوام والحالة الحالية قبل إرسال الحجز."
                : doctor?.is_available === false
                  ? "الطبيب معلن أنه غير متاح حالياً. اختر موعداً آخر."
                  : isDoctorAvailableForSlot
                    ? "الطبيب يظهر متاحاً لهذا الموعد مبدئياً."
                    : `الوقت المختار يبدو خارج دوام ${selectedWeekday || "اليوم"}.`}
            </Text>
          </View>
        ) : null}

        <Field label="الاسم الرباعي *" value={fullName} onChangeText={setFullName} />
        <Field label="البريد الإلكتروني - اختياري" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="example@domain.com" />
        <Field label="رقم الهاتف *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="رقم الهوية *" value={identity} onChangeText={setIdentity} keyboardType="number-pad" />
        <Field label="العنوان *" value={address} onChangeText={setAddress} />
        <Field label="التاريخ *" value={date} onChangeText={setDate} placeholder="2026-06-01" />
        <Field label="الوقت *" value={time} onChangeText={setTime} placeholder="10:30" />
        <Field label="ملاحظات" value={notes} onChangeText={setNotes} multiline />

        <AppButton label={loading ? "جارٍ الحجز..." : "تأكيد الحجز"} onPress={submit} disabled={!canSubmit || loading || doctorLoading} style={{ marginTop: 12 }} />
      </AppCard>
    </ScrollView>
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
  keyboardType?: "default" | "phone-pad" | "number-pad" | "email-address";
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
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          minHeight: multiline ? 96 : 48,
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

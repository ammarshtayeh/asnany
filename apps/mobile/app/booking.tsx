import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { apiFetch } from "../lib/api";
import { AppCard } from "../components/AppCard";
import { AppButton } from "../components/Buttons";
import { AppSubtitle, AppTitle } from "../components/AppText";

export default function BookingScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => Boolean(fullName && phone && identity && address && date && time && doctorId), [fullName, phone, identity, address, date, time, doctorId]);

  const submit = async () => {
    if (!doctorId) return Alert.alert("تنبيه", "اختر طبيباً أولاً من صفحة الطبيب أو من القائمة.");
    setLoading(true);
    const { response, data } = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctorId,
        full_name: fullName,
        phone,
        identity,
        address,
        date,
        time,
        notes,
      }),
    });
    setLoading(false);
    if (!response.ok) return Alert.alert("تعذر الحجز", data?.error || "حاول مرة ثانية");
    Alert.alert("تم الحجز", "سيظهر الحجز أيضاً للطبيب في لوحة التحكم.");
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>حجز موعد</AppTitle>
        <AppSubtitle>الاسم الرباعي، الهوية، والعنوان تظهر للطبيب مباشرة مثل الموقع.</AppSubtitle>
        <Field label="الاسم الرباعي" value={fullName} onChangeText={setFullName} />
        <Field label="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="رقم الهوية" value={identity} onChangeText={setIdentity} keyboardType="number-pad" />
        <Field label="العنوان" value={address} onChangeText={setAddress} />
        <Field label="التاريخ" value={date} onChangeText={setDate} placeholder="2026-06-01" />
        <Field label="الوقت" value={time} onChangeText={setTime} placeholder="10:30" />
        <Field label="ملاحظات" value={notes} onChangeText={setNotes} multiline />
        <AppButton label={loading ? "جارٍ الحجز..." : "تأكيد الحجز"} onPress={submit} disabled={!canSubmit || loading} style={{ marginTop: 12 }} />
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
  keyboardType?: "default" | "phone-pad" | "number-pad";
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

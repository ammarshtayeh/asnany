import { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { AppCard } from "../components/AppCard";
import { AppButton } from "../components/Buttons";
import { AppSubtitle, AppTitle } from "../components/AppText";

export default function BookingScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => 
    Boolean(fullName && email && phone && identity && address && date && time && doctorId), 
    [fullName, email, phone, identity, address, date, time, doctorId]
  );

  const submit = async () => {
    if (!doctorId) return Alert.alert("تنبيه", "اختر طبيباً أولاً من صفحة الطبيب أو من القائمة.");
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert("خطأ في البيانات", "يرجى إدخال بريد إلكتروني صحيح");
    }

    setLoading(true);
    const { response, data } = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctorId,
        patient_full_name: fullName,
        patient_email: email,
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
    Alert.alert("تم الحجز بنجاح", "تم تسجيل حجزك وسيظهر للطبيب في لوحة التحكم الخاصة به.");
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      {/* Top Header with Back Button */}
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>عيادات أسناني</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4 }}>حجز موعد جديد</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>حجز موعد</AppTitle>
        <AppSubtitle>الاسم الرباعي، البريد الإلكتروني، الهوية، والعنوان تظهر للطبيب مباشرة لتأكيد حجزك.</AppSubtitle>
        <Field label="الاسم الرباعي *" value={fullName} onChangeText={setFullName} />
        <Field label="البريد الإلكتروني *" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="example@domain.com" />
        <Field label="رقم الهاتف *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="رقم الهوية *" value={identity} onChangeText={setIdentity} keyboardType="number-pad" />
        <Field label="العنوان *" value={address} onChangeText={setAddress} />
        <Field label="التاريخ *" value={date} onChangeText={setDate} placeholder="2026-06-01" />
        <Field label="الوقت *" value={time} onChangeText={setTime} placeholder="10:30" />
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

import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Link, useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../../lib/api";
import { Doctor } from "../../lib/types";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/Buttons";
import { AppSubtitle, AppTitle } from "../../components/AppText";
import { ClinicMap } from "../../components/ClinicMap";
import { buildNativeMapsUrl } from "../../lib/map-links";
import { registerPushSubscription } from "../../lib/notifications";
import { supabase } from "../../lib/supabase";

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identity, setIdentity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("doctors")
            .select("*")
            .eq("id", id)
            .single();
          if (error) throw error;
          setDoctor(data || null);
        }
      } catch (error) {
        console.error("Fetch doctor details error:", error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const book = async () => {
    if (!doctor) return;
    setBooking(true);
    const { response, data } = await apiFetch("/api/appointments", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctor.id,
        full_name: fullName,
        phone,
        identity,
        address,
        date,
        time,
        notes,
      }),
    });
    setBooking(false);
    if (!response.ok) return Alert.alert("تعذر الحجز", data?.error || "حاول لاحقاً");
    void registerPushSubscription({
      role: "patient",
      patientPhone: phone,
    }).catch(() => null);
    Alert.alert("تم الحجز", "تم إرسال طلبك للطبيب.");
    router.push("/booking");
  };

  const whatsapp = () => doctor?.whatsapp && Linking.openURL(`https://wa.me/${doctor.whatsapp.replace(/[^0-9]/g, "")}`);
  const openDeviceMap = () => doctor && Linking.openURL(buildNativeMapsUrl(doctor));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", padding: 24 }}>
        <Text style={{ fontWeight: "900", color: "#020617", fontSize: 20, textAlign: "right" }}>لم يتم العثور على الطبيب</Text>
        <AppButton
          label="الرجوع"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          style={{ marginTop: 12 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      {/* Top Header with Back Button */}
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>الملف الشخصي للأخصائي</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4 }}>{doctor.name}</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>{doctor.name}</AppTitle>
        <AppSubtitle>{doctor.city || "غير محدد"} {doctor.area ? `• ${doctor.area}` : ""}</AppSubtitle>
        <AppSubtitle style={{ marginTop: 8 }}>{doctor.bio || "صفحة الطبيب مع كل البيانات الأساسية مثل الموقع."}</AppSubtitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          {(doctor.specialty || []).map((item) => (
            <View key={item} style={{ backgroundColor: "#eff6ff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: "#2563eb", fontWeight: "900" }}>{item}</Text>
            </View>
          ))}
          {doctor.accepts_discount_card ? (
            <View style={{ backgroundColor: "#dcfce7", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: "#166534", fontWeight: "900" }}>خصم البطاقة</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 14 }}>
          <AppButton label="واتساب" variant="secondary" onPress={whatsapp} />
          <AppButton label="حجز موعد" onPress={() => router.push(`/booking?doctorId=${doctor.id}`)} />
        </View>
      </AppCard>

      <ClinicMap doctor={doctor} />

      <View style={{ marginTop: 12, flexDirection: "row", gap: 8 }}>
        <Link href={`/doctors/${doctor.id}/map`} asChild>
          <Pressable style={{ flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "900" }}>الخريطة داخل التطبيق</Text>
          </Pressable>
        </Link>
        <Pressable onPress={openDeviceMap} style={{ flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>فتح في خرائط الجهاز</Text>
        </Pressable>
      </View>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>احجز مباشرة</AppTitle>
        <Field label="الاسم الرباعي" value={fullName} onChangeText={setFullName} />
        <Field label="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="رقم الهوية" value={identity} onChangeText={setIdentity} keyboardType="number-pad" />
        <Field label="العنوان" value={address} onChangeText={setAddress} />
        <Field label="التاريخ" value={date} onChangeText={setDate} placeholder="2026-06-01" />
        <Field label="الوقت" value={time} onChangeText={setTime} placeholder="10:30" />
        <Field label="ملاحظات" value={notes} onChangeText={setNotes} multiline />
        <AppButton label={booking ? "جارٍ الإرسال..." : "إرسال الحجز"} onPress={book} style={{ marginTop: 12 }} disabled={booking} />
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

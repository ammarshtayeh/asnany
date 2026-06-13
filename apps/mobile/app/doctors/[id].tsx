import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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
import { useAppToast } from "../../components/AppToast";

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
  const { showToast } = useAppToast();

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
    if (!fullName || !phone || !identity || !address || !date || !time) {
      showToast({ type: "info", title: "حقول ناقصة", message: "يرجى تعبئة بيانات الحجز المطلوبة." });
      return;
    }
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
    if (!response.ok) {
      showToast({ type: "error", title: "تعذر الحجز", message: data?.error || "حاول لاحقاً" });
      return;
    }
    void registerPushSubscription({
      role: "patient",
      patientPhone: phone,
    }).catch(() => null);
    showToast({ type: "success", title: "تم الحجز بنجاح", message: "تم إرسال طلب الموعد للطبيب." });
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

  // Safely parse specialties array/string
  const specialties = Array.isArray(doctor.specialty)
    ? doctor.specialty
    : doctor.specialty
    ? [doctor.specialty]
    : [];

  const workingHours = doctor.working_hours || doctor.workingHours || {};
  const hasWorkingHours = Object.keys(workingHours).length > 0;
  
  const insuranceList = doctor.insurance_list || doctor.insuranceList || [];
  const acceptsInsurance = doctor.accepts_insurance || doctor.acceptsInsurance;

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

      {/* Main Info Card */}
      <AppCard>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <AppTitle style={{ flex: 1, textAlign: "right" }}>{doctor.name}</AppTitle>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
            <Feather name="star" size={14} color="#d97706" />
            <Text style={{ color: "#d97706", fontWeight: "900", fontSize: 12 }}>{doctor.rating ? doctor.rating.toFixed(1) : "5.0"}</Text>
          </View>
        </View>
        
        <AppSubtitle style={{ textAlign: "right", marginTop: 4 }}>
          {doctor.city || "غير محدد"} {doctor.area ? `• ${doctor.area}` : ""}
        </AppSubtitle>
        {doctor.address ? (
          <Text style={{ textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: "700", marginTop: 4 }}>
            📍 {doctor.address}
          </Text>
        ) : null}

        <AppSubtitle style={{ marginTop: 12, textAlign: "right", lineHeight: 22 }}>
          {doctor.bio || "صفحة الطبيب المعتمد مع كل البيانات الأساسية مثل الموقع والتواصل والحجوزات."}
        </AppSubtitle>
        
        {/* Specialties Tags */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
          {specialties.map((item) => (
            <View key={item} style={{ backgroundColor: "#eff6ff", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#dbeafe" }}>
              <Text style={{ color: "#2563eb", fontWeight: "900", fontSize: 11 }}>{item}</Text>
            </View>
          ))}
          {doctor.accepts_discount_card ? (
            <View style={{ backgroundColor: "#dcfce7", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#bbf7d0" }}>
              <Text style={{ color: "#166534", fontWeight: "900", fontSize: 11 }}>🎫 خصم البطاقة</Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 18, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 14 }}>
          {doctor.whatsapp ? (
            <AppButton label="تواصل واتساب" variant="secondary" onPress={whatsapp} style={{ flex: 1 }} />
          ) : null}
          <AppButton label="حجز موعد عيادة" onPress={() => router.push(`/booking?doctorId=${doctor.id}`)} style={{ flex: 1 }} />
        </View>
      </AppCard>

      {/* Insurance Info Card */}
      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="shield" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 16 }}>الغطاء التأميني والدفع</AppTitle>
        </View>
        <Text style={{ textAlign: "right", fontWeight: "800", color: acceptsInsurance ? "#166534" : "#64748b", fontSize: 13 }}>
          {acceptsInsurance ? "🏥 يقبل شركات التأمين الطبي" : "💳 الدفع شخصي فقط"}
        </Text>
        {acceptsInsurance && insuranceList.length > 0 ? (
          <View style={{ marginTop: 8, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, fontWeight: "900", color: "#475569", marginBottom: 4 }}>الشركات المعتمدة:</Text>
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }}>
              {insuranceList.map((ins: string) => (
                <View key={ins} style={{ backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0" }}>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#334155" }}>{ins}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </AppCard>

      {/* Weekly Working Hours Card */}
      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Feather name="clock" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 16 }}>أوقات العمل الأسبوعية</AppTitle>
        </View>
        {hasWorkingHours ? (
          <View style={{ gap: 6 }}>
            {(Object.entries(workingHours) as [string, string][]).map(([day, hours]) => (
              <View key={day} style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f8fafc" }}>
                <Text style={{ fontSize: 12, fontWeight: "900", color: "#334155" }}>{day}</Text>
                <Text style={{ fontSize: 12, fontWeight: "800", color: hours.includes("مغلق") || hours.includes("Closed") ? "#ef4444" : "#0f172a" }}>{hours}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: "700" }}>اتصل بالعيادة للاستعلام عن أوقات الدوام.</Text>
        )}
      </AppCard>

      {/* Clinic Location Map */}
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

      {/* Smart Booking Form Card */}
      <AppCard>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="calendar" size={18} color="#0f172a" />
          <AppTitle style={{ fontSize: 18 }}>احجز موعد مباشرة</AppTitle>
        </View>
        <Field label="الاسم الرباعي للمريض *" value={fullName} onChangeText={setFullName} />
        <Field label="رقم الهاتف للتأكيد *" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="رقم الهوية الشخصية *" value={identity} onChangeText={setIdentity} keyboardType="number-pad" />
        <Field label="العنوان السكني الحالي *" value={address} onChangeText={setAddress} />
        <Field label="التاريخ المطلوب للحجز *" value={date} onChangeText={setDate} placeholder="مثال: YYYY-MM-DD" />
        <Field label="الوقت المفضل *" value={time} onChangeText={setTime} placeholder="مثال: 11:30 صباحاً" />
        <Field label="ملاحظات أو الأعراض الطبية" value={notes} onChangeText={setNotes} multiline />
        
        <AppButton 
          label={booking ? "جارٍ إرسال طلب الحجز..." : "تأكيد طلب الحجز الإلكتروني"} 
          onPress={book} 
          style={{ marginTop: 18 }} 
          disabled={booking} 
        />
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

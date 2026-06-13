import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Doctor } from "../lib/types";
import { AppButton } from "../components/Buttons";
import { AppCard } from "../components/AppCard";
import { AppSubtitle, AppTitle } from "../components/AppText";
import { useAppToast } from "../components/AppToast";

export default function DiscountCardScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useAppToast();

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase.from("doctors").select("*").eq("verified", true);
        if (error) throw error;
        setDoctors(data || []);
      } catch (err) {
        console.error("Error loading discount card doctors:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const participating = useMemo(
    () => doctors.filter((doctor) => doctor.accepts_discount_card || doctor.discount_note || doctor.discount_value),
    [doctors],
  );
  const canSubmit = fullName.trim().length >= 3 && phone.replace(/[^0-9]/g, "").length >= 7 && city.trim().length >= 2;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const { response, data } = await apiFetch<{ error?: string }>("/api/discount-card/request", {
      method: "POST",
      body: JSON.stringify({ full_name: fullName, phone, city }),
    });
    setSubmitting(false);

    if (!response.ok) {
      showToast({ type: "error", title: "تعذر إرسال الطلب", message: data?.error || "حاول مرة ثانية" });
      return;
    }

    setFullName("");
    setPhone("");
    setCity("");
    showToast({ type: "success", title: "وصل طلبك", message: "سنراجع البطاقة ونتواصل معك للتفعيل." });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end", flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>بطاقة خصم أسناني</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4, textAlign: "right" }}>طلب سريع بدون تعقيد</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>اطلب بطاقة الخصم</AppTitle>
        <AppSubtitle>أرسل بياناتك، والأدمن يتابع الطلب ويفعّل البطاقة. بعدها تظهر للطبيب أنك مشترك عند مراجعة الحجز.</AppSubtitle>
        <View style={{ marginTop: 14, borderRadius: 24, backgroundColor: "#0f172a", padding: 18 }}>
          <Text style={{ textAlign: "right", color: "#cbd5e1", fontSize: 12, fontWeight: "900" }}>Asnany Discount Card</Text>
          <Text style={{ textAlign: "right", color: "white", fontSize: 24, fontWeight: "900", marginTop: 18 }}>طلب بطاقة خصم</Text>
          <Text style={{ textAlign: "right", color: "#34d399", marginTop: 6, fontWeight: "900", fontSize: 13 }}>تظهر للطبيب بعد التفعيل</Text>
        </View>
        <Field label="الاسم الرباعي" value={fullName} onChangeText={setFullName} />
        <Field label="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="المدينة" value={city} onChangeText={setCity} />
        <AppButton label={submitting ? "جاري الإرسال..." : "اطلب البطاقة"} onPress={submit} disabled={!canSubmit || submitting} style={{ marginTop: 12 }} />
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>العيادات المشاركة</AppTitle>
        <AppSubtitle>هذه العيادات يظهر لديها خصم البطاقة داخل المنصة.</AppSubtitle>
        {loading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color="#0f172a" />
          </View>
        ) : participating.length === 0 ? (
          <AppSubtitle style={{ marginTop: 12 }}>لا توجد عيادات مشاركة حالياً، وستظهر هنا فور تفعيلها.</AppSubtitle>
        ) : (
          <View style={{ gap: 10, marginTop: 12 }}>
            {participating.map((doctor) => (
              <View key={doctor.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "white", padding: 14 }}>
                <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>{doctor.name}</Text>
                <Text style={{ textAlign: "right", color: "#64748b", marginTop: 4, fontWeight: "700" }}>
                  {doctor.city || "غير محدد"} {doctor.area ? `- ${doctor.area}` : ""}
                </Text>
                <Text style={{ textAlign: "right", color: "#b45309", marginTop: 6, fontWeight: "900" }}>
                  {doctor.discount_value || "خصم خاص"} {doctor.discount_note ? `- ${doctor.discount_note}` : ""}
                </Text>
                <AppButton label="عرض الطبيب" variant="secondary" onPress={() => router.push(`/doctors/${doctor.id}`)} style={{ marginTop: 10 }} />
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ textAlign: "right", fontWeight: "900", color: "#64748b", marginBottom: 6, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#94a3b8"
        style={{
          minHeight: 48,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 14,
          textAlign: "right",
          fontWeight: "700",
          color: "#0f172a",
        }}
      />
    </View>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Doctor } from "../lib/types";
import { StackCard, StackPageLayout, StackPrimaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";
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
    <StackPageLayout badge="💳 بطاقة خصم ملامح" title="طلب بطاقة الخصم" subtitle="أرسل بياناتك — الأدمن يفعّلها وتظهر للطبيب عند الحجز">
      <StackCard>
        <View style={{ borderRadius: 24, backgroundColor: theme.navy, padding: 18, marginBottom: 8 }}>
          <Text style={{ textAlign: "right", color: "#cbd5e1", fontSize: 12, fontWeight: "900" }}>Malamih Discount Card</Text>
          <Text style={{ textAlign: "right", color: theme.white, fontSize: 24, fontWeight: "900", marginTop: 18 }}>طلب بطاقة خصم</Text>
          <Text style={{ textAlign: "right", color: theme.tealLight, marginTop: 6, fontWeight: "900", fontSize: 13 }}>تظهر للطبيب بعد التفعيل</Text>
        </View>
        <Field label="الاسم الرباعي" value={fullName} onChangeText={setFullName} />
        <Field label="رقم الهاتف" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="المدينة" value={city} onChangeText={setCity} />
        <View style={{ marginTop: 12, opacity: !canSubmit || submitting ? 0.6 : 1 }}>
          <StackPrimaryButton label={submitting ? "جاري الإرسال..." : "اطلب البطاقة"} onPress={submit} />
        </View>
      </StackCard>

      <StackCard>
        <Text style={{ fontSize: 20, fontWeight: "900", color: theme.text, textAlign: "right" }}>العيادات المشاركة</Text>
        <Text style={{ color: theme.textMuted, fontWeight: "600", textAlign: "right", marginTop: 4, marginBottom: 12 }}>هذه العيادات يظهر لديها خصم البطاقة داخل المنصة.</Text>
        {loading ? (
          <ActivityIndicator color={theme.teal} />
        ) : participating.length === 0 ? (
          <Text style={{ color: theme.textMuted, fontWeight: "600", textAlign: "right" }}>لا توجد عيادات مشاركة حالياً.</Text>
        ) : (
          participating.map((doctor) => (
            <View key={doctor.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: theme.borderLight, backgroundColor: theme.bg, padding: 14, marginTop: 10 }}>
              <Text style={{ textAlign: "right", fontWeight: "900", color: theme.text }}>{doctor.name}</Text>
              <Text style={{ textAlign: "right", color: theme.textMuted, marginTop: 4, fontWeight: "700" }}>
                {doctor.city || "غير محدد"} {doctor.area ? `- ${doctor.area}` : ""}
              </Text>
              <Text style={{ textAlign: "right", color: "#b45309", marginTop: 6, fontWeight: "900" }}>
                {doctor.discount_value || "خصم خاص"} {doctor.discount_note ? `- ${doctor.discount_note}` : ""}
              </Text>
              <View style={{ marginTop: 10 }}>
                <StackPrimaryButton label="عرض الطبيب" onPress={() => router.push(`/doctors/${doctor.id}`)} />
              </View>
            </View>
          ))
        )}
      </StackCard>
    </StackPageLayout>
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

import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "../lib/api";
import { Doctor } from "../lib/types";
import { AppButton } from "../components/Buttons";
import { AppCard } from "../components/AppCard";
import { AppSubtitle, AppTitle } from "../components/AppText";

export default function DiscountCardScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { response, data } = await apiFetch<{ doctors?: Doctor[] }>("/api/doctors");
      setDoctors(response.ok ? (Array.isArray(data) ? data : Array.isArray(data?.doctors) ? data.doctors : []) : []);
      setLoading(false);
    })();
  }, []);

  const participating = useMemo(
    () => doctors.filter((doctor) => doctor.accepts_discount_card || doctor.discount_note || doctor.discount_value),
    [doctors],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <AppCard>
        <AppTitle>بطاقة الخصم</AppTitle>
        <AppSubtitle>بطاقة عضوية تمنحك خصومات في العيادات المشتركة مباشرة من التطبيق.</AppSubtitle>

        <View style={{ marginTop: 14, borderRadius: 26, backgroundColor: "#0f172a", padding: 18 }}>
          <Text style={{ textAlign: "right", color: "#cbd5e1", fontSize: 12, fontWeight: "800" }}>Asnany Discount Card</Text>
          <Text style={{ textAlign: "right", color: "white", fontSize: 24, fontWeight: "900", marginTop: 10 }}>ASN-DC-2026-001</Text>
          <Text style={{ textAlign: "right", color: "#93c5fd", marginTop: 6, fontWeight: "700" }}>تفعيل الخصومات في الأطباء المشتركين</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 12 }}>
          <AppButton label="احجز الآن" onPress={() => router.push("/booking")} style={{ minWidth: 110 }} />
          <AppButton label="الرئيسية" variant="secondary" onPress={() => router.push("/")} style={{ minWidth: 110 }} />
        </View>
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>الأطباء المشاركون</AppTitle>
        <AppSubtitle>كل دكتور هنا يوضّح الخصم أو ملاحظته بداخل المنصة.</AppSubtitle>
        {loading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color="#0f172a" />
          </View>
        ) : participating.length === 0 ? (
          <AppSubtitle style={{ marginTop: 12 }}>لا توجد عيادات مشاركة حالياً، لكن المسار جاهز للتفعيل من لوحة الطبيب.</AppSubtitle>
        ) : (
          <View style={{ gap: 10, marginTop: 12 }}>
            {participating.map((doctor) => (
              <View key={doctor.id} style={{ borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "white", padding: 14 }}>
                <Text style={{ textAlign: "right", fontWeight: "900", color: "#020617" }}>{doctor.name}</Text>
                <Text style={{ textAlign: "right", color: "#64748b", marginTop: 4, fontWeight: "700" }}>
                  {doctor.city || "غير محدد"} {doctor.area ? `• ${doctor.area}` : ""}
                </Text>
                <Text style={{ textAlign: "right", color: "#2563eb", marginTop: 6, fontWeight: "900" }}>
                  {doctor.discount_value || "خصم خاص"} {doctor.discount_note ? `• ${doctor.discount_note}` : ""}
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

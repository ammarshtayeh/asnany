import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Doctor } from "../lib/types";
import { AppButton } from "../components/Buttons";
import { AppCard } from "../components/AppCard";
import { AppSubtitle, AppTitle } from "../components/AppText";

type Plan = {
  id: string;
  name: string;
  subtitle?: string | null;
  price: number;
  currency: string;
  duration_months: number;
  badge?: string | null;
  benefits: string[];
  limits?: string[] | null;
  is_featured: boolean;
};

export default function DiscountCardScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const plansResult = await apiFetch<{ plans?: Plan[] }>("/api/discount-card/plans");
        setPlans(Array.isArray(plansResult.data?.plans) ? plansResult.data.plans : []);

        if (!supabase) return;
        const { data, error } = await supabase.from("doctors").select("*").eq("verified", true);
        if (error) throw error;
        setDoctors(data || []);
      } catch (err) {
        console.error("Error loading discount card:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const participating = useMemo(
    () => doctors.filter((doctor) => doctor.accepts_discount_card || doctor.discount_note || doctor.discount_value),
    [doctors],
  );
  const featuredPlan = plans.find((plan) => plan.is_featured) || plans[0];

  const activatePlan = (plan: Plan) => {
    const text = encodeURIComponent(`أرغب بتفعيل ${plan.name}`);
    void Linking.openURL(`https://wa.me/970599123456?text=${text}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 16, backgroundColor: "white", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
        <View style={{ alignItems: "flex-end", flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b" }}>خصومات أسناني</Text>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", marginTop: 4, textAlign: "right" }}>بطاقة رقمية وباقات واضحة</Text>
        </View>
        <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <AppCard>
        <AppTitle>بطاقة الخصومات</AppTitle>
        <AppSubtitle>اختر باقة، فعّل البطاقة، واعرضها عند العيادات والمراكز المشاركة لتطبيق الخصم.</AppSubtitle>
        <View style={{ marginTop: 14, borderRadius: 26, backgroundColor: "#0f172a", padding: 18 }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "900" }}>Asnany Plus</Text>
            <Feather name="credit-card" size={24} color="#fbbf24" />
          </View>
          <Text style={{ textAlign: "right", color: "white", fontSize: 24, fontWeight: "900", marginTop: 26 }}>ASN-PLUS-2026</Text>
          <Text style={{ textAlign: "right", color: "#34d399", marginTop: 6, fontWeight: "900", fontSize: 13 }}>فعالة بعد الاشتراك والتحقق</Text>
          <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", flexDirection: "row-reverse", justifyContent: "space-between" }}>
            <Text style={{ color: "#94a3b8", fontWeight: "800", fontSize: 12 }}>{plans.length || 3} باقات</Text>
            <Text style={{ color: "#94a3b8", fontWeight: "800", fontSize: 12 }}>{participating.length} شريك</Text>
            <Text style={{ color: "#94a3b8", fontWeight: "800", fontSize: 12 }}>{featuredPlan?.duration_months || 12} شهر</Text>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>الباقات والأسعار</AppTitle>
        <AppSubtitle>هذه الباقات يتم التحكم بها من لوحة الأدمن وتظهر هنا تلقائياً.</AppSubtitle>
        {loading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color="#0f172a" />
          </View>
        ) : (
          <View style={{ gap: 12, marginTop: 14 }}>
            {plans.map((plan) => (
              <View key={plan.id} style={{ borderRadius: 22, borderWidth: 1, borderColor: plan.is_featured ? "#fbbf24" : "#e2e8f0", backgroundColor: plan.is_featured ? "#fffbeb" : "white", padding: 16 }}>
                <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: 10 }}>
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", textAlign: "right" }}>{plan.name}</Text>
                    {plan.subtitle ? <Text style={{ color: "#64748b", marginTop: 5, fontSize: 12, fontWeight: "700", textAlign: "right", lineHeight: 18 }}>{plan.subtitle}</Text> : null}
                  </View>
                  {plan.badge ? (
                    <View style={{ alignSelf: "flex-start", borderRadius: 999, backgroundColor: "#0f172a", paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text style={{ color: "white", fontSize: 11, fontWeight: "900" }}>{plan.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={{ textAlign: "right", color: "#0f172a", fontSize: 30, fontWeight: "900", marginTop: 14 }}>
                  {plan.price} <Text style={{ fontSize: 16, color: "#64748b" }}>{plan.currency}</Text>
                </Text>
                <Text style={{ textAlign: "right", color: "#94a3b8", fontSize: 12, fontWeight: "900" }}>صالحة {plan.duration_months} شهر</Text>
                <View style={{ gap: 8, marginTop: 12 }}>
                  {plan.benefits.map((benefit) => (
                    <View key={benefit} style={{ flexDirection: "row-reverse", gap: 8, alignItems: "flex-start" }}>
                      <Feather name="check-circle" size={15} color="#10b981" style={{ marginTop: 2 }} />
                      <Text style={{ flex: 1, textAlign: "right", color: "#334155", fontSize: 13, fontWeight: "800", lineHeight: 20 }}>{benefit}</Text>
                    </View>
                  ))}
                </View>
                <AppButton label="فعّل هذه الباقة" onPress={() => activatePlan(plan)} style={{ marginTop: 14 }} />
              </View>
            ))}
          </View>
        )}
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>كيف تستخدمها؟</AppTitle>
        <Step number="1" title="اختر الباقة" text="السعر والمدة والمزايا واضحة قبل التفعيل." />
        <Step number="2" title="فعّل البطاقة" text="تصلك بطاقة رقمية برقم عضوية وحالة اشتراك." />
        <Step number="3" title="اعرضها للشريك" text="العيادة تتحقق من البطاقة وتطبق الخصم المناسب." />
      </AppCard>

      <AppCard>
        <AppTitle style={{ fontSize: 20 }}>العيادات المشاركة</AppTitle>
        <AppSubtitle>كل شريك هنا يوضح قيمة الخصم أو ملاحظته داخل المنصة.</AppSubtitle>
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

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 12, alignItems: "flex-start" }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#0369a1", fontWeight: "900" }}>{number}</Text>
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ color: "#0f172a", fontWeight: "900", fontSize: 15 }}>{title}</Text>
        <Text style={{ color: "#64748b", fontWeight: "700", marginTop: 3, lineHeight: 20, textAlign: "right" }}>{text}</Text>
      </View>
    </View>
  );
}

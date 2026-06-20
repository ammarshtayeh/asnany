import React from "react";
import { Linking, ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { whatsappHref } from "../lib/site-contact";

export default function JoinScreen() {
  const insets = useSafeAreaInsets();

  const openWhatsapp = () => {
    Linking.openURL(
      whatsappHref("مرحباً ملامح، أنا طبيب وأرغب في الانضمام وإعلان عيادتي على منصتكم الموقرة."),
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={{ backgroundColor: "#0f172a", minHeight: 220, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0ea5e9", opacity: 0.18 }} />
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>✨ بوابة الأطباء الشركاء</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "right" }}>انضم كطبيب شريك في منصة ملامح</Text>
        <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          اجعل عيادتك تظهر لآلاف المرضى شهرياً في فلسطين
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        {/* Option 1: Register Online */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 12, alignSelf: "flex-end" }}>
            <Text style={{ fontSize: 24 }}>📝</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 8 }}>نموذج التسجيل الإلكتروني السريع</Text>
          <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "500", lineHeight: 22, textAlign: "right", marginBottom: 14 }}>
            هل تفضل تسجيل عيادتك بنفسك فوراً؟ سجل عيادتك مع تحديد موقع الـ GPS بدقة وإرسالها للإدارة للاعتماد.
          </Text>
          <View style={{ gap: 8, marginBottom: 16 }}>
            {["تحديد دقيق للموقع الجغرافي بالـ GPS", "كتابة النبذة وساعات العمل بنفسك", "تفعيل أسرع من قبل لوحة التحكم"].map((point) => (
              <View key={point} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                <Text style={{ color: "#22c55e", fontSize: 16 }}>✓</Text>
                <Text style={{ color: "#475569", fontSize: 13, fontWeight: "700", flex: 1, textAlign: "right" }}>{point}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => router.push("/subscriptions")}
            style={{ backgroundColor: "#10b981", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginBottom: 10 }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>عرض باقات الاشتراك والأسعار</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/doctors/register")}
            style={{ backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>تعبئة استمارة التسجيل الإلكترونية</Text>
          </Pressable>
        </View>

        {/* Option 2: WhatsApp */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginBottom: 12, alignSelf: "flex-end", borderWidth: 1, borderColor: "#d1fae5" }}>
            <Text style={{ fontSize: 24 }}>💬</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 8 }}>تواصل مباشر عبر واتساب</Text>
          <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "500", lineHeight: 22, textAlign: "right", marginBottom: 14 }}>
            هل تريد منا القيام بكل شيء بالنيابة عنك؟ تحدث مباشرة مع مسؤول البوابة وسنقوم بإنشاء وتفعيل حساب عيادتك.
          </Text>
          <View style={{ gap: 8, marginBottom: 16 }}>
            {["محادثة فورية مباشرة مع الدعم الفني", "مساعدتك في تجهيز الصور والملفات", "إجابة أي استفسارات تخص التسويق"].map((point) => (
              <View key={point} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                <Text style={{ color: "#22c55e", fontSize: 16 }}>✓</Text>
                <Text style={{ color: "#475569", fontSize: 13, fontWeight: "700", flex: 1, textAlign: "right" }}>{point}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={openWhatsapp}
            style={{ backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>💬 تواصل مع الإدارة بالواتساب</Text>
          </Pressable>
        </View>

        {/* Note */}
        <View style={{ backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fef3c7", borderRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: "row-reverse", gap: 10, alignItems: "flex-start" }}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "900", color: "#92400e", textAlign: "right", marginBottom: 4 }}>ملاحظة هامة للأطباء:</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#92400e", textAlign: "right", lineHeight: 20 }}>
                بمجرد تقديم طلبك، نقوم بمراجعة رخصة مزاولة المهنة والمستندات قبل تفعيل عيادتك على البوابة للحفاظ على موثوقية المنصة.
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/")}
          style={{ backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#475569", fontWeight: "900", fontSize: 14 }}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={{ backgroundColor: "#0f172a", minHeight: 200, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0ea5e9", opacity: 0.15 }} />
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "#10b981", opacity: 0.1 }} />
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>✨ سياسة الخصوصية وحماية البيانات</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "right" }}>Privacy Policy</Text>
        <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          نحافظ على بياناتك الطبية والشخصية ضمن تجربة واضحة وآمنة
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
            <Text style={{ fontSize: 22 }}>🛡️</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", flex: 1, textAlign: "right" }}>سياسة الخصوصية</Text>
          </View>
          <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "500", lineHeight: 22, textAlign: "right" }}>
            منصة <Text style={{ fontWeight: "900", color: "#0f172a" }}>ملامح.ps</Text> هي فكرة ومشروع <Text style={{ fontWeight: "900", color: "#0f172a" }}>عمار اشتية</Text>، وجميع الحقوق محفوظة له. تم إعداد هذه المنصة لتسهيل الوصول إلى أطباء وصحة وجمال الوجه (الأسنان، الجلدية، العيون، التجميل، الأنف والأذن والحنجرة) والخدمات الطبية في فلسطين مع الالتزام بحماية بيانات المستخدمين واحترام خصوصيتهم.
          </Text>
        </View>

        {/* Privacy items grid */}
        <View style={{ gap: 10 }}>
          <PrivacyCard
            emoji="🔒"
            bgColor="#eff6ff"
            title="البيانات التي نجمعها"
            desc="الاسم، رقم الهاتف، رقم الهوية، العنوان، بيانات الحجز، والمعلومات التي يضيفها الطبيب أو الأدمن لإتمام الخدمة."
          />
          <PrivacyCard
            emoji="✅"
            bgColor="#f0fdf4"
            title="كيف نستخدمها"
            desc="تُستخدم البيانات لإرسال طلبات الحجز، إدارة جدول الطبيب، تحسين نتائج البحث، وتسهيل التواصل داخل المنصة."
          />
          <PrivacyCard
            emoji="💾"
            bgColor="#faf5ff"
            title="حفظ البيانات"
            desc="تُحفظ البيانات داخل قاعدة البيانات الخاصة بالمنصة وفق الصلاحيات المخصصة لكل من المريض والطبيب والأدمن."
          />
          <PrivacyCard
            emoji="🤝"
            bgColor="#fff1f2"
            title="مشاركة البيانات"
            desc="لا نبيع بيانات المستخدمين لأطراف خارجية. بيانات الطبيب تُعرض للمستخدمين ضمن نطاق الخدمة فقط."
          />
        </View>

        {/* Notes */}
        <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 12 }}>ملاحظات مهمة</Text>
          <View style={{ gap: 8 }}>
            {[
              "قد نحدّث السياسة عند إضافة خدمات جديدة أو تحسينات تشغيلية.",
              "استخدامك للموقع أو التطبيق يعني موافقتك على هذه السياسة.",
              "أي بيانات علاجية أو مواعيد تظهر للطبيب بهدف إدارة الحجز فقط.",
            ].map((note) => (
              <View key={note} style={{ flexDirection: "row-reverse", gap: 8, alignItems: "flex-start" }}>
                <Text style={{ color: "#94a3b8", fontWeight: "900" }}>•</Text>
                <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, lineHeight: 20 }}>{note}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer info */}
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "600" }}>🛡️ آخر تحديث: يونيو 2026</Text>
          <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "600" }}>🤝 ملامح.ps - مشروع عمار اشتية</Text>
        </View>

        <Pressable onPress={() => router.push("/")} style={{ backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#475569", fontWeight: "900", fontSize: 14 }}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function PrivacyCard({ emoji, bgColor, title, desc }: { emoji: string; bgColor: string; title: string; desc: string }) {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
      <View style={{ flexDirection: "row-reverse", gap: 12, alignItems: "flex-start" }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 4 }}>{title}</Text>
          <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "500", textAlign: "right", lineHeight: 20 }}>{desc}</Text>
        </View>
      </View>
    </View>
  );
}

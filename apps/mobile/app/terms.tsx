import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CLAUSES = [
  {
    num: "1",
    title: "طبيعة الخدمات ومسؤوليتنا",
    body: "تعتبر منصة ملامح.ps بمثابة دليل جغرافي وإعلامي يسهل ربط المرضى بالعيادات والأطباء. نحن لا نقدم أي استشارات طبية ولا نتحمل أي مسؤولية قانونية ناتجة عن العلاجات الطبية أو القرارات المهنية المتخذة داخل العيادات المسجلة.",
  },
  {
    num: "2",
    title: "شروط تسجيل وعضوية الأطباء",
    body: "يلتزم كل طبيب يسجل عيادته بتقديم معلومات حقيقية وصحيحة ومحدثة (مثل الاسم، الإحداثيات، التخصص، ورقم الهاتف). تحتفظ الإدارة بالحق في تعليق أو حذف أي حساب يتبين تقديمه لمعلومات مضللة.",
  },
  {
    num: "3",
    title: "سياسة التقييمات والمراجعات",
    body: "تتيح المنصة للمرضى إضافة تقييماتهم لخدمات العيادات. نلتزم بنشر المراجعات بشفافية ومراجعتها لمنع الإساءة أو التقييمات الكاذبة. تحتفظ الإدارة بحق إخفاء أي تعليق يخالف الآداب العامة.",
  },
  {
    num: "4",
    title: "الخصوصية وحماية البيانات",
    body: "نحن نحترم خصوصية المرضى والأطباء ونتعهد بالحفاظ على سرية وتأمين كافة البيانات الشخصية والملفات الطبية ولن نقوم بنشرها أو بيعها لأي جهات خارجية.",
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={{ backgroundColor: "#0f172a", minHeight: 200, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#8b5cf6", opacity: 0.15 }} />
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>✨ الضوابط والاتفاقية القانونية</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right" }}>الشروط والأحكام وسياسة الاستخدام</Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          يرجى قراءة شروط وأحكام استخدام بوابة ملامح.ps
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        {/* Intro card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
            <Text style={{ fontSize: 22 }}>⚖️</Text>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", flex: 1, textAlign: "right" }}>مقدمة وبنود الاستخدام العام</Text>
          </View>
          <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "500", lineHeight: 22, textAlign: "right", marginBottom: 10 }}>
            مرحباً بكم في <Text style={{ fontWeight: "900", color: "#0f172a" }}>ملامح.ps</Text>. يمثل دخولك وتصفحك للموقع أو التطبيق موافقة تامة على الالتزام بكافة البنود والشروط الواردة في هذه الاتفاقية.
          </Text>
          <Pressable onPress={() => router.push("/privacy" as any)}>
            <Text style={{ color: "#0ea5e9", fontWeight: "900", fontSize: 13, textAlign: "right" }}>← راجع أيضاً سياسة الخصوصية</Text>
          </Pressable>
        </View>

        {/* Clauses */}
        <View style={{ gap: 12 }}>
          {CLAUSES.map((clause) => (
            <View key={clause.num} style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 13, fontWeight: "900", color: "#2563eb" }}>{clause.num}</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", flex: 1, textAlign: "right" }}>{clause.title}</Text>
              </View>
              <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "500", lineHeight: 22, textAlign: "right" }}>{clause.body}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "600" }}>⚠️ آخر تحديث: مايو 2026</Text>
          <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "600" }}>🤝 ملامح.ps - دليل صحة وجمال الوجه في فلسطين</Text>
        </View>

        <Pressable onPress={() => router.push("/")} style={{ backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#475569", fontWeight: "900", fontSize: 14 }}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ backgroundColor: "#0f172a", minHeight: 220, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0ea5e9", opacity: 0.18 }} />
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>✨ قصة ورؤية ملامح</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "right" }}>عن منصة ملامح.ps</Text>
        <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          أول دليل رقمي تفاعلي متكامل لصحة وجمال الوجه والأسنان في فلسطين
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 10 }}>رؤيتنا ورسالتنا الجوهرية</Text>
          <Text style={{ color: "#64748b", fontSize: 14, fontWeight: "500", lineHeight: 24, textAlign: "right" }}>
            تأسست منصة <Text style={{ fontWeight: "900", color: "#0f172a" }}>ملامح.ps</Text> لسد الفجوة الرقمية بين المراجعين ونخبة أخصائيي صحة وجمال الوجه والأسنان في فلسطين. نحن نؤمن بأن الوصول لخدمات رعاية طبية وتجميلية فائقة الجودة يجب أن يكون سهلاً وسريعاً ومبنياً على الثقة والمصداقية والتقييمات الحقيقية.
          </Text>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 12 }}>نهدف لخدمة وتطوير قطاع صحة وجمال الوجه والأسنان في فلسطين</Text>
          <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "500", lineHeight: 22, textAlign: "right" }}>
            تضم المنصة أطباء وأخصائيين من مختلف التخصصات في كافة المحافظات الفلسطينية لضمان حصول كل مواطن على حقه في رعاية طبية وتجميلية مميزة للوجه والعيون والجلد والأسنان.
          </Text>
        </View>

        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          style={{ backgroundColor: "#0f172a", borderRadius: 18, paddingVertical: 16, alignItems: "center", marginTop: 4 }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>الرجوع</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

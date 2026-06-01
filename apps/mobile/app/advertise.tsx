import React, { useState, useMemo } from "react";
import { Linking, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WHATSAPP_NUMBER = "9720595537190";

const AD_TYPES = ["عيادة أسنان", "طبيب مستقل", "مركز تجميل", "مختبر أسنان", "شركة/مورد", "إعلان وظيفة"];
const AD_NATURES = ["بنر على الصفحة الرئيسية", "عرض وخصم", "إعلان في سوق أسناني", "ترويج طبيب/عيادة", "إعلان وظيفة", "حملة شهرية"];

export default function AdvertiseScreen() {
  const insets = useSafeAreaInsets();
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserType, setAdvertiserType] = useState(AD_TYPES[0]);
  const [adNature, setAdNature] = useState(AD_NATURES[0]);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const whatsappMsg = useMemo(() => {
    const lines = [
      "مرحباً أسناني، أرغب بعمل إعلان.",
      advertiserName ? `اسم المعلن: ${advertiserName}` : "",
      `نوع المعلن: ${advertiserType}`,
      `طبيعة الإعلان: ${adNature}`,
      city ? `المدينة: ${city}` : "",
      phone ? `رقم التواصل: ${phone}` : "",
      budget ? `الميزانية المتوقعة: ${budget}` : "",
      message ? `تفاصيل: ${message}` : "",
    ].filter(Boolean).join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
  }, [advertiserName, advertiserType, adNature, city, phone, budget, message]);

  const handleSend = () => {
    setSubmitted(true);
    Linking.openURL(whatsappMsg);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={{ backgroundColor: "#0f172a", minHeight: 200, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#f59e0b", opacity: 0.15 }} />
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(245,158,11,0.25)", borderWidth: 1, borderColor: "rgba(245,158,11,0.4)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>📣 أعلن مع أسناني</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right" }}>إعلان واضح، جمهور مهتم، وتواصل مباشر</Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          اختر طبيعة الإعلان واملأ الاستمارة للتواصل عبر واتساب
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        {/* Form card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontSize: 13, fontWeight: "900", color: "#0ea5e9", textAlign: "right", marginBottom: 4 }}>استمارة الإعلان</Text>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 18 }}>احكيلنا شو الإعلان وطبيعته</Text>

          <Field label="اسم المعلن / العيادة / الشركة" value={advertiserName} onChangeText={setAdvertiserName} placeholder="مثال: عيادة د. أحمد" />

          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginTop: 14, marginBottom: 6 }}>نوع المعلن</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
            {AD_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => setAdvertiserType(type)}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: advertiserType === type ? "#0f172a" : "#e2e8f0", backgroundColor: advertiserType === type ? "#0f172a" : "#fff" }}
              >
                <Text style={{ color: advertiserType === type ? "#fff" : "#475569", fontWeight: "800", fontSize: 12 }}>{type}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginTop: 14, marginBottom: 6 }}>طبيعة الإعلان</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
            {AD_NATURES.map((nat) => (
              <Pressable
                key={nat}
                onPress={() => setAdNature(nat)}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: adNature === nat ? "#0ea5e9" : "#e2e8f0", backgroundColor: adNature === nat ? "#0ea5e9" : "#fff" }}
              >
                <Text style={{ color: adNature === nat ? "#fff" : "#475569", fontWeight: "800", fontSize: 12 }}>{nat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 14 }}>
            <View style={{ flex: 1 }}>
              <Field label="المدينة" value={city} onChangeText={setCity} />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="رقم التواصل" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="059..." />
            </View>
          </View>
          <Field label="ميزانية تقريبية" value={budget} onChangeText={setBudget} placeholder="مثال: 300 شيكل" />
          <Field label="تفاصيل الإعلان" value={message} onChangeText={setMessage} multiline placeholder="اكتب هدف الإعلان، مدة الحملة، الفئة المستهدفة..." />

          {submitted && (
            <View style={{ backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#d1fae5", borderRadius: 14, padding: 12, marginTop: 14 }}>
              <Text style={{ color: "#16a34a", fontWeight: "900", fontSize: 13, textAlign: "right" }}>✓ تم تجهيز الطلب وفتح واتساب لإرساله مباشرة.</Text>
            </View>
          )}

          <View style={{ gap: 10, marginTop: 18 }}>
            <Pressable onPress={handleSend} style={{ backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 15, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>📤 إرسال الاستمارة عبر واتساب</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`)}
              style={{ backgroundColor: "#16a34a", borderRadius: 16, paddingVertical: 15, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>💬 تواصل مباشر عبر واتساب</Text>
            </Pressable>
          </View>
        </View>

        {/* Info cards */}
        <View style={{ gap: 10 }}>
          {["بنر الصفحة الرئيسية", "إعلان عرض طبي", "إعلان سوق أو وظيفة"].map((item) => (
            <View key={item} style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
              <Text style={{ fontSize: 16 }}>✅</Text>
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right", marginTop: 6 }}>{item}</Text>
              <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "right", lineHeight: 20, marginTop: 4 }}>
                نجهز الإعلان بصيغة مناسبة للموقع والتطبيق مع توجيه واضح للتواصل.
              </Text>
            </View>
          ))}
        </View>

        <Pressable onPress={() => router.push("/")} style={{ backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#475569", fontWeight: "900", fontSize: 14 }}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, keyboardType, multiline, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "email-address"; multiline?: boolean; placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        textAlign="right"
        style={{
          minHeight: multiline ? 100 : 48,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontWeight: "700",
          color: "#0f172a",
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

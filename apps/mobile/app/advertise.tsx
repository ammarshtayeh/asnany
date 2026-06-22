import React, { useState, useMemo } from "react";
import { Linking, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { StackCard, StackPageLayout, StackPrimaryButton, StackSecondaryButton } from "../components/ui/StackPageLayout";
import { theme } from "../constants/theme";
import { whatsappHref } from "../lib/site-contact";

const AD_TYPES = ["عيادة أسنان", "طبيب عيون", "طبيب جلدية", "مركز تجميل", "أنف وأذن وحنجرة", "مختبر طبي", "شركة/مورد", "إعلان وظيفة"];
const AD_NATURES = ["بنر على الصفحة الرئيسية", "عرض وخصم", "إعلان في سوق ملامح", "ترويج طبيب/عيادة", "إعلان وظيفة", "حملة شهرية"];

export default function AdvertiseScreen() {
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
      "مرحباً ملامح، أرغب بعمل إعلان.",
      advertiserName ? `اسم المعلن: ${advertiserName}` : "",
      `نوع المعلن: ${advertiserType}`,
      `طبيعة الإعلان: ${adNature}`,
      city ? `المدينة: ${city}` : "",
      phone ? `رقم التواصل: ${phone}` : "",
      budget ? `الميزانية المتوقعة: ${budget}` : "",
      message ? `تفاصيل: ${message}` : "",
    ].filter(Boolean).join("\n");
    return whatsappHref(lines);
  }, [advertiserName, advertiserType, adNature, city, phone, budget, message]);

  const handleSend = () => {
    setSubmitted(true);
    Linking.openURL(whatsappMsg);
  };

  return (
    <StackPageLayout
      badge="📣 أعلن مع ملامح"
      title="إعلان واضح، جمهور مهتم"
      subtitle="اختر طبيعة الإعلان واملأ الاستمارة للتواصل عبر واتساب"
    >
      <StackCard>
        <Text style={{ fontSize: 13, fontWeight: "900", color: theme.teal, textAlign: "right", marginBottom: 4 }}>استمارة الإعلان</Text>
        <Text style={{ fontSize: 20, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 18 }}>احكيلنا شو الإعلان وطبيعته</Text>

        <Field label="اسم المعلن / العيادة / الشركة" value={advertiserName} onChangeText={setAdvertiserName} placeholder="مثال: عيادة د. أحمد" />

        <ChipRow label="نوع المعلن" options={AD_TYPES} selected={advertiserType} onSelect={setAdvertiserType} activeColor={theme.navy} />
        <ChipRow label="طبيعة الإعلان" options={AD_NATURES} selected={adNature} onSelect={setAdNature} activeColor={theme.teal} />

        <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Field label="المدينة" value={city} onChangeText={setCity} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="رقم التواصل" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="059..." />
          </View>
        </View>
        <Field label="ميزانية تقريبية" value={budget} onChangeText={setBudget} placeholder="مثال: 300 شيكل" />
        <Field label="تفاصيل الإعلان" value={message} onChangeText={setMessage} multiline placeholder="اكتب هدف الإعلان، مدة الحملة، الفئة المستهدفة..." />

        {submitted ? (
          <View style={{ backgroundColor: theme.tealMuted, borderWidth: 1, borderColor: theme.teal, borderRadius: 14, padding: 12, marginTop: 14 }}>
            <Text style={{ color: theme.teal, fontWeight: "900", fontSize: 13, textAlign: "right" }}>✓ تم تجهيز الطلب وفتح واتساب لإرساله مباشرة.</Text>
          </View>
        ) : null}

        <View style={{ gap: 10, marginTop: 18 }}>
          <StackPrimaryButton label="📤 إرسال الاستمارة عبر واتساب" onPress={handleSend} />
          <StackSecondaryButton label="💬 تواصل مباشر عبر واتساب" onPress={() => Linking.openURL(whatsappHref())} />
        </View>
      </StackCard>

      {["بنر الصفحة الرئيسية", "إعلان عرض طبي", "إعلان سوق أو وظيفة"].map((item) => (
        <StackCard key={item}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: theme.text, textAlign: "right" }}>✅ {item}</Text>
          <Text style={{ fontSize: 12, color: theme.textMuted, fontWeight: "600", textAlign: "right", lineHeight: 20, marginTop: 4 }}>
            نجهز الإعلان بصيغة مناسبة للموقع والتطبيق مع توجيه واضح للتواصل.
          </Text>
        </StackCard>
      ))}
    </StackPageLayout>
  );
}

function ChipRow({ label, options, selected, onSelect, activeColor }: { label: string; options: string[]; selected: string; onSelect: (v: string) => void; activeColor: string }) {
  return (
    <>
      <Text style={{ fontSize: 12, fontWeight: "900", color: theme.textMuted, textAlign: "right", marginTop: 14, marginBottom: 6 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: selected === opt ? activeColor : theme.border, backgroundColor: selected === opt ? activeColor : theme.card }}
          >
            <Text style={{ color: selected === opt ? theme.white : theme.textMuted, fontWeight: "800", fontSize: 12 }}>{opt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

function Field({ label, value, onChangeText, keyboardType, multiline, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "email-address"; multiline?: boolean; placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: theme.textMuted, textAlign: "right", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.textSoft}
        textAlign="right"
        style={{
          minHeight: multiline ? 100 : 48,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.borderLight,
          backgroundColor: theme.bg,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontWeight: "700",
          color: theme.text,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

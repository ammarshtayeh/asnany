import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

const STORAGE_KEY = "malamih_onboarding_v1";

const SLIDES = [
  {
    emoji: "🔍",
    title: "ابحث عن طبيب موثّق",
    body: "دليل أطباء فلسطيني معتمد — ابحث بالاسم، التخصص، أو المدينة.",
  },
  {
    emoji: "📅",
    title: "احجز بدون حساب",
    body: "أرسل طلب موعد مباشرة من التطبيق — لا حاجة لإنشاء حساب مريض.",
  },
  {
    emoji: "⭐",
    title: "عروض وخدمات صحية",
    body: "تابع العروض، المختبرات، مراكز التجميل، والإعلانات الطبية في مكان واحد.",
  },
];

export function OnboardingModal() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!value) setVisible(true);
    });
  }, []);

  const finish = async (goJoin?: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    if (goJoin) router.push("/join");
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.92)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <Text style={{ fontSize: 48, textAlign: "center" }}>{slide.emoji}</Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: theme.text, textAlign: "center", marginTop: 12 }}>
            {slide.title}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: theme.textSoft, textAlign: "center", marginTop: 10, lineHeight: 24 }}>
            {slide.body}
          </Text>

          <View style={{ flexDirection: "row-reverse", justifyContent: "center", gap: 6, marginTop: 20 }}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === step ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: index === step ? theme.teal : theme.border,
                }}
              />
            ))}
          </View>

          <View style={{ gap: 10, marginTop: 24 }}>
            <Pressable
              onPress={() => (isLast ? void finish() : setStep((s) => s + 1))}
              style={{ backgroundColor: theme.teal, borderRadius: 16, paddingVertical: 15, alignItems: "center" }}
            >
              <Text style={{ color: theme.white, fontWeight: "900", fontSize: 15 }}>{isLast ? "ابدأ الاستكشاف" : "التالي"}</Text>
            </Pressable>
            {isLast ? (
              <Pressable
                onPress={() => void finish(true)}
                style={{ backgroundColor: theme.borderLight, borderRadius: 16, paddingVertical: 15, alignItems: "center", borderWidth: 1, borderColor: theme.border }}
              >
                <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14 }}>سجّل عيادتك كشريك</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => void finish()} style={{ paddingVertical: 10, alignItems: "center" }}>
                <Text style={{ color: theme.textSoft, fontWeight: "800", fontSize: 13 }}>تخطي</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

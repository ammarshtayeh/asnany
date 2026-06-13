import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "الخدمات الطبية",
    color: "#10b981",
    bgColor: "#ecfdf5",
    items: [
      { emoji: "🦷", label: "احجز طبيب", desc: "احجز موعد مع الطبيب المناسب", path: "/booking" },
      { emoji: "📋", label: "حجوزاتي", desc: "تابع حالة مواعيدك برقم الهاتف", path: "/appointments" },
      { emoji: "💳", label: "بطاقة الخصم", desc: "خصومات حصرية لحاملي البطاقة", path: "/discount-card" },
      { emoji: "💆", label: "مراكز التجميل", desc: "تجميل الأسنان والابتسامة", path: "/beauty" },
      { emoji: "🔬", label: "المختبرات", desc: "مختبرات طبية معتمدة", path: "/labs" },
      { emoji: "💬", label: "استشارات", desc: "استشارات طبية كتابية", path: "/consultations" },
    ],
  },
  {
    title: "المحتوى والمجتمع",
    color: "#2563eb",
    bgColor: "#eff6ff",
    items: [
      { emoji: "📖", label: "المجلة الطبية", desc: "مقالات ونصائح طبية", path: "/blog" },
      { emoji: "📰", label: "الميديا", desc: "أخبار ومقاطع فيديو", path: "/media" },
      { emoji: "🏪", label: "المتاجر", desc: "متاجر ومنتجات طبية", path: "/stores" },
      { emoji: "🤝", label: "الشركاء", desc: "شركات ومنتجات معتمدة", path: "/partners" },
    ],
  },
  {
    title: "انضم لملامح",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    items: [
      { emoji: "👨‍⚕️", label: "أنا طبيب", desc: "أضف عيادتك للشبكة", path: "/join" },
      { emoji: "📢", label: "أعلن معنا", desc: "ابدأ حملة إعلانية", path: "/advertise" },
      { emoji: "🏭", label: "شركاء الأعمال", desc: "تسجيل شركات ومتاجر", path: "/stores" },
    ],
  },
  {
    title: "الحسابات",
    color: "#0f172a",
    bgColor: "#f8fafc",
    items: [
      { emoji: "🔐", label: "دخول الطبيب", desc: "لوحة تحكم الطبيب", path: "/doctor/login" },
      { emoji: "⚙️", label: "دخول الإدارة", desc: "لوحة تحكم الأدمن", path: "/admin/login" },
      { emoji: "📋", label: "سجّل طبيب", desc: "تسجيل عيادة جديدة", path: "/doctors/register" },
    ],
  },
  {
    title: "عن ملامح",
    color: "#64748b",
    bgColor: "#f8fafc",
    items: [
      { emoji: "ℹ️", label: "من نحن", desc: "قصة ورسالة ملامح", path: "/about" },
      { emoji: "🔒", label: "سياسة الخصوصية", desc: "كيف نحمي بياناتك", path: "/privacy" },
      { emoji: "📄", label: "شروط الاستخدام", desc: "القواعد والأحكام", path: "/terms" },
    ],
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ backgroundColor: "#0f172a", padding: 24, paddingTop: insets.top + 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff", textAlign: "right" }}>
          ✨ كل خدمات ملامح
        </Text>
        <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600", marginTop: 4, textAlign: "right" }}>
          دليل طبي متكامل في مكان واحد
        </Text>
      </View>

      <View style={{ padding: 16, gap: 20 }}>
        {SECTIONS.map((section) => (
          <View key={section.title}>
            {/* Section Header */}
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <View style={{ width: 4, height: 18, backgroundColor: section.color, borderRadius: 2 }} />
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a" }}>{section.title}</Text>
            </View>

            {/* Items Grid */}
            <View style={{ gap: 8 }}>
              {section.items.map((item) => (
                <Pressable
                  key={item.path + item.label}
                  onPress={() => router.push(item.path as any)}
                  style={({ pressed }) => ({
                    backgroundColor: "#fff",
                    borderRadius: 18,
                    padding: 14,
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    gap: 14,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                    shadowColor: "#000",
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  {/* Emoji Icon */}
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: section.bgColor,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "right", marginTop: 1 }}>
                      {item.desc}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <Text style={{ color: "#cbd5e1", fontWeight: "900", fontSize: 16 }}>←</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View
          style={{
            backgroundColor: "#0f172a",
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }}>ملامح .ps</Text>
          <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "center" }}>
            دليل فلسطين لصحة وجمال الوجه
          </Text>
          <Pressable
            onPress={() => router.push("/" as any)}
            style={{ backgroundColor: "#10b981", borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginTop: 4 }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>🏠 الرئيسية</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

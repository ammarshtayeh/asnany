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
          <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 12 }}>✨ قصة ورؤية أسناني</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "right" }}>عن منصة أسناني.ps</Text>
        <Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          أول دليل رقمي تفاعلي متكامل للرعاية السنية في فلسطين
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        {/* Mission card */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 10 }}>رؤيتنا ورسالتنا الجوهرية</Text>
          <Text style={{ color: "#64748b", fontSize: 14, fontWeight: "500", lineHeight: 24, textAlign: "right" }}>
            تأسست منصة <Text style={{ fontWeight: "900", color: "#0f172a" }}>أسناني.ps</Text> لسد الفجوة الرقمية بين المرضى ونخبة أطباء الأسنان في فلسطين. نحن نؤمن بأن الوصول لخدمات رعاية سنية فائقة الجودة يجب أن يكون سهلاً وسريعاً ومبنياً على الثقة والمصداقية والتقييمات الحقيقية.
          </Text>
        </View>

        {/* Pillars */}
        <View style={{ gap: 12 }}>
          <PillarCard
            emoji="🛡️"
            bgColor="#eff6ff"
            accentColor="#2563eb"
            title="دقة وموثوقية"
            desc="جميع بيانات العيادات والأطباء يتم التحقق منها ومراجعتها بدقة من قبل الإدارة قبل تفعيلها."
          />
          <PillarCard
            emoji="💚"
            bgColor="#f0fdf4"
            accentColor="#16a34a"
            title="سهولة تامة للمريض"
            desc="واجهة مستخدم ذكية تدعم الجيل الأحدث من الخرائط والتوجيه الجغرافي للوصول الفوري للعيادة."
          />
          <PillarCard
            emoji="🏆"
            bgColor="#eef2ff"
            accentColor="#4f46e5"
            title="إعلام ذكي وحيوي"
            desc="مجلة طبية سنية متكاملة وسوق عروض وحجوزات مميزة وموثوقة لرفع الوعي الصحي السني."
          />
        </View>

        {/* Coverage */}
        <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Text style={{ fontSize: 22 }}>👥</Text>
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", flex: 1, textAlign: "right" }}>نهدف لخدمة وتطوير قطاع الأسنان الفلسطيني</Text>
          </View>
          <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "500", lineHeight: 22, textAlign: "right" }}>
            تضم المنصة أطباء أسنان من مختلف التخصصات: جراحة الفم والأسنان، زراعة وتقويم الأسنان، طب أسنان الأطفال، وتجميل الأسنان. نحن نغطي كافة المحافظات الفلسطينية لضمان حصول كل مواطن على حقه في رعاية طبية مميزة.
          </Text>
        </View>

        {/* Back button */}
        <Pressable
          onPress={() => router.push("/")}
          style={{ backgroundColor: "#0f172a", borderRadius: 18, paddingVertical: 16, alignItems: "center", marginTop: 4 }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>العودة للرئيسية</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function PillarCard({ emoji, bgColor, accentColor, title, desc }: { emoji: string; bgColor: string; accentColor: string; title: string; desc: string }) {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 18, flexDirection: "row-reverse", gap: 14, alignItems: "flex-start", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 20 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 4 }}>{title}</Text>
        <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "500", lineHeight: 20, textAlign: "right" }}>{desc}</Text>
      </View>
    </View>
  );
}

import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { adminSession } from "../../lib/session";
import { syncPushForCurrentUser } from "../../lib/push-manager";
import { SITE_URL } from "../../lib/site-contact";

const WEB_ADMIN_BASE = `${SITE_URL}/admin`;

const ADMIN_SECTIONS = [
  {
    icon: "bell" as const,
    title: "مركز الإشعارات",
    subtitle: "تنبيهات صوتية وفورية للحجوزات والطلبات",
    color: "#0284c7",
    nativePath: "/admin/notifications",
  },
  {
    icon: "credit-card" as const,
    title: "طلبات بطاقة الخصم",
    subtitle: "تفعيل، إيقاف، رفض، وتحديد انتهاء البطاقة",
    color: "#2563eb",
    nativePath: "/admin/discount-card",
  },
  {
    icon: "users" as const,
    title: "حسابات الأطباء",
    subtitle: "إنشاء أطباء وتحديد بيانات الخصم والعيادة",
    color: "#0ea5e9",
    nativePath: "/admin/doctor-accounts",
  },
  {
    icon: "layers" as const,
    title: "الاشتراكات والباقات",
    subtitle: "تفعيل باقات الدليل والمميز والإعلانات",
    color: "#7c3aed",
    webPath: "/subscriptions",
  },
  {
    icon: "user-check" as const,
    title: "إدارة الأطباء",
    subtitle: "توثيق، تمييز، وتعديل بيانات العيادات",
    color: "#10b981",
    webPath: "/doctors",
  },
  {
    icon: "calendar" as const,
    title: "المواعيد",
    subtitle: "متابعة وإدارة حجوزات المرضى",
    color: "#f59e0b",
    webPath: "/appointments",
  },
  {
    icon: "megaphone" as const,
    title: "الإعلانات",
    subtitle: "إدارة الإعلانات والحملات",
    color: "#ec4899",
    webPath: "/offers",
  },
  {
    icon: "shopping-bag" as const,
    title: "المتاجر",
    subtitle: "إدارة المتاجر والموردين",
    color: "#8b5cf6",
    webPath: "/stores",
  },
  {
    icon: "star" as const,
    title: "التقييمات",
    subtitle: "مراجعة تقييمات المرضى",
    color: "#f97316",
    webPath: "/reviews",
  },
  {
    icon: "layers" as const,
    title: "خدمات المنصة",
    subtitle: "إدارة الخدمات الطبية المعروضة",
    color: "#06b6d4",
    webPath: "/services",
  },
  {
    icon: "file-text" as const,
    title: "المحتوى والعروض",
    subtitle: "المقالات، العروض، والمحتوى الإعلامي",
    color: "#64748b",
    webPath: "/content",
  },
];

export default function AdminDashboardScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await adminSession.read();
      if (!session?.token && !session?.admin) {
        router.replace("/admin/login");
        return;
      }
      void syncPushForCurrentUser().catch(() => null);
      setReady(true);
    })();
  }, []);

  const signOut = async () => {
    await adminSession.clear();
    await syncPushForCurrentUser();
    router.replace("/admin/login");
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617" }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View style={{ marginBottom: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 24 }}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ alignItems: "flex-end", flex: 1 }}>
            <Text style={{ fontSize: 30, fontWeight: "900", color: "#fff", textAlign: "right" }}>لوحة الأدمن</Text>
            <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "600", lineHeight: 22, color: "#cbd5e1", textAlign: "right" }}>
              كل أقسام إدارة الموقع متاحة من التطبيق — الأقسام الأساسية داخل التطبيق، والباقي يفتح لوحة الويب.
            </Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Feather name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </View>
        <Pressable onPress={signOut} style={{ marginTop: 16, alignSelf: "flex-end", borderRadius: 16, backgroundColor: "#f43f5e", paddingHorizontal: 16, paddingVertical: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>تسجيل خروج</Text>
        </Pressable>
      </View>

      <View style={{ gap: 12 }}>
        {ADMIN_SECTIONS.map((section) => (
          <AdminTile
            key={section.title}
            icon={section.icon}
            title={section.title}
            subtitle={section.subtitle}
            color={section.color}
            onPress={() => {
              if (section.nativePath) {
                router.push(section.nativePath as any);
                return;
              }
              if (section.webPath) {
                void Linking.openURL(`${WEB_ADMIN_BASE}${section.webPath}`);
              }
            }}
            badge={section.nativePath ? "داخل التطبيق" : "يفتح الموقع"}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function AdminTile({
  icon,
  title,
  subtitle,
  onPress,
  color,
  badge,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  badge: string;
}) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 24, backgroundColor: "#fff", padding: 18, flexDirection: "row-reverse", alignItems: "center", gap: 14 }}>
      <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: `${color}15`, alignItems: "center", justifyContent: "center" }}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", textAlign: "right" }}>{title}</Text>
        <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "700", marginTop: 4, textAlign: "right", lineHeight: 18 }}>{subtitle}</Text>
        <Text style={{ color: color, fontSize: 11, fontWeight: "900", marginTop: 6, textAlign: "right" }}>{badge}</Text>
      </View>
      <Feather name="chevron-left" size={20} color="#94a3b8" />
    </Pressable>
  );
}

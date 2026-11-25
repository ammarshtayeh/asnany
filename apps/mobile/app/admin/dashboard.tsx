import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { adminSession } from "../../lib/session";
import { syncPushForCurrentUser } from "../../lib/push-manager";
import { SITE_URL } from "../../lib/site-contact";
import { theme } from "../../constants/theme";

const WEB_ADMIN_BASE = `${SITE_URL}/admin`;

const ADMIN_SECTIONS = [
  {
    icon: "bell" as const,
    title: "مركز الإشعارات",
    subtitle: "تنبيهات صوتية وفورية للحجوزات والطلبات",
    color: "#295f59",
    nativePath: "/admin/notifications",
  },
  {
    icon: "credit-card" as const,
    title: "طلبات بطاقة الخصم",
    subtitle: "تفعيل، إيقاف، رفض، وتحديد انتهاء البطاقة",
    color: "#3d7a73",
    nativePath: "/admin/discount-card",
  },
  {
    icon: "users" as const,
    title: "حسابات الأطباء",
    subtitle: "إنشاء أطباء وتحديد بيانات الخصم والعيادة",
    color: "#1a433e",
    nativePath: "/admin/doctor-accounts",
  },
  {
    icon: "layers" as const,
    title: "الاشتراكات والباقات",
    subtitle: "تفعيل باقات الدليل والمميز والإعلانات",
    color: "#295f59",
    webPath: "/subscriptions",
  },
  {
    icon: "user-check" as const,
    title: "إدارة الأطباء",
    subtitle: "توثيق، تمييز، وتعديل بيانات العيادات",
    color: "#295f59",
    webPath: "/doctors",
  },
  {
    icon: "calendar" as const,
    title: "المواعيد",
    subtitle: "متابعة وإدارة حجوزات المرضى",
    color: "#d4af37",
    webPath: "/appointments",
  },
  {
    icon: "radio" as const,
    title: "الإعلانات",
    subtitle: "إدارة الإعلانات والحملات",
    color: "#3d7a73",
    webPath: "/offers",
  },
  {
    icon: "shopping-bag" as const,
    title: "المتاجر",
    subtitle: "إدارة المتاجر والموردين",
    color: "#0a1628",
    webPath: "/stores",
  },
  {
    icon: "star" as const,
    title: "التقييمات",
    subtitle: "مراجعة تقييمات المرضى",
    color: "#d4af37",
    webPath: "/reviews",
  },
  {
    icon: "layers" as const,
    title: "خدمات المنصة",
    subtitle: "إدارة الخدمات الطبية المعروضة",
    color: "#295f59",
    webPath: "/services",
  },
  {
    icon: "file-text" as const,
    title: "المحتوى والعروض",
    subtitle: "المقالات، العروض، والمحتوى الإعلامي",
    color: "#1a433e",
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
      <View style={{ marginBottom: 20, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, padding: 20, ...theme.shadow.card }}>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ alignItems: "flex-end", flex: 1, paddingLeft: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "900", color: theme.text, textAlign: "right" }}>لوحة الأدمن</Text>
            <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "600", lineHeight: 22, color: theme.textMuted, textAlign: "right" }}>
              كل أقسام إدارة الموقع متاحة من التطبيق — الأقسام الأساسية داخل التطبيق، والباقي يفتح لوحة الويب.
            </Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
            <Feather name="arrow-right" size={20} color={theme.teal} />
          </Pressable>
        </View>
        <Pressable onPress={signOut} style={{ marginTop: 16, alignSelf: "flex-end", borderRadius: theme.radius.pill, backgroundColor: theme.teal, paddingHorizontal: 16, paddingVertical: 12 }}>
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
    <Pressable onPress={onPress} style={{ borderRadius: theme.radius.xl, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, padding: 16, flexDirection: "row-reverse", alignItems: "center", gap: 12, ...theme.shadow.card }}>
      <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: `${color}18`, alignItems: "center", justifyContent: "center" }}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: "900", textAlign: "right" }}>{title}</Text>
        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: "700", marginTop: 4, textAlign: "right", lineHeight: 18 }}>{subtitle}</Text>
        <Text style={{ color: color, fontSize: 11, fontWeight: "900", marginTop: 6, textAlign: "right" }}>{badge}</Text>
      </View>
      <Feather name="chevron-left" size={20} color={theme.textSoft} />
    </Pressable>
  );
}

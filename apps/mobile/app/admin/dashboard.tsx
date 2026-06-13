import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { adminSession } from "../../lib/session";

export default function AdminDashboardScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await adminSession.read();
      if (!session?.token && !session?.admin) {
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    })();
  }, []);

  const signOut = async () => {
    await adminSession.clear();
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
              نفس مهام الأدمن الأساسية الموجودة على الموقع، داخل التطبيق.
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
        <AdminTile
          icon="credit-card"
          title="طلبات بطاقة الخصم"
          subtitle="تفعيل، إيقاف، رفض، وتحديد انتهاء البطاقة"
          onPress={() => router.push("/admin/discount-card")}
          color="#2563eb"
        />
        <AdminTile
          icon="users"
          title="حسابات الأطباء"
          subtitle="إنشاء أطباء وتحديد بيانات الخصم والعيادة"
          onPress={() => router.push("/admin/doctor-accounts")}
          color="#0ea5e9"
        />
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
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable onPress={onPress} style={{ borderRadius: 24, backgroundColor: "#fff", padding: 18, flexDirection: "row-reverse", alignItems: "center", gap: 14 }}>
      <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: `${color}15`, alignItems: "center", justifyContent: "center" }}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900", textAlign: "right" }}>{title}</Text>
        <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "700", marginTop: 4, textAlign: "right", lineHeight: 18 }}>{subtitle}</Text>
      </View>
      <Feather name="chevron-left" size={20} color="#94a3b8" />
    </Pressable>
  );
}

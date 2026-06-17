import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getMobileApiBaseUrl } from "../../lib/api-base";
import { adminSession } from "../../lib/session";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
};

export default function AdminNotificationsScreen() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    const session = await adminSession.read();
    if (!session?.token) {
      router.replace("/admin/login");
      return;
    }
    setToken(session.token);
    setReady(true);
    await load(session.token);
  };

  const load = async (authToken?: string) => {
    if (!authToken) return;
    setLoading(true);
    const response = await fetch(`${getMobileApiBaseUrl()}/api/notifications?limit=30`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json().catch(() => ({}));
    setItems(Array.isArray(data?.notifications) ? data.notifications : []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    if (!token) return;
    await fetch(`${getMobileApiBaseUrl()}/api/notifications`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load(token);
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
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>إشعارات الإدارة</Text>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color="#fff" /> : null}
      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => markRead(item.id)} style={{ backgroundColor: item.read_at ? "rgba(255,255,255,0.04)" : "#fff", borderRadius: 18, padding: 16 }}>
            <Text style={{ color: item.read_at ? "#cbd5e1" : "#0f172a", fontWeight: "900", textAlign: "right" }}>{item.title}</Text>
            <Text style={{ color: item.read_at ? "#94a3b8" : "#475569", marginTop: 4, fontWeight: "700", textAlign: "right" }}>{item.body}</Text>
          </Pressable>
        ))}
        {!items.length && !loading ? <Text style={{ color: "#94a3b8", textAlign: "center", fontWeight: "700" }}>لا توجد إشعارات حالياً</Text> : null}
      </View>
    </ScrollView>
  );
}

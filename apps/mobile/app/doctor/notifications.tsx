import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { apiFetch } from "../../lib/api";
import { doctorSession } from "../../lib/session";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
};

export default function DoctorNotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  useEffect(() => {
    void bootstrap();
  }, []);

  const bootstrap = async () => {
    const session = await doctorSession.read();
    if (!session?.token && !session?.doctor) {
      router.replace("/doctor/login");
      return;
    }
    setToken(session?.token);
    await load(session?.token);
    setLoading(false);
  };

  const headers = useMemo(
    () =>
      token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    [token]
  );

  const load = async (authToken?: string) => {
    const { response, data } = await apiFetch<{ success?: boolean; notifications?: NotificationItem[]; error?: string }>(
      "/api/notifications?limit=50",
      {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : headers || {},
      }
    );

    if (!response.ok) {
      throw new Error(data?.error || "تعذر جلب الإشعارات");
    }

    setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load(token);
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { response, data } = await apiFetch<{ success?: boolean; error?: string }>("/api/notifications", {
      method: "PATCH",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(data?.error || "تعذر تحديث الإشعار");
    }

    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item)));
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020617" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#020617" }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ marginBottom: 20, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 24 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => router.push("/doctor/dashboard")} style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#7dd3fc", textAlign: "right" }}>لوحة الطبيب</Text>
            <Text style={{ marginTop: 4, fontSize: 30, fontWeight: "900", color: "#fff", textAlign: "right" }}>الإشعارات</Text>
          </View>
        </View>
        <Text style={{ marginTop: 12, fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#cbd5e1", textAlign: "right" }}>
          أي حجز جديد أو تحديث حالة يوصل هنا مباشرة، وبنفس الوقت يوصل Push للجهاز.
        </Text>
        <View style={{ marginTop: 16, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ borderRadius: 16, backgroundColor: "#0ea5e9", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>{unreadCount} غير مقروء</Text>
          </View>
          <Pressable onPress={refresh} style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>{refreshing ? "جارٍ التحديث..." : "تحديث"}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ borderRadius: 24, backgroundColor: "#fff", padding: 16 }}>
        {notifications.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Feather name="bell" size={36} color="#cbd5e1" />
            <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "900", color: "#0f172a" }}>لا توجد إشعارات بعد</Text>
            <Text style={{ marginTop: 8, textAlign: "center", fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#64748b" }}>
              ستظهر هنا إشعارات الحجوزات وتغييرات المواعيد أول ما تبدأ الحركة على الحساب.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {notifications.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (!item.read_at) {
                    void markAsRead(item.id).catch((error) => {
                      const message = error instanceof Error ? error.message : "تعذر تحديث الإشعار";
                      Alert.alert("الإشعارات", message);
                    });
                  }
                }}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: item.read_at ? "#e2e8f0" : "#bae6fd",
                  backgroundColor: item.read_at ? "#white" : "#f0f9ff",
                  padding: 16
                }}
              >
                <View style={{ flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flex: 1, gap: 8, alignItems: "flex-end" }}>
                    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                      {!item.read_at ? <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: "#0ea5e9" }} /> : null}
                      <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{item.title}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "500", lineHeight: 24, color: "#475569", textAlign: "right" }}>{item.body}</Text>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8" }}>{formatDate(item.created_at)}</Text>
                  </View>
                  <View style={{ borderRadius: 16, backgroundColor: item.read_at ? "#ecfdf5" : "#0f172a", paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: "900", color: item.read_at ? "#047857" : "#white" }}>
                      {item.read_at ? "مقروء" : "لم يُقرأ"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

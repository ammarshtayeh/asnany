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
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-6">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.push("/doctor/dashboard")} className="rounded-2xl bg-white/10 px-4 py-3">
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
          <View className="items-end">
            <Text className="text-sm font-black text-sky-300">لوحة الطبيب</Text>
            <Text className="mt-1 text-3xl font-black text-white">الإشعارات</Text>
          </View>
        </View>
        <Text className="mt-3 text-sm font-medium leading-6 text-slate-300">
          أي حجز جديد أو تحديث حالة يوصل هنا مباشرة، وبنفس الوقت يوصل Push للجهاز.
        </Text>
        <View className="mt-4 flex-row items-center justify-between">
          <View className="rounded-2xl bg-sky-500 px-4 py-3">
            <Text className="text-sm font-black text-white">{unreadCount} غير مقروء</Text>
          </View>
          <Pressable onPress={refresh} className="rounded-2xl bg-white/10 px-4 py-3">
            <Text className="text-sm font-black text-white">{refreshing ? "جارٍ التحديث..." : "تحديث"}</Text>
          </Pressable>
        </View>
      </View>

      <View className="rounded-3xl bg-white p-4">
        {notifications.length === 0 ? (
          <View className="items-center py-12">
            <Feather name="bell" size={36} color="#cbd5e1" />
            <Text className="mt-4 text-lg font-black text-slate-950">لا توجد إشعارات بعد</Text>
            <Text className="mt-2 text-center text-sm font-medium leading-6 text-slate-500">
              ستظهر هنا إشعارات الحجوزات وتغييرات المواعيد أول ما تبدأ الحركة على الحساب.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
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
                className={`rounded-2xl border p-4 ${item.read_at ? "border-slate-200 bg-white" : "border-sky-200 bg-sky-50"}`}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-2">
                    <View className="flex-row items-center gap-2">
                      {!item.read_at ? <View className="h-2.5 w-2.5 rounded-full bg-sky-500" /> : null}
                      <Text className="text-base font-black text-slate-950">{item.title}</Text>
                    </View>
                    <Text className="text-sm font-medium leading-6 text-slate-600">{item.body}</Text>
                    <Text className="text-xs font-bold text-slate-400">{formatDate(item.created_at)}</Text>
                  </View>
                  <View className={`rounded-2xl px-3 py-2 ${item.read_at ? "bg-emerald-50" : "bg-slate-950"}`}>
                    <Text className={`text-xs font-black ${item.read_at ? "text-emerald-700" : "text-white"}`}>
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

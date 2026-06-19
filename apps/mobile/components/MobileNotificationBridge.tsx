import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Pressable, Text, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { doctorSession, adminSession } from "../lib/session";
import { theme } from "../constants/theme";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
  data?: Record<string, unknown> | null;
};

const POLL_MS = 30000;

export function MobileNotificationBridge() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<NotificationRecord | null>(null);
  const [role, setRole] = useState<"doctor" | "admin" | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolveSession = useCallback(async () => {
    const doctor = await doctorSession.read();
    if (doctor?.token) {
      setRole("doctor");
      setToken(doctor.token);
      return;
    }
    const admin = await adminSession.read();
    if (admin?.token) {
      setRole("admin");
      setToken(admin.token);
      return;
    }
    setRole(null);
    setToken(null);
    initializedRef.current = false;
    latestIdRef.current = null;
  }, []);

  const poll = useCallback(async () => {
    if (!role || !token) return;

    const { response, data } = await apiFetch<{ notifications?: NotificationRecord[] }>(
      "/api/notifications?limit=5&unread=true",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return;

    const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
    const latest = notifications[0];

    if (!initializedRef.current) {
      latestIdRef.current = latest?.id || null;
      initializedRef.current = true;
      return;
    }

    if (!latest || latest.id === latestIdRef.current) return;
    latestIdRef.current = latest.id;

    Vibration.vibrate([0, 120, 80, 120]);
    setToast(latest);

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === latest.id ? null : current));
    }, 9000);
  }, [role, token]);

  useEffect(() => {
    void resolveSession();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void resolveSession();
    });
    return () => sub.remove();
  }, [resolveSession]);

  useEffect(() => {
    if (!role || !token) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      void poll();
      interval = setInterval(() => void poll(), POLL_MS);
    };

    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };

    const onAppState = (state: string) => {
      if (state === "active") start();
      else stop();
    };

    start();
    const sub = AppState.addEventListener("change", onAppState);

    return () => {
      stop();
      sub.remove();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [poll, role, token]);

  if (!toast) return null;

  const open = () => {
    setToast(null);
    if (role === "doctor") router.push("/doctor/notifications");
    else router.push("/admin/notifications");
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 148,
        left: 14,
        right: 14,
        zIndex: 90,
        borderRadius: 20,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.tealMuted,
        padding: 14,
        shadowColor: theme.navy,
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <Pressable onPress={open} style={{ flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: theme.tealMuted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="bell" size={20} color={theme.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.teal, fontWeight: "900", fontSize: 11, textAlign: "right" }}>إشعار جديد</Text>
          <Text style={{ color: theme.text, fontWeight: "900", fontSize: 14, textAlign: "right", marginTop: 2 }}>{toast.title}</Text>
          <Text style={{ color: theme.textMuted, fontWeight: "700", fontSize: 12, textAlign: "right", marginTop: 2 }} numberOfLines={2}>
            {toast.body}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

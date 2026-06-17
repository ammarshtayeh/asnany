import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Pressable, Text, Vibration, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getMobileApiBaseUrl } from "../lib/api-base";
import { doctorSession, adminSession } from "../lib/session";
import { playNotificationAlert } from "../lib/notifications";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
  data?: Record<string, unknown> | null;
};

export function MobileNotificationBridge() {
  const [toast, setToast] = useState<NotificationRecord | null>(null);
  const [role, setRole] = useState<"doctor" | "admin" | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const latestIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

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

    const response = await fetch(`${getMobileApiBaseUrl()}/api/notifications?limit=5&unread=true`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return;

    const data = await response.json().catch(() => ({}));
    const notifications = Array.isArray(data?.notifications) ? (data.notifications as NotificationRecord[]) : [];
    const latest = notifications[0];

    if (!initializedRef.current) {
      latestIdRef.current = latest?.id || null;
      initializedRef.current = true;
      return;
    }

    if (!latest || latest.id === latestIdRef.current) return;
    latestIdRef.current = latest.id;

    void playNotificationAlert();
    Vibration.vibrate([0, 120, 80, 120]);
    setToast(latest);
    setTimeout(() => setToast((current) => (current?.id === latest.id ? null : current)), 9000);
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
    void poll();
    const interval = setInterval(() => void poll(), 12000);
    return () => clearInterval(interval);
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
        bottom: 88,
        left: 14,
        right: 14,
        zIndex: 100,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#bae6fd",
        padding: 14,
        shadowColor: "#0f172a",
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <Pressable onPress={open} style={{ flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
          <Feather name="bell" size={20} color="#0284c7" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0284c7", fontWeight: "900", fontSize: 11, textAlign: "right" }}>إشعار جديد</Text>
          <Text style={{ color: "#0f172a", fontWeight: "900", fontSize: 14, textAlign: "right", marginTop: 2 }}>{toast.title}</Text>
          <Text style={{ color: "#64748b", fontWeight: "700", fontSize: 12, textAlign: "right", marginTop: 2 }} numberOfLines={2}>
            {toast.body}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

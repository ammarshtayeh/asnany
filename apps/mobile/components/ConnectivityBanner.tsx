import React, { useCallback, useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { API_BASE_URL } from "../lib/api";

async function probeOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const target = API_BASE_URL ? `${API_BASE_URL}/` : "https://www.malamih.ps/";
    await fetch(target, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

export function ConnectivityBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  const check = useCallback(async () => {
    const online = await probeOnline();
    setOffline(!online);
  }, []);

  useEffect(() => {
    void check();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void check();
    });
    const interval = setInterval(() => void check(), 45000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [check]);

  if (!offline) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top,
        left: 12,
        right: 12,
        zIndex: 9999,
        backgroundColor: "#7f1d1d",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 8,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      <Feather name="wifi-off" size={16} color="#fecaca" />
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12, flex: 1, textAlign: "right" }}>
        لا يوجد اتصال بالإنترنت — تحقق من الشبكة وحاول مجدداً
      </Text>
    </View>
  );
}

import { useCallback, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { SubscriptionPackagesPreview } from "../../components/SubscriptionPackagesPreview";
import { HubSectionBlock, QuickActionStrip } from "../../components/HubMenu";
import { MalamihLogo } from "../../components/ui/premium";
import { NotificationSettingsCard } from "../../components/NotificationSettingsCard";
import { APP_META, HUB_SECTIONS, QUICK_ACTIONS } from "../../constants/navigation";
import { theme } from "../../constants/theme";
import { configureNotifications, registerPushSubscription } from "../../lib/notifications";
import { adminSession, doctorSession } from "../../lib/session";

type SessionState = {
  label: string;
  detail: string;
  actionLabel?: string;
  actionPath?: string;
};

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [session, setSession] = useState<SessionState>({
    label: "مرحباً بك في ملامح",
    detail: "تصفح الخدمات أو سجّل دخولك كطبيب/أدمن",
  });

  const refresh = useCallback(async () => {
    const Notifications = await configureNotifications().catch(() => null);
    const permission = await Notifications?.getPermissionsAsync();
    setNotificationsEnabled(permission?.status === "granted");

    const doctor = await doctorSession.read();
    if (doctor?.token) {
      setSession({
        label: "حساب الطبيب نشط",
        detail: "إدارة المواعيد والإشعارات من لوحة الطبيب",
        actionLabel: "فتح لوحة الطبيب",
        actionPath: "/doctor/dashboard",
      });
      return;
    }

    const admin = await adminSession.read();
    if (admin?.token) {
      setSession({
        label: "حساب الإدارة نشط",
        detail: "متابعة الطلبات والإشعارات من لوحة الأدمن",
        actionLabel: "فتح لوحة الأدمن",
        actionPath: "/admin/dashboard",
      });
      return;
    }

    setSession({
      label: "مرحباً بك في ملامح",
      detail: "تصفح الخدمات أو سجّل دخولك كطبيب/أدمن",
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const requestNotificationPermission = async () => {
    await registerPushSubscription({ role: "patient" });
    await refresh();
  };

  const triggerTestNotification = async () => {
    const Notifications = await configureNotifications();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "ملامح — تنبيه تجريبي",
        body: "الإشعارات تعمل بشكل صحيح على جهازك.",
        sound: "default",
      },
      trigger: null,
    });
  };

  const appVersion = Constants.expoConfig?.version || APP_META.version;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View
        style={{
          backgroundColor: theme.navy,
          borderRadius: 26,
          padding: 22,
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -30,
            left: -20,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "rgba(16,185,129,0.18)",
          }}
        />
        <View style={{ alignSelf: "flex-end" }}>
          <MalamihLogo size="md" />
        </View>
        <Text style={{ color: theme.textSoft, marginTop: 10, fontWeight: "700", textAlign: "right", fontSize: 13 }}>
          {APP_META.tagline}
        </Text>

        <View
          style={{
            marginTop: 16,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14, textAlign: "right" }}>{session.label}</Text>
          <Text style={{ color: "#cbd5e1", marginTop: 4, fontSize: 12, fontWeight: "600", textAlign: "right", lineHeight: 18 }}>
            {session.detail}
          </Text>
          {session.actionPath ? (
            <Pressable
              onPress={() => router.push(session.actionPath as any)}
              style={{
                marginTop: 12,
                alignSelf: "flex-end",
                backgroundColor: theme.tealLight,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{session.actionLabel}</Text>
              <Feather name="arrow-left" size={14} color="#fff" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <QuickActionStrip items={QUICK_ACTIONS} onPress={(path) => router.push(path as any)} />

      <View style={{ marginBottom: 18 }}>
        <SubscriptionPackagesPreview compact />
      </View>

      <NotificationSettingsCard
        enabled={notificationsEnabled}
        onEnable={requestNotificationPermission}
        onTest={triggerTestNotification}
      />

      {HUB_SECTIONS.map((section) => (
        <HubSectionBlock key={section.id} section={section} onPress={(path) => router.push(path as any)} />
      ))}

      {/* Footer */}
      <View
        style={{
          marginTop: 8,
          backgroundColor: "#fff",
          borderRadius: 22,
          padding: 18,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#f1f5f9",
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#0f172a" }}>ملامح .ps</Text>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748b", textAlign: "center" }}>{APP_META.tagline}</Text>
        <Pressable onPress={() => Linking.openURL(APP_META.domain)} style={{ marginTop: 4 }}>
          <Text style={{ color: "#0284c7", fontWeight: "900", fontSize: 12 }}>{APP_META.domainLabel}</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(`mailto:${APP_META.supportEmail}`)} style={{ marginTop: 2 }}>
          <Text style={{ color: "#64748b", fontWeight: "700", fontSize: 11 }}>{APP_META.supportEmail}</Text>
        </Pressable>
        <Text style={{ color: "#94a3b8", fontSize: 11, fontWeight: "700", marginTop: 4 }}>الإصدار {appVersion}</Text>
      </View>
    </ScrollView>
  );
}

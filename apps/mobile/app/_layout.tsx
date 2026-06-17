import { router, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  attachForegroundNotificationListener,
  configureNotifications,
  resolveNotificationRoute,
} from "../lib/notifications";
import { syncPushForCurrentUser } from "../lib/push-manager";
import { AppToastProvider } from "../components/AppToast";

export default function RootLayout() {
  const handledNotificationIds = useRef(new Set<string>());

  useEffect(() => {
    let mounted = true;
    let subscription: { remove: () => void } | undefined;

    const openNotification = (response: any) => {
      const identifier = response?.notification?.request?.identifier;
      if (identifier && handledNotificationIds.current.has(identifier)) return;
      if (identifier) handledNotificationIds.current.add(identifier);

      const route = resolveNotificationRoute(response?.notification?.request?.content?.data || null);
      if (!route) return;

      setTimeout(() => {
        router.push(route as any);
      }, 250);
    };

    void configureNotifications()
      .then(async (Notifications) => {
        if (!mounted) return;

        subscription = Notifications.addNotificationResponseReceivedListener(openNotification);
        const lastResponse = await Notifications.getLastNotificationResponseAsync().catch(() => null);
        if (lastResponse && mounted) openNotification(lastResponse);
      })
      .catch((error) => {
        console.log("Notification setup skipped:", error);
      });

    const foreground = attachForegroundNotificationListener();

    void syncPushForCurrentUser().catch(() => null);

    return () => {
      mounted = false;
      subscription?.remove();
      foreground.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="doctors/index" />
          <Stack.Screen name="doctors/[id]" />
          <Stack.Screen name="doctors/[id]/map" />
          <Stack.Screen name="doctors/register" />
          <Stack.Screen name="doctors/set-location" />
          <Stack.Screen name="doctor/index" />
          <Stack.Screen name="doctor/login" />
          <Stack.Screen name="doctor/dashboard" />
          <Stack.Screen name="doctor/notifications" />
          <Stack.Screen name="doctor/[id]" />
          <Stack.Screen name="doctor/[id]/map" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="appointments" />
          <Stack.Screen name="discount-card" />
          <Stack.Screen name="admin/index" />
          <Stack.Screen name="admin/login" />
          <Stack.Screen name="admin/dashboard" />
          <Stack.Screen name="admin/notifications" />
          <Stack.Screen name="admin/discount-card" />
          <Stack.Screen name="admin/doctor-accounts" />
          <Stack.Screen name="about" />
          <Stack.Screen name="advertise" />
          <Stack.Screen name="beauty" />
          <Stack.Screen name="beauty/[id]" />
          <Stack.Screen name="blog" />
          <Stack.Screen name="blog/index" />
          <Stack.Screen name="blog/[id]" />
          <Stack.Screen name="consultations" />
          <Stack.Screen name="join" />
          <Stack.Screen name="subscriptions" />
          <Stack.Screen name="labs" />
          <Stack.Screen name="labs/[id]" />
          <Stack.Screen name="media" />
          <Stack.Screen name="partners" />
          <Stack.Screen name="stores" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
        </Stack>
      </AppToastProvider>
    </SafeAreaProvider>
  );
}

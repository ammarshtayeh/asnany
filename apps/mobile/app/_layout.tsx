import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { configureNotifications } from "../lib/notifications";
import { AppToastProvider } from "../components/AppToast";

export default function RootLayout() {
  useEffect(() => {
    void configureNotifications().catch((error) => {
      console.log("Notification setup skipped:", error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AppToastProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="doctors/[id]" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="appointments" />
          <Stack.Screen name="discount-card" />
          <Stack.Screen name="doctor/login" />
          <Stack.Screen name="doctor/dashboard" />
          <Stack.Screen name="admin/login" />
          <Stack.Screen name="admin/dashboard" />
          <Stack.Screen name="admin/discount-card" />
          <Stack.Screen name="admin/doctor-accounts" />
          <Stack.Screen name="about" />
          <Stack.Screen name="advertise" />
          <Stack.Screen name="beauty" />
          <Stack.Screen name="beauty/[id]" />
          <Stack.Screen name="blog/index" />
          <Stack.Screen name="consultations" />
          <Stack.Screen name="join" />
          <Stack.Screen name="labs" />
          <Stack.Screen name="labs/[id]" />
          <Stack.Screen name="media" />
          <Stack.Screen name="partners" />
          <Stack.Screen name="stores" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="doctors/register" />
          <Stack.Screen name="doctors/set-location" />
        </Stack>
      </AppToastProvider>
    </SafeAreaProvider>
  );
}

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="doctors/[id]" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="doctor/login" />
        <Stack.Screen name="doctor/dashboard" />
        <Stack.Screen name="admin/login" />
        <Stack.Screen name="admin/doctor-accounts" />
        <Stack.Screen name="about" />
        <Stack.Screen name="advertise" />
        <Stack.Screen name="beauty" />
        <Stack.Screen name="blog" />
        <Stack.Screen name="consultations" />
        <Stack.Screen name="join" />
        <Stack.Screen name="labs" />
        <Stack.Screen name="marketplace" />
        <Stack.Screen name="media" />
        <Stack.Screen name="offers" />
        <Stack.Screen name="partners" />
        <Stack.Screen name="stores" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="doctors/register" />
        <Stack.Screen name="doctors/set-location" />
      </Stack>
    </SafeAreaProvider>
  );
}

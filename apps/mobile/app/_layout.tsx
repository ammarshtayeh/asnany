import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0e766e"
          },
          headerTintColor: "#ffffff",
          contentStyle: {
            backgroundColor: "#f3efe8"
          }
        }}
      />
    </SafeAreaProvider>
  );
}

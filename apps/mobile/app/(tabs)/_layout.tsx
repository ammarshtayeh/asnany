import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { AIChatbot } from "../../components/AIChatbot";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 72,
            paddingTop: 8,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderTopColor: "#e2e8f0",
          },
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#64748b",
          tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "الرئيسية", tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }} />
        <Tabs.Screen name="offers" options={{ title: "عروض", tabBarIcon: ({ color, size }) => <Feather name="tag" size={size} color={color} /> }} />
        <Tabs.Screen name="marketplace" options={{ title: "المزيد", tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} /> }} />
        <Tabs.Screen name="more" options={{ title: "خيارات", tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} /> }} />
      </Tabs>
      <AIChatbot />
    </View>
  );
}

import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { AIChatbot } from "../../components/AIChatbot";
import { NewsTicker } from "../../components/NewsTicker";
import { MobileNotificationBridge } from "../../components/MobileNotificationBridge";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <NewsTicker />
      <MobileNotificationBridge />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 68,
            paddingTop: 6,
            paddingBottom: 8,
            borderTopWidth: 1,
            borderTopColor: "#e2e8f0",
            backgroundColor: "#ffffff",
          },
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "800" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="doctors"
          options={{
            title: "الأطباء",
            tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="booking"
          options={{
            title: "حجز",
            tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="offers"
          options={{
            title: "عروض",
            tabBarIcon: ({ color, size }) => <Feather name="tag" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "المزيد",
            tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} />,
          }}
        />
        <Tabs.Screen name="marketplace" options={{ href: null }} />
      </Tabs>
      <AIChatbot />
    </View>
  );
}

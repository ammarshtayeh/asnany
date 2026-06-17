import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { AIChatbot } from "../../components/AIChatbot";
import { NewsTicker } from "../../components/NewsTicker";
import { MobileNotificationBridge } from "../../components/MobileNotificationBridge";
import { theme } from "../../constants/theme";

function TabIcon({ name, color, size, focused }: { name: keyof typeof Feather.glyphMap; color: string; size: number; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? theme.tealMuted : "transparent",
      }}
    >
      <Feather name={name} size={focused ? size + 1 : size} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <NewsTicker />
      <MobileNotificationBridge />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 72,
            paddingTop: 8,
            paddingBottom: 10,
            borderTopWidth: 0,
            backgroundColor: theme.card,
            shadowColor: theme.navy,
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: -6 },
            shadowRadius: 16,
            elevation: 12,
          },
          tabBarActiveTintColor: theme.teal,
          tabBarInactiveTintColor: theme.textSoft,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color, size, focused }) => <TabIcon name="home" color={color} size={size} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="doctors"
          options={{
            title: "الأطباء",
            tabBarIcon: ({ color, size, focused }) => <TabIcon name="users" color={color} size={size} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="booking"
          options={{
            title: "حجز",
            tabBarIcon: ({ color, size, focused }) => <TabIcon name="calendar" color={color} size={size} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="offers"
          options={{
            title: "عروض",
            tabBarIcon: ({ color, size, focused }) => <TabIcon name="tag" color={color} size={size} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "المزيد",
            tabBarIcon: ({ color, size, focused }) => <TabIcon name="grid" color={color} size={size} focused={focused} />,
          }}
        />
        <Tabs.Screen name="marketplace" options={{ href: null }} />
      </Tabs>
      <AIChatbot />
    </View>
  );
}

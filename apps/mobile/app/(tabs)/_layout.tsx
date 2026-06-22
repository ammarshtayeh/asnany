import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AIChatbot } from "../../components/AIChatbot";
import { NewsTicker } from "../../components/NewsTicker";
import { MobileNotificationBridge } from "../../components/MobileNotificationBridge";
import { theme } from "../../constants/theme";

function TabIcon({ name, color, size, focused }: { name: keyof typeof Feather.glyphMap; color: string; size: number; focused: boolean }) {
  return (
    <View
      style={{
        width: 48,
        height: 34,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? theme.tealMuted : "transparent",
        ...(focused ? theme.shadow.glow : {}),
      }}
    >
      <Feather name={name} size={focused ? size + 1 : size} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  const tabBarHeight = 62 + bottomPad;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <NewsTicker />
      <MobileNotificationBridge />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            left: 12,
            right: 12,
            bottom: bottomPad,
            height: tabBarHeight - bottomPad,
            paddingTop: 6,
            paddingBottom: 6,
            borderTopWidth: 0,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.cardGlass,
            borderWidth: 1,
            borderColor: "rgba(226,232,240,0.9)",
            ...theme.shadow.float,
          },
          tabBarActiveTintColor: theme.teal,
          tabBarInactiveTintColor: theme.textSoft,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "800", marginTop: 0 },
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
      <AIChatbot
        onNavigateTab={(tab, section) => {
          if (tab === "doctors") router.push("/(tabs)/doctors");
          else if (tab === "more") router.push(section ? "/(tabs)/more" : "/(tabs)/offers");
          else if (tab === "services") router.push("/(tabs)/marketplace");
        }}
      />
    </View>
  );
}

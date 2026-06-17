import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../constants/theme";

type Props = {
  enabled: boolean;
  onEnable: () => void;
  onTest: () => void;
};

export function NotificationSettingsCard({ enabled, onEnable, onTest }: Props) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 22,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: enabled ? "#bae6fd" : "#f1f5f9",
      }}
    >
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
          <Feather name="bell" size={18} color={theme.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>التنبيهات</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748b", textAlign: "right", marginTop: 2 }}>
            {enabled ? "مفعّلة — ستصلك إشعارات الحجوزات والعروض" : "فعّل التنبيهات لتصلك التحديثات فوراً"}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: enabled ? "#ecfdf5" : "#fef2f2",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "900", color: enabled ? "#047857" : "#dc2626" }}>
            {enabled ? "مفعّل" : "متوقف"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={enabled ? onTest : onEnable}
        style={{
          backgroundColor: enabled ? theme.navy : theme.teal,
          borderRadius: 14,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>
          {enabled ? "إرسال تنبيه تجريبي" : "تفعيل التنبيهات الآن"}
        </Text>
      </Pressable>
    </View>
  );
}

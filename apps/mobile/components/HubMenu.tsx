import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { HubItem, HubSection } from "../constants/navigation";

export function HubSectionBlock({
  section,
  onPress,
}: {
  section: HubSection;
  onPress: (path: string) => void;
}) {
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={{ marginBottom: 12, paddingRight: 4 }}>
        <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{section.title}</Text>
        {section.subtitle ? (
          <Text style={{ marginTop: 3, fontSize: 12, fontWeight: "600", color: "#94a3b8", textAlign: "right" }}>{section.subtitle}</Text>
        ) : null}
      </View>

      <View style={{ gap: 8 }}>
        {section.items.map((item) => (
          <HubRow key={item.id} item={item} onPress={() => onPress(item.path)} />
        ))}
      </View>
    </View>
  );
}

function HubRow({ item, onPress }: { item: HubItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 14,
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        opacity: pressed ? 0.86 : 1,
        shadowColor: "#0f172a",
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: item.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={item.icon} size={20} color={item.color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{item.label}</Text>
        {item.desc ? (
          <Text style={{ marginTop: 2, fontSize: 11, fontWeight: "600", color: "#64748b", textAlign: "right" }} numberOfLines={1}>
            {item.desc}
          </Text>
        ) : null}
      </View>

      <Feather name="chevron-left" size={18} color="#cbd5e1" />
    </Pressable>
  );
}

export function QuickActionStrip({
  items,
  onPress,
}: {
  items: HubItem[];
  onPress: (path: string) => void;
}) {
  return (
    <View style={{ flexDirection: "row-reverse", gap: 8, marginBottom: 20 }}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPress(item.path)}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: item.bg,
            borderRadius: 18,
            paddingVertical: 14,
            paddingHorizontal: 8,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#f1f5f9",
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <Feather name={item.icon} size={18} color={item.color} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: "900", color: "#0f172a", textAlign: "center" }}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

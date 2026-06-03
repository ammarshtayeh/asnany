import { Pressable, Text, ViewStyle } from "react-native";
import { router } from "expo-router";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  style?: ViewStyle;
};

export function BackButton({ fallbackHref = "/", label = "رجوع", style }: BackButtonProps) {
  return (
    <Pressable
      onPress={() => {
        try {
          router.back();
        } catch {
          router.push(fallbackHref as any);
        }
      }}
      style={style}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

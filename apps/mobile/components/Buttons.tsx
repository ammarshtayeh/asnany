import { Pressable, Text, ViewStyle } from "react-native";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "success" | "danger";
  style?: ViewStyle;
  disabled?: boolean;
};

const palette = {
  primary: { backgroundColor: "#0f172a", color: "#fff" },
  secondary: { backgroundColor: "#e2e8f0", color: "#0f172a" },
  ghost: { backgroundColor: "transparent", color: "#0f172a" },
  success: { backgroundColor: "#dcfce7", color: "#166534" },
  danger: { backgroundColor: "#fee2e2", color: "#b91c1c" },
} as const;

export function AppButton({ label, onPress, variant = "primary", style, disabled }: ButtonProps) {
  const colors = palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 16,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.backgroundColor,
          opacity: disabled ? 0.55 : pressed ? 0.86 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: colors.color, fontWeight: "900", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

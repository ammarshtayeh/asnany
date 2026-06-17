import { Pressable, Text, ViewStyle } from "react-native";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "success" | "danger";
  style?: ViewStyle;
  disabled?: boolean;
};

const palette = {
  primary: { backgroundColor: "#0c5e47", color: "#fff" },
  secondary: { backgroundColor: "#ecfdf5", color: "#0c5e47" },
  ghost: { backgroundColor: "transparent", color: "#0c5e47" },
  success: { backgroundColor: "#dcfce7", color: "#15803d" },
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
          paddingHorizontal: 18,
          borderRadius: 20,
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

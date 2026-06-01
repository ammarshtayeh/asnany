import { Text, TextProps } from "react-native";

export function AppTitle(props: TextProps) {
  return <Text {...props} style={[{ fontSize: 24, fontWeight: "900", color: "#020617", textAlign: "right" }, props.style]} />;
}

export function AppSubtitle(props: TextProps) {
  return <Text {...props} style={[{ fontSize: 13, fontWeight: "700", color: "#64748b", textAlign: "right", lineHeight: 20 }, props.style]} />;
}

export function AppLabel(props: TextProps) {
  return <Text {...props} style={[{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right" }, props.style]} />;
}

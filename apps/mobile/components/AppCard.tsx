import { ReactNode } from "react";
import { View } from "react-native";

export function AppCard({ children }: { children: ReactNode }) {
  return <View style={{ borderRadius: 24, backgroundColor: "white", padding: 16, borderWidth: 1, borderColor: "#e2e8f0" }}>{children}</View>;
}

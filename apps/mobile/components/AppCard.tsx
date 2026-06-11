import { ReactNode } from "react";
import { View } from "react-native";

export function AppCard({ children }: { children: ReactNode }) {
  return <View style={{ borderRadius: 28, backgroundColor: "white", padding: 18, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 }}>{children}</View>;
}

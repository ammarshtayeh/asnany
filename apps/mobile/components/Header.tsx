import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>أسناني.ps 🇵🇸</Text>
      <Text style={styles.title}>دليلك الفلسطيني الشامل للأسنان</Text>
      <Text style={styles.subtitle}>
        العيادات المعتمدة، مستلزمات طب الأسنان، عروض الخصم الحصرية، وسوق المعدات المستعملة في منصة موحدة فائقة السرعة.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 24,
    gap: 8,
    alignItems: "flex-end",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0d9488",
    letterSpacing: 1.2
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "right"
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#cbd5e1",
    textAlign: "right",
    fontWeight: "600"
  }
});

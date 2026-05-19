import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>أ</Text>
        </View>
        <View>
          <Text style={styles.brand}>أسناني.ps</Text>
          <Text style={styles.country}>فلسطين</Text>
        </View>
      </View>

      <Text style={styles.title}>منصة طبية ذكية للأسنان والتجميل</Text>
      <Text style={styles.subtitle}>
        أطباء موثقون، مراكز تجميل، مختبرات، عروض، أخبار طبية، وسوق للمستلزمات في تجربة واحدة سهلة على الهاتف.
      </Text>

      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: "#ecfeff" }]}>
          <Text style={[styles.statNumber, { color: colors.teal }]}>حجز</Text>
          <Text style={styles.statLabel}>سريع</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: "#fef3c7" }]}>
          <Text style={[styles.statNumber, { color: colors.amber }]}>عروض</Text>
          <Text style={styles.statLabel}>متجددة</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: "#f5f3ff" }]}>
          <Text style={[styles.statNumber, { color: colors.violet }]}>دليل</Text>
          <Text style={styles.statLabel}>موثوق</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.ink,
    borderRadius: 28,
    padding: 22,
    gap: 14,
    alignItems: "flex-end",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  brandRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.sky,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  brand: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
  },
  country: {
    color: "#bae6fd",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
    textAlign: "right",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "right",
  },
  statsRow: {
    width: "100%",
    flexDirection: "row-reverse",
    gap: 8,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 13,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
});

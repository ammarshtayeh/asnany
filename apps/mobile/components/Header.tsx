import React from "react";
import { ImageBackground, Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1400";

export default function Header() {
  return (
    <ImageBackground source={{ uri: HERO_IMAGE_URL }} style={styles.header} imageStyle={styles.headerImage}>
      <View style={styles.overlay} />
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/logo-mark.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandText}>
            <Text style={styles.brand}>MALAMIH</Text>
            <Text style={styles.country}>دليل صحة وجمال الوجه في فلسطين</Text>
          </View>
        </View>

        <Text style={styles.title}>ابحث، قارن، واحجز رعايتك الطبية من مكان واحد.</Text>
        <Text style={styles.subtitle}>
          أطباء موثقون، عروض، متاجر، مختبرات، تجميل، واستشارات في تجربة واحدة مرتبة على الهاتف.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>حجز</Text>
            <Text style={styles.statLabel}>سريع</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>عروض</Text>
            <Text style={styles.statLabel}>متجددة</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>دليل</Text>
            <Text style={styles.statLabel}>موثوق</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    borderRadius: 24,
    minHeight: 260,
    overflow: "hidden",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  headerImage: {
    borderRadius: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.68)",
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  brandRow: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#295f59",
  },
  brandText: {
    alignItems: "flex-start",
  },
  brand: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "left",
  },
  country: {
    color: "#bae6fd",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "left",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 30,
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
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  statNumber: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  statLabel: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },
});

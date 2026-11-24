import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { usePathname } from "expo-router";
import { apiFetch } from "../lib/api";
import { theme } from "../constants/theme";

type PrelaunchState = {
  enabled: boolean;
  title: string;
  message: string;
};

const FALLBACK: PrelaunchState = {
  enabled: false,
  title: "قريباً",
  message: "ترقّبوا إطلاق ملامح في فلسطين",
};

export function ComingSoonGate() {
  const pathname = usePathname() || "";
  const [settings, setSettings] = useState<PrelaunchState>(FALLBACK);
  const [ready, setReady] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const bypass = pathname.startsWith("/admin");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { response, data } = await apiFetch<PrelaunchState>("/api/site/prelaunch");
      if (cancelled) return;
      if (response.ok && data) {
        setSettings({
          enabled: Boolean(data.enabled),
          title: String(data.title || FALLBACK.title),
          message: String(data.message || FALLBACK.message),
        });
      } else {
        setSettings(FALLBACK);
      }
      setReady(true);
    }

    void load();
    const timer = setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready || bypass || !settings.enabled) return;

    fade.setValue(0);
    rise.setValue(16);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(rise, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ready, bypass, settings.enabled, fade, rise, pulse]);

  if (!ready || bypass || !settings.enabled) return null;

  return (
    <View style={styles.root} pointerEvents="auto">
      <View style={styles.blurWash} />
      <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: rise }] }]}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.eyebrow}>MALAMIH.PS</Text>
        <Text style={styles.title}>{settings.title}</Text>
        <Text style={styles.message}>{settings.message}</Text>
        <View style={styles.line} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "rgba(10, 22, 40, 0.72)",
  },
  blurWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(41, 95, 89, 0.28)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    marginBottom: 18,
    backgroundColor: theme.teal,
  },
  eyebrow: {
    color: theme.goldLight,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    color: theme.white,
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    marginTop: 12,
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 28,
    textAlign: "center",
  },
  line: {
    marginTop: 28,
    width: 88,
    height: 1,
    backgroundColor: theme.gold,
    opacity: 0.7,
  },
});

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { NewsTickerItem } from "@pal-dental/shared";
import { filterActiveTickerItems } from "@pal-dental/shared";
import { apiFetch } from "../lib/api";
import { theme } from "../constants/theme";

const ROTATE_MS = 5000;

export function NewsTicker() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<NewsTickerItem[]>([]);
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    const { data } = await apiFetch<{ items?: NewsTickerItem[] }>("/api/ticker");
    const rows = Array.isArray(data?.items) ? data.items : [];
    setItems(filterActiveTickerItems(rows));
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
      setIndex((current) => (current + 1) % items.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [fade, items.length]);

  const active = useMemo(() => items[index] || null, [items, index]);
  if (!active) return null;

  const textColor = active.text_color || theme.white;
  const bg = active.background_color || theme.navy;

  const open = () => {
    if (!active.link_url) return;
    const url = active.link_url.startsWith("http") ? active.link_url : `https://malamih.ps${active.link_url}`;
    void Linking.openURL(url);
  };

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: bg }}>
      <Pressable onPress={open} style={{ backgroundColor: bg, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" }}>
        <Animated.View
          style={{
            opacity: fade,
            minHeight: 64,
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
            <Feather name="volume-2" size={11} color={textColor} />
            <Text style={{ color: textColor, fontSize: 10, fontWeight: "900" }}>إعلان</Text>
          </View>

          {active.image_url ? (
            <Image source={{ uri: active.image_url }} style={{ width: 52, height: 40, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }} resizeMode="cover" />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="image" size={18} color={textColor} />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ color: textColor, fontSize: 13, fontWeight: "900", textAlign: "right" }} numberOfLines={1}>
              {active.title}
            </Text>
            {active.subtitle ? (
              <Text style={{ color: textColor, fontSize: 11, fontWeight: "700", opacity: 0.88, textAlign: "right", marginTop: 2 }} numberOfLines={1}>
                {active.subtitle}
              </Text>
            ) : null}
          </View>

          {items.length > 1 ? (
            <View style={{ flexDirection: "row-reverse", gap: 3 }}>
              {items.map((item, i) => (
                <View
                  key={item.id}
                  style={{
                    width: i === index ? 14 : 5,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: i === index ? textColor : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </View>
          ) : (
            <Feather name="chevron-left" size={16} color={textColor} style={{ opacity: 0.7 }} />
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

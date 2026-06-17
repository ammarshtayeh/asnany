import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Linking, Pressable, Text, View } from "react-native";
import { apiFetch } from "../lib/api";

type TickerItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  background_color?: string | null;
  text_color?: string | null;
};

export function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    void apiFetch<{ items?: TickerItem[] }>("/api/ticker").then(({ data }) => {
      setItems(Array.isArray(data?.items) ? data.items : []);
    });
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
      setIndex((current) => (current + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [fade, items.length]);

  const active = useMemo(() => items[index] || null, [items, index]);
  if (!active) return null;

  const open = () => {
    if (active.link_url) void Linking.openURL(active.link_url);
  };

  return (
    <Pressable onPress={open} style={{ backgroundColor: active.background_color || "#0a1628" }}>
      <Animated.View style={{ opacity: fade, minHeight: 44, flexDirection: "row-reverse", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
        <View style={{ backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: active.text_color || "#fff", fontSize: 10, fontWeight: "900" }}>آخر الأخبار</Text>
        </View>
        {active.image_url ? (
          <Image source={{ uri: active.image_url }} style={{ width: 42, height: 28, borderRadius: 8 }} resizeMode="cover" />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: active.text_color || "#fff", fontSize: 12, fontWeight: "900", textAlign: "right" }} numberOfLines={1}>
            {active.title}
          </Text>
          {active.subtitle ? (
            <Text style={{ color: active.text_color || "#fff", fontSize: 10, fontWeight: "700", opacity: 0.85, textAlign: "right" }} numberOfLines={1}>
              {active.subtitle}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

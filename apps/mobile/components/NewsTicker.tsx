import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, ImageBackground, Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type { NewsTickerItem } from "@pal-dental/shared";
import { TICKER_ROTATE_MS, filterActiveTickerItems, getTickerPresentation } from "@pal-dental/shared";
import { apiFetch } from "../lib/api";
import { theme } from "../constants/theme";

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
        Animated.timing(fade, { toValue: 0.2, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
      setIndex((current) => (current + 1) % items.length);
    }, TICKER_ROTATE_MS);
    return () => clearInterval(timer);
  }, [fade, items.length]);

  const active = useMemo(() => items[index] || null, [items, index]);
  const style = useMemo(
    () => (active ? getTickerPresentation(active, index) : null),
    [active, index],
  );

  if (!active || !style) {
    return <View style={{ paddingTop: insets.top, backgroundColor: theme.bg }} />;
  }

  const open = () => {
    if (!active.link_url) return;
    const url = active.link_url.startsWith("http") ? active.link_url : `https://www.malamih.ps${active.link_url}`;
    void Linking.openURL(url);
  };

  const content = (
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
      <View
        style={{
          backgroundColor: `${style.accentColor}33`,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 5,
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Feather name="volume-2" size={11} color={style.accentColor} />
        <Text style={{ color: style.textColor, fontSize: 10, fontWeight: "900" }}>إعلان</Text>
      </View>

      {active.image_url ? (
        <Image
          source={{ uri: active.image_url }}
          style={{
            width: 52,
            height: 40,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: `${style.accentColor}55`,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: `${style.accentColor}28`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="image" size={18} color={style.accentColor} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ color: style.textColor, fontSize: 13, fontWeight: "900", textAlign: "right" }} numberOfLines={1}>
          {active.title}
        </Text>
        {active.subtitle ? (
          <Text
            style={{ color: style.textColor, fontSize: 11, fontWeight: "700", opacity: 0.9, textAlign: "right", marginTop: 2 }}
            numberOfLines={1}
          >
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
                backgroundColor: i === index ? style.accentColor : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </View>
      ) : (
        <Feather name="chevron-left" size={16} color={style.textColor} style={{ opacity: 0.7 }} />
      )}
    </Animated.View>
  );

  return (
    <View style={{ paddingTop: insets.top }}>
      <Pressable onPress={open}>
        {style.useImageBackdrop && active.image_url ? (
          <ImageBackground source={{ uri: active.image_url }} resizeMode="cover" blurRadius={8} style={{ overflow: "hidden" }}>
            <View style={{ backgroundColor: `${style.backgroundColor}d9`, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}>
              {content}
            </View>
          </ImageBackground>
        ) : (
          <View
            style={{
              backgroundColor: style.backgroundColor,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.1)",
            }}
          >
            {content}
          </View>
        )}
      </Pressable>
    </View>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { theme } from "../constants/theme";
import { StackCard, StackPageLayout, StackPrimaryButton } from "./ui/StackPageLayout";

type ServiceDetailScreenProps = {
  type: Extract<MedicalServiceType, "beauty" | "lab">;
  title: string;
  backPath: string;
  accentColor: string;
  fallbackEmoji: string;
};

export function ServiceDetailScreen({
  type,
  title,
  backPath,
  accentColor,
  fallbackEmoji,
}: ServiceDetailScreenProps) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [service, setService] = useState<MedicalService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadService() {
      if (!id) return;
      setLoading(true);
      try {
        if (!supabase) {
          setService(null);
          return;
        }

        const { data, error } = await supabase
          .from("medical_services")
          .select("*")
          .eq("id", id)
          .eq("service_type", type)
          .maybeSingle();

        if (error) throw error;
        if (!cancelled) setService((data as MedicalService | null) || null);
      } catch (error) {
        console.error("Load service detail error:", error);
        if (!cancelled) setService(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadService();
    return () => {
      cancelled = true;
    };
  }, [id, type]);

  const gallery = useMemo(() => {
    const images = [service?.image_url, ...(service?.gallery || [])].filter(Boolean) as string[];
    return Array.from(new Set(images));
  }, [service]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: theme.bg, padding: 24 }}>
        <StackCard style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 36 }}>{fallbackEmoji}</Text>
          <Text style={{ marginTop: 10, color: "#0f172a", fontSize: 18, fontWeight: "900", textAlign: "center" }}>لم يتم العثور على الصفحة</Text>
          <Text style={{ marginTop: 6, color: "#64748b", fontSize: 13, fontWeight: "700", textAlign: "center", lineHeight: 21 }}>
            قد تكون الخدمة غير مفعلة حالياً أو تم تغيير الرابط.
          </Text>
          <StackPrimaryButton label="العودة للقائمة" onPress={() => router.replace(backPath as never)} />
        </StackCard>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ minHeight: 290, backgroundColor: theme.navy, padding: 20, paddingTop: insets.top + 14, justifyContent: "flex-end", overflow: "hidden", borderBottomLeftRadius: theme.radius.xxl, borderBottomRightRadius: theme.radius.xxl }}>
        {service.image_url ? (
          <Image source={{ uri: service.image_url }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.28 }} resizeMode="cover" />
        ) : null}
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.72)" }} />

        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace(backPath as any);
          }}
          style={{ position: "absolute", top: insets.top + 14, right: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}
        >
          <Feather name="arrow-right" size={20} color="#fff" />
        </Pressable>

        <View style={{ position: "relative", gap: 10 }}>
          <View style={{ alignSelf: "flex-end", borderRadius: 999, backgroundColor: accentColor + "24", borderWidth: 1, borderColor: accentColor + "55", paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{fallbackEmoji} {title}</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 27, lineHeight: 36, fontWeight: "900", textAlign: "right" }}>{service.name}</Text>
          <Text style={{ color: "#cbd5e1", fontSize: 13, fontWeight: "700", textAlign: "right", lineHeight: 22 }}>
            {[service.city, service.area, service.category].filter(Boolean).join(" · ") || "تفاصيل الخدمة"}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        {service.description ? (
          <InfoCard icon="file-text" title="نبذة">
            <Text style={{ color: "#475569", fontSize: 13, fontWeight: "700", textAlign: "right", lineHeight: 23 }}>{service.description}</Text>
          </InfoCard>
        ) : null}

        {service.services?.length ? (
          <InfoCard icon="check-circle" title={type === "lab" ? "الفحوصات والخدمات" : "الخدمات المتاحة"}>
            <View style={{ gap: 8 }}>
              {service.services.map((item) => (
                <View key={item} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, borderRadius: 14, backgroundColor: "#f8fafc", padding: 12, borderWidth: 1, borderColor: "#eef2f7" }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor }} />
                  <Text style={{ flex: 1, color: "#334155", fontSize: 13, fontWeight: "800", textAlign: "right" }}>{item}</Text>
                </View>
              ))}
            </View>
          </InfoCard>
        ) : null}

        <InfoCard icon="map-pin" title="التواصل والموقع">
          <View style={{ gap: 10 }}>
            {[service.city, service.area, service.address].filter(Boolean).length ? (
              <Text style={{ color: "#475569", fontSize: 13, fontWeight: "800", textAlign: "right", lineHeight: 22 }}>
                {[service.city, service.area, service.address].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
            {service.price_range ? <Text style={{ color: "#0f172a", fontSize: 13, fontWeight: "900", textAlign: "right" }}>نطاق الأسعار: {service.price_range}</Text> : null}
            <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
              {service.phone ? <ActionButton label="اتصال" icon="phone" color="#0284c7" onPress={() => Linking.openURL(`tel:${service.phone}`)} /> : null}
              {service.whatsapp ? <ActionButton label="واتساب" icon="message-circle" color="#0d9488" onPress={() => Linking.openURL(`https://wa.me/${service.whatsapp?.replace(/\D/g, "")}`)} /> : null}
              {service.website ? <ActionButton label="الموقع" icon="globe" color="#7c3aed" onPress={() => Linking.openURL(service.website!)} /> : null}
            </View>
          </View>
        </InfoCard>

        {gallery.length ? (
          <InfoCard icon="image" title="الصور">
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
              {gallery.slice(0, 6).map((image) => (
                <Image key={image} source={{ uri: image }} style={{ width: "31%", aspectRatio: 1, borderRadius: 16, backgroundColor: "#e2e8f0" }} resizeMode="cover" />
              ))}
            </View>
          </InfoCard>
        ) : null}
      </View>
    </ScrollView>
  );
}

function InfoCard({ icon, title, children }: { icon: keyof typeof Feather.glyphMap; title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", gap: 12 }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
        <Feather name={icon} size={18} color="#0f172a" />
        <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900", textAlign: "right" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ActionButton({ label, icon, color, onPress }: { label: string; icon: keyof typeof Feather.glyphMap; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexGrow: 1, minHeight: 46, borderRadius: 15, backgroundColor: color, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 7 }}>
      <Feather name={icon} size={16} color="#fff" />
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

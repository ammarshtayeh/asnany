import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View, Pressable } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { theme } from "../constants/theme";
import { EmptyStateCTA } from "./EmptyStateCTA";
import { MedicalService, MedicalServiceType } from "../types";
import { StackCard, StackPageLayout, StackPrimaryButton, StackSecondaryButton } from "./ui/StackPageLayout";

interface ServicePageProps {
  badge: string;
  title: string;
  description: string;
  features: string[];
  actions: Array<{ label: string; href: string }>;
  emptyLabel: string;
  accentColor?: string;
  emoji?: string;
  serviceType?: Extract<MedicalServiceType, "beauty" | "lab">;
}

export function ServicePage({
  badge,
  title,
  description,
  features,
  actions,
  emptyLabel,
  accentColor = theme.teal,
  emoji = "🏥",
  serviceType,
}: ServicePageProps) {
  const [services, setServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(Boolean(serviceType));

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      if (!serviceType) return;
      setLoading(true);
      try {
        if (!supabase) {
          setServices([]);
          return;
        }

        const { data, error } = await supabase
          .from("medical_services")
          .select("*")
          .eq("service_type", serviceType)
          .eq("is_active", true)
          .order("is_featured", { ascending: false });

        if (error) throw error;
        if (!cancelled) setServices((data as MedicalService[]) || []);
      } catch (error) {
        console.error("Load service page listings error:", error);
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadServices();
    return () => {
      cancelled = true;
    };
  }, [serviceType]);

  return (
    <StackPageLayout badge={`${emoji} ${badge}`} title={title} subtitle={description}>
      <StackCard>
        <Text style={{ fontSize: 16, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 14 }}>ما يميز هذه الخدمة</Text>
        {features.map((feature) => (
          <View key={feature} style={{ flexDirection: "row-reverse", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: `${accentColor}22`, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: accentColor, fontWeight: "900", fontSize: 12 }}>✓</Text>
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, lineHeight: 20 }}>{feature}</Text>
          </View>
        ))}
      </StackCard>

      {serviceType ? (
        <>
          <Text style={{ color: theme.text, fontSize: 17, fontWeight: "900", textAlign: "right", marginBottom: -6 }}>القائمة المتاحة</Text>
          {loading ? (
            <StackCard style={{ alignItems: "center", paddingVertical: 28 }}>
              <ActivityIndicator color={accentColor} />
              <Text style={{ marginTop: 10, color: theme.textMuted, fontWeight: "800" }}>جاري تحميل البيانات...</Text>
            </StackCard>
          ) : services.length ? (
            services.map((service) => (
              <Pressable key={service.id} onPress={() => router.push(`/${serviceType}/${service.id}` as never)}>
                <StackCard style={{ flexDirection: "row-reverse", gap: 12, alignItems: "center" }}>
                  {service.image_url ? (
                    <Image source={{ uri: service.image_url }} style={{ width: 70, height: 70, borderRadius: 18, backgroundColor: theme.borderLight }} resizeMode="cover" />
                  ) : (
                    <View style={{ width: 70, height: 70, borderRadius: 18, backgroundColor: `${accentColor}18`, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 26 }}>{emoji}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text style={{ color: theme.text, fontSize: 15, fontWeight: "900", textAlign: "right" }}>{service.name}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: "800", textAlign: "right", marginTop: 3 }}>
                      {[service.city, service.area, service.category].filter(Boolean).join(" · ") || badge}
                    </Text>
                    {service.description ? (
                      <Text numberOfLines={2} style={{ color: theme.textMuted, fontSize: 12, fontWeight: "600", textAlign: "right", marginTop: 5, lineHeight: 18 }}>
                        {service.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={{ color: theme.textSoft, fontWeight: "900", fontSize: 18 }}>←</Text>
                </StackCard>
              </Pressable>
            ))
          ) : (
            <EmptyStateCTA icon="activity" title="القائمة قيد التوسّع" description={emptyLabel} primaryLabel="سجّل منشأتك" secondaryHref="/advertise" secondaryLabel="أعلن معنا" />
          )}
        </>
      ) : (
        <EmptyStateCTA icon="activity" title="القائمة قيد التوسّع" description={emptyLabel} primaryLabel="سجّل منشأتك" secondaryHref="/advertise" secondaryLabel="أعلن معنا" />
      )}

      {actions[0] ? <StackPrimaryButton label={actions[0].label} onPress={() => router.push(actions[0].href as never)} /> : null}
      {actions[1] ? <StackSecondaryButton label={actions[1].label} onPress={() => router.push(actions[1].href as never)} /> : null}
    </StackPageLayout>
  );
}

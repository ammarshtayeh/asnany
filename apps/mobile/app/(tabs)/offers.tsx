import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Offer } from "../../types";
import { theme } from "../../constants/theme";
import { EmptyState, ScreenHero } from "../../components/ui/premium";

const OFFER_IMAGES = [
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
];

function getOfferImage(index: number) {
  return OFFER_IMAGES[index % OFFER_IMAGES.length];
}

function getDaysLeft(validUntil: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(validUntil).getTime() - Date.now()) / (1000 * 3600 * 24))
  );
}

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers((data as Offer[]) || []);
    } catch (err) {
      console.error("Error loading offers:", err);
    } finally {
      setLoading(false);
    }
  }

  const featuredOffer = offers[0];
  const restOffers = offers.slice(1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        paddingTop={12}
        badge="عروض مختارة بعناية"
        title="وفّر على خدمات الصحة والجمال"
        subtitle="عروض محدثة من أطباء وعيادات ضمن شبكة ملامح — بدون التنازل عن الجودة."
      >
        <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 18 }}>
          {[
            { value: String(offers.length || "—"), label: "عرض نشط" },
            { value: "موثق", label: "مصدر العرض" },
            { value: "سريع", label: "حجز فوري" },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 12, alignItems: "center" }}>
              <Text style={{ color: theme.white, fontWeight: "900", fontSize: 16 }}>{stat.value}</Text>
              <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 10, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScreenHero>

      <View style={{ padding: 16, gap: 14, marginTop: -12 }}>
        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.teal} />
            <Text style={{ color: "#94a3b8", fontWeight: "700", marginTop: 12, fontSize: 13 }}>
              جاري تحميل العروض...
            </Text>
          </View>
        ) : offers.length === 0 ? (
          <EmptyState icon="tag" title="لا توجد عروض نشطة حالياً" description="تابعنا لاحقاً للاطلاع على أحدث الخصومات." />
        ) : (
          <>
            {/* Featured Offer */}
            {featuredOffer && (
              <View
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  elevation: 3,
                }}
              >
                <View style={{ height: 200, position: "relative" }}>
                  <Image
                    source={{ uri: getOfferImage(0) }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(15,23,42,0.5)",
                    }}
                  />
                  {/* Discount Badge */}
                  {(featuredOffer.discount_percentage ?? featuredOffer.discount_pct) ? (
                    <View
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: "#dc2626",
                        borderRadius: 14,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        alignItems: "center",
                        shadowColor: "#dc2626",
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 22, lineHeight: 24 }}>
                        {featuredOffer.discount_percentage ?? featuredOffer.discount_pct}%
                      </Text>
                      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>خصم</Text>
                    </View>
                  ) : null}

                  {/* Days Left */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      backgroundColor: "rgba(15,23,42,0.7)",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={{ color: "#fcd34d", fontSize: 12 }}>🕐</Text>
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>
                      {getDaysLeft(featuredOffer.valid_until) > 0
                        ? `${getDaysLeft(featuredOffer.valid_until)} يوم متبقي`
                        : "ينتهي اليوم"}
                    </Text>
                  </View>

                  {/* Featured Badge */}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      backgroundColor: "rgba(245,158,11,0.9)",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>✨ العرض الأبرز</Text>
                  </View>
                </View>

                <View style={{ padding: 18 }}>
                  <Text style={{ fontSize: 12, color: "#f59e0b", fontWeight: "900", marginBottom: 4 }}>
                    🏷️ {featuredOffer.doctor_name || "عرض طبي"}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right", lineHeight: 26 }}>
                    {featuredOffer.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "600", textAlign: "right", lineHeight: 20, marginTop: 6 }} numberOfLines={3}>
                    {featuredOffer.description}
                  </Text>

                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 14, paddingTop: 14 }}>
                    {/* Price */}
                    <View style={{ alignItems: "flex-end" }}>
                      {featuredOffer.original_price ? (
                        <Text style={{ fontSize: 12, color: "#94a3b8", fontWeight: "700", textDecorationLine: "line-through" }}>
                          {featuredOffer.original_price} ₪
                        </Text>
                      ) : null}
                      <Text style={{ fontSize: 20, fontWeight: "900", color: "#0f172a" }}>
                        {featuredOffer.discounted_price ? `${featuredOffer.discounted_price} ₪` : "خاص"}
                      </Text>
                    </View>

                    {/* CTA */}
                    {featuredOffer.doctor_id ? (
                      <Pressable
                        onPress={() => router.push(`/doctors/${featuredOffer.doctor_id}` as any)}
                        style={{ backgroundColor: theme.teal, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>احجز الآن</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            )}

            {/* Rest of offers */}
            {restOffers.map((offer, index) => {
              const discount = offer.discount_percentage ?? offer.discount_pct ?? 0;
              const daysLeft = getDaysLeft(offer.valid_until);
              return (
                <Pressable
                  key={offer.id}
                  onPress={() => offer.doctor_id && router.push(`/doctors/${offer.doctor_id}` as any)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                    borderWidth: 1,
                    borderColor: "#f1f5f9",
                  }}
                >
                  <View style={{ height: 160, position: "relative" }}>
                    <Image
                      source={{ uri: getOfferImage(index + 1) }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.3)" }} />

                    {discount > 0 && (
                      <View
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: "#dc2626",
                          borderRadius: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, lineHeight: 18 }}>{discount}%</Text>
                        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 9 }}>خصم</Text>
                      </View>
                    )}

                    <View
                      style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        backgroundColor: "rgba(15,23,42,0.7)",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Text style={{ color: "#fcd34d", fontSize: 10 }}>🕐</Text>
                      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>
                        {daysLeft > 0 ? `${daysLeft} يوم متبقي` : "ينتهي اليوم"}
                      </Text>
                    </View>
                  </View>

                  <View style={{ padding: 14 }}>
                    <Text style={{ fontSize: 11, color: "#f59e0b", fontWeight: "900", marginBottom: 3 }}>
                      🏷️ {offer.doctor_name || "عرض طبي"}
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", textAlign: "right", lineHeight: 22 }} numberOfLines={2}>
                      {offer.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "right", marginTop: 4 }} numberOfLines={2}>
                      {offer.description}
                    </Text>
                    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f8fafc" }}>
                      <View style={{ alignItems: "flex-end" }}>
                        {offer.original_price ? (
                          <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "700", textDecorationLine: "line-through" }}>
                            {offer.original_price} ₪
                          </Text>
                        ) : null}
                        <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a" }}>
                          {offer.discounted_price ? `${offer.discounted_price} ₪` : "خاص"}
                        </Text>
                      </View>
                      {offer.doctor_id && (
                        <View style={{ backgroundColor: theme.teal, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
                          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>عرض التفاصيل ←</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

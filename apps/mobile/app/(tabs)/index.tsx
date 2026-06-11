import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Doctor, Offer } from "../../types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80";

const QUICK_CATEGORIES = [
  { label: "أسنان", emoji: "🦷", query: "أسنان", color: "#0ea5e9", bg: "#f0f9ff" },
  { label: "جلدية", emoji: "🧴", query: "جلدية", color: "#ec4899", bg: "#fdf2f8" },
  { label: "تجميل", emoji: "✨", query: "تجميل", color: "#a855f7", bg: "#faf5ff" },
  { label: "عيون", emoji: "👁️", query: "عيون", color: "#10b981", bg: "#ecfdf5" },
  { label: "أنف وأذن", emoji: "👂", query: "أنف وأذن وحنجرة", color: "#f59e0b", bg: "#fffbeb" },
];

const HOME_ACTIONS = [
  { label: "احجز الآن", emoji: "📅", path: "/booking", color: "#10b981", bg: "#ecfdf5" },
  { label: "بطاقة الخصم", emoji: "💳", path: "/discount-card", color: "#2563eb", bg: "#eff6ff" },
  { label: "العروض", emoji: "🏷️", path: "/offers", color: "#f59e0b", bg: "#fffbeb" },
  { label: "انضم للمنصة", emoji: "🤝", path: "/join", color: "#8b5cf6", bg: "#f5f3ff" },
];

const DIAGNOSIS_OPTIONS = [
  { id: "pain", title: "ألم شديد بالأسنان", specialty: "طب أسنان عام", emoji: "🦷" },
  { id: "align", title: "تشوش أو ضعف نظر", specialty: "طب وجراحة العيون", emoji: "👁️" },
  { id: "missing", title: "مشاكل بشرة وتساقط شعر", specialty: "جلدية وتجميل", emoji: "🧴" },
  { id: "kids", title: "تجميل أو حقن فيلر وبوتوكس", specialty: "جراحة التجميل والترميم", emoji: "✨" },
];

function DoctorCard({
  doctor,
  onPress,
  onWhatsApp,
}: {
  doctor: Doctor;
  onPress: () => void;
  onWhatsApp: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f1f5f9",
      }}
    >
      {/* Top strip */}
      <View style={{ backgroundColor: doctor.is_featured ? "#0f172a" : "#f8fafc", height: 6 }} />
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: "#e2e8f0",
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {doctor.image_url ? (
              <Image source={{ uri: doctor.image_url }} style={{ width: 56, height: 56 }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 26 }}>🧑‍⚕️</Text>
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>
                {doctor.name}
              </Text>
              {doctor.verified && <Text style={{ fontSize: 14 }}>✅</Text>}
            </View>
            <Text style={{ fontSize: 12, color: "#10b981", fontWeight: "800", textAlign: "right" }}>
              {(doctor.specialty || []).slice(0, 2).join(" · ")}
            </Text>
            <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "700", textAlign: "right" }}>
              📍 {doctor.city} {doctor.area ? `· ${doctor.area}` : ""}
            </Text>
          </View>
        </View>

        {/* Rating */}
        {doctor.rating > 0 && (
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Text key={i} style={{ fontSize: 12, color: i <= Math.round(doctor.rating) ? "#f59e0b" : "#e2e8f0" }}>
                ★
              </Text>
            ))}
            <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "700", marginRight: 4 }}>
              {doctor.rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Bio */}
        {doctor.bio ? (
          <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "right", lineHeight: 18 }} numberOfLines={2}>
            {doctor.bio}
          </Text>
        ) : null}

        {/* Actions */}
        <View style={{ flexDirection: "row-reverse", gap: 8 }}>
          <Pressable
            onPress={onPress}
            style={{ flex: 1, backgroundColor: "#0f172a", borderRadius: 12, paddingVertical: 11, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>عرض الملف</Text>
          </Pressable>
          {(doctor.whatsapp || doctor.phone) && (
            <Pressable
              onPress={onWhatsApp}
              style={{ backgroundColor: "#dcfce7", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16 }}>💬</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [latestOffers, setLatestOffers] = useState<Offer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (!supabase) return;

      const [{ data: docs }, { data: offs }] = await Promise.all([
        supabase.from("doctors").select("*").order("is_featured", { ascending: false }).limit(50),
        supabase.from("offers").select("*").order("created_at", { ascending: false }).limit(3),
      ]);

      setDoctors((docs as Doctor[]) || []);
      setLatestOffers((offs as Offer[]) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) =>
      [d.name, d.city, d.area, d.bio, d.category, ...(d.specialty || [])].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [doctors, query]);

  const featured = doctors.filter((d) => d.is_featured);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== HERO ===== */}
      <View style={{ height: 320, position: "relative" }}>
        <Image source={{ uri: HERO_IMAGE }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.6)" }} />

        {/* Header */}
        <View style={{ position: "absolute", top: insets.top + 12, left: 0, right: 0, paddingHorizontal: 20, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#d4af37", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>م</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }}>ملامح.ps</Text>
          </View>
          <Pressable
            onPress={() => router.push("/discount-card" as any)}
            style={{ backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7 }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>💳 بطاقة الخصم</Text>
          </Pressable>
        </View>

        {/* Hero Text */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
          <View style={{ backgroundColor: "rgba(212,175,55,0.15)", borderWidth: 1, borderColor: "rgba(212,175,55,0.35)", borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-end", marginBottom: 10 }}>
            <Text style={{ color: "#fef08a", fontWeight: "900", fontSize: 11 }}>✨ دليل صحة وجمال الوجه والأسنان في فلسطين</Text>
          </View>
          <Text style={{ fontSize: 26, fontWeight: "900", color: "#fff", textAlign: "right", lineHeight: 34 }}>
            كل ما تحتاجه لصحتك وجمالك..{"\n"}في متناول يدك
          </Text>
          <Text style={{ fontSize: 13, color: "#cbd5e1", fontWeight: "600", textAlign: "right", marginTop: 6 }}>
            أطباء موثقون · حجز مباشر · عروض حصرية
          </Text>
        </View>
      </View>

      {/* ===== SEARCH ===== */}
      <View style={{ marginHorizontal: 16, marginTop: -24, zIndex: 10 }}>
        <View style={{
          backgroundColor: "#fff",
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#f1f5f9",
          flexDirection: "row-reverse",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingVertical: 4,
          shadowColor: "#0a0f1d",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 20,
          elevation: 5,
        }}>
          <Text style={{ color: "#94a3b8", fontSize: 16, marginLeft: 8 }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن طبيب، تخصص، أو مدينة..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, color: "#0f172a", fontWeight: "700", textAlign: "right", height: 52, fontSize: 14 }}
          />
        </View>
      </View>

      <View style={{ padding: 16, gap: 24 }}>
        {/* ===== QUICK CATEGORIES ===== */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 10 }}>
            🗂️ ابحث حسب التخصص
          </Text>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
            {QUICK_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.label}
                onPress={() => setQuery(cat.query)}
                style={{
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  backgroundColor: cat.bg,
                  borderWidth: 1,
                  borderColor: cat.color + "33",
                }}
              >
                <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: "900", color: cat.color }}>{cat.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ===== HOME ACTIONS GRID ===== */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 10 }}>
            ⚡ اختيارات سريعة
          </Text>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
            {HOME_ACTIONS.map((action) => (
              <Pressable
                key={action.path}
                onPress={() => router.push(action.path as any)}
                style={{
                  width: "48%",
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                  shadowColor: "#000",
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: action.bg, alignItems: "center", justifyContent: "center", marginBottom: 8, alignSelf: "flex-end" }}>
                  <Text style={{ fontSize: 20 }}>{action.emoji}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ===== LATEST OFFERS ===== */}
        {latestOffers.length > 0 && (
          <View>
            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a" }}>🏷️ أحدث العروض</Text>
              <Pressable onPress={() => router.push("/offers" as any)}>
                <Text style={{ fontSize: 12, color: "#10b981", fontWeight: "900" }}>عرض الكل ←</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, flexDirection: "row-reverse" }}>
              {latestOffers.map((offer) => {
                const discount = offer.discount_percentage ?? offer.discount_pct ?? 0;
                return (
                  <Pressable
                    key={offer.id}
                    onPress={() => offer.doctor_id && router.push(`/doctor/${offer.doctor_id}` as any)}
                    style={{ width: 220, backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
                  >
                    <View style={{ height: 120, position: "relative" }}>
                      <Image source={{ uri: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80" }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                      {discount > 0 && (
                        <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "#dc2626", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>{discount}% خصم</Text>
                        </View>
                      )}
                    </View>
                    <View style={{ padding: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: "900", color: "#0f172a", textAlign: "right" }} numberOfLines={2}>{offer.title}</Text>
                      <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "700", textAlign: "right", marginTop: 3 }}>
                        🏷️ {offer.doctor_name || "عرض طبي"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ===== DIAGNOSIS HELPER ===== */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 10 }}>
            🩺 ما الذي يزعجك؟
          </Text>
          <View style={{ gap: 8 }}>
            {DIAGNOSIS_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => setQuery(opt.specialty)}
                style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, flexDirection: "row-reverse", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#f1f5f9" }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{opt.title}</Text>
                  <Text style={{ fontSize: 11, color: "#10b981", fontWeight: "800", textAlign: "right" }}>ابحث عن: {opt.specialty}</Text>
                </View>
                <Text style={{ color: "#cbd5e1", fontSize: 16 }}>←</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ===== DOCTOR LIST ===== */}
        <View>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a" }}>
              👨‍⚕️ {query ? `نتائج البحث (${filtered.length})` : `الأطباء (${doctors.length})`}
            </Text>
            {query ? (
              <Pressable onPress={() => setQuery("")}>
                <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "700" }}>مسح ✕</Text>
              </Pressable>
            ) : null}
          </View>

          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: "#94a3b8", fontWeight: "700", marginTop: 10, fontSize: 13 }}>جاري تحميل الأطباء...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9" }}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "center" }}>لا توجد نتائج</Text>
              <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "600", textAlign: "center", marginTop: 4 }}>
                جرب تخصصاً أو مدينة مختلفة
              </Text>
              <Pressable
                onPress={() => setQuery("")}
                style={{ backgroundColor: "#0f172a", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 14 }}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>عرض كل الأطباء</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filtered.slice(0, 20).map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onPress={() => router.push(`/doctor/${doctor.id}` as any)}
                  onWhatsApp={() => {
                    const phone = (doctor.whatsapp || doctor.phone || "").replace(/[^0-9]/g, "");
                    if (phone) Linking.openURL(`https://wa.me/${phone}`);
                  }}
                />
              ))}
              {filtered.length > 20 && (
                <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" }}>
                  <Text style={{ color: "#64748b", fontWeight: "700", fontSize: 13 }}>
                    عرض أول 20 طبيب من أصل {filtered.length}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ===== TRUST FOOTER ===== */}
        <View style={{ backgroundColor: "#0f172a", borderRadius: 24, padding: 24, gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff", textAlign: "right" }}>
            لماذا ملامح؟
          </Text>
          {[
            { emoji: "✅", title: "أطباء موثقون", desc: "كل طبيب مراجع ومتحقق منه قبل نشر ملفه." },
            { emoji: "💬", title: "تواصل مباشر", desc: "واتساب وهاتف بنقرة واحدة." },
            { emoji: "🏷️", title: "عروض وخصومات", desc: "احصل على أفضل الأسعار من العيادات المشاركة." },
          ].map((point) => (
            <View key={point.title} style={{ flexDirection: "row-reverse", gap: 12, alignItems: "flex-start" }}>
              <Text style={{ fontSize: 20 }}>{point.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "900", color: "#fff", textAlign: "right" }}>{point.title}</Text>
                <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "right", marginTop: 2 }}>{point.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

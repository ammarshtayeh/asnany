import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Doctor, Offer } from "../../types";
import { formatSpecialty } from "../../lib/format";
import { theme } from "../../constants/theme";
import {
  AssistantPromoCard,
  CategoryPill,
  DoctorListCard,
  EmptyState,
  MalamihLogo,
  QuickActionTile,
  SearchField,
  SectionHeader,
  SurfaceCard,
} from "../../components/ui/premium";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80";

const QUICK_CATEGORIES = [
  { label: "أسنان", query: "أسنان", icon: "shield" as const, color: theme.teal, bg: theme.tealMuted },
  { label: "جلدية", query: "جلدية", icon: "activity" as const, color: theme.pink, bg: theme.pinkMuted },
  { label: "تجميل", query: "تجميل", icon: "star" as const, color: theme.purple, bg: theme.purpleMuted },
  { label: "عيون", query: "عيون", icon: "eye" as const, color: theme.tealLight, bg: theme.tealMuted },
  { label: "أنف وأذن", query: "أنف وأذن وحنجرة", icon: "volume-2" as const, color: theme.goldLight, bg: theme.goldMuted },
];

const HOME_ACTIONS = [
  { label: "احجز الآن", desc: "موعد سريع", path: "/booking", icon: "calendar" as const, color: theme.teal, bg: theme.tealMuted },
  { label: "بطاقة الخصم", desc: "خصومات حصرية", path: "/discount-card", icon: "credit-card" as const, color: theme.purple, bg: theme.purpleMuted },
  { label: "العروض", desc: "أحدث الخصومات", path: "/(tabs)/offers", icon: "tag" as const, color: theme.goldLight, bg: theme.goldMuted },
  { label: "انضم للمنصة", desc: "للأطباء", path: "/join", icon: "user-plus" as const, color: theme.tealLight, bg: theme.tealMuted },
];

const DIAGNOSIS_OPTIONS = [
  { id: "pain", title: "ألم شديد بالأسنان", specialty: "طب أسنان عام", icon: "shield" as const },
  { id: "align", title: "تشوش أو ضعف نظر", specialty: "طب وجراحة العيون", icon: "eye" as const },
  { id: "missing", title: "مشاكل بشرة وتساقط شعر", specialty: "جلدية وتجميل", icon: "activity" as const },
  { id: "kids", title: "تجميل أو حقن فيلر وبوتوكس", specialty: "جراحة التجميل والترميم", icon: "star" as const },
];

export default function HomeScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [latestOffers, setLatestOffers] = useState<Offer[]>([]);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
    void loadData();
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
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) =>
      [d.name, d.city, d.area, d.bio, d.category, ...(d.specialty || [])].some((v) =>
        String(v || "").toLowerCase().includes(q),
      ),
    );
  }, [doctors, query]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ height: 300, opacity: heroOpacity, transform: [{ translateY: heroSlide }] }}>
          <Image source={{ uri: HERO_IMAGE }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,22,40,0.72)" }} />

          <View style={{ position: "absolute", top: 10, left: 16, right: 16, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
            <MalamihLogo size="sm" />
            <Pressable
              onPress={() => router.push("/discount-card" as any)}
              style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Feather name="credit-card" size={14} color={theme.gold} />
              <Text style={{ color: theme.white, fontWeight: "900", fontSize: 11 }}>بطاقة الخصم</Text>
            </Pressable>
          </View>

          <View style={{ position: "absolute", bottom: 20, left: 16, right: 16 }}>
            <View style={{ alignSelf: "flex-end", backgroundColor: "rgba(212,175,55,0.15)", borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 }}>
              <Text style={{ color: "#fde68a", fontWeight: "900", fontSize: 11 }}>الأول من نوعه في فلسطين</Text>
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: theme.white, textAlign: "right", lineHeight: 36 }}>
              كل ما تحتاجه لصحتك وجمالك
            </Text>
            <Text style={{ fontSize: 26, fontWeight: "900", color: theme.gold, textAlign: "right", lineHeight: 36 }}>
              في متناول يدك
            </Text>
            <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 12 }}>
              {["أطباء موثقون", "حجز مباشر", "عروض حصرية"].map((tag) => (
                <View key={tag} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                  <Text style={{ color: "#e2e8f0", fontSize: 10, fontWeight: "800" }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={{ marginHorizontal: 16, marginTop: -22, zIndex: 10 }}>
          <SearchField value={query} onChangeText={setQuery} placeholder="ابحث عن طبيب، تخصص، أو مدينة..." />
        </View>

        <Animated.View style={{ padding: 16, gap: 28, opacity: contentOpacity, transform: [{ translateY: contentSlide }] }}>
          <AssistantPromoCard onPress={() => {}} />

          <View>
            <SectionHeader title="ابحث حسب التخصص" icon="layers" />
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
              {QUICK_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat.label}
                  label={cat.label}
                  icon={cat.icon}
                  color={cat.color}
                  bg={cat.bg}
                  active={query === cat.query}
                  onPress={() => setQuery(query === cat.query ? "" : cat.query)}
                />
              ))}
            </View>
          </View>

          <View>
            <SectionHeader title="اختصارات سريعة" icon="zap" />
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 }}>
              {HOME_ACTIONS.map((action) => (
                <QuickActionTile
                  key={action.path}
                  label={action.label}
                  desc={action.desc}
                  icon={action.icon}
                  color={action.color}
                  bg={action.bg}
                  onPress={() => router.push(action.path as any)}
                />
              ))}
            </View>
          </View>

          {latestOffers.length > 0 ? (
            <View>
              <SectionHeader title="أحدث العروض" icon="tag" actionLabel="عرض الكل" onAction={() => router.push("/(tabs)/offers" as any)} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, flexDirection: "row-reverse" }}>
                {latestOffers.map((offer) => {
                  const discount = offer.discount_percentage ?? offer.discount_pct ?? 0;
                  return (
                    <Pressable
                      key={offer.id}
                      onPress={() => offer.doctor_id && router.push(`/doctors/${offer.doctor_id}` as any)}
                      style={{ width: 230, borderRadius: 20, overflow: "hidden", backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderLight, ...theme.shadow.card }}
                    >
                      <View style={{ height: 120, backgroundColor: theme.navy }}>
                        <Image source={{ uri: HERO_IMAGE }} style={{ width: "100%", height: "100%", opacity: 0.6 }} resizeMode="cover" />
                        {discount > 0 ? (
                          <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "#dc2626", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                            <Text style={{ color: theme.white, fontWeight: "900", fontSize: 13 }}>{discount}%</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={{ padding: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: "900", color: theme.text, textAlign: "right" }} numberOfLines={2}>
                          {offer.title}
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: "700", textAlign: "right", marginTop: 4 }}>
                          {offer.doctor_name || "عرض طبي"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View>
            <SectionHeader title="ما الذي يزعجك؟" subtitle="اختر مشكلتك وسنعرض الأطباء المناسبين" icon="activity" />
            <View style={{ gap: 8 }}>
              {DIAGNOSIS_OPTIONS.map((opt) => (
                <Pressable key={opt.id} onPress={() => setQuery(opt.specialty)}>
                  <SurfaceCard style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12, padding: 14 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
                      <Feather name={opt.icon} size={18} color={theme.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "900", color: theme.text, textAlign: "right" }}>{opt.title}</Text>
                      <Text style={{ fontSize: 11, color: theme.teal, fontWeight: "800", textAlign: "right", marginTop: 2 }}>{opt.specialty}</Text>
                    </View>
                    <Feather name="chevron-left" size={18} color={theme.textSoft} />
                  </SurfaceCard>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <SectionHeader
              title={query ? `نتائج البحث (${filtered.length})` : `الأطباء (${doctors.length})`}
              icon="users"
              actionLabel={query ? "مسح" : undefined}
              onAction={query ? () => setQuery("") : undefined}
            />

            {loading ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.teal} />
                <Text style={{ color: theme.textSoft, fontWeight: "700", marginTop: 10 }}>جاري تحميل الأطباء...</Text>
              </View>
            ) : filtered.length === 0 ? (
              <EmptyState icon="search" title="لا توجد نتائج" description="جرّب تخصصاً أو مدينة مختلفة" actionLabel="عرض كل الأطباء" onAction={() => setQuery("")} />
            ) : (
              <View style={{ gap: 12 }}>
                {filtered.slice(0, 20).map((doctor) => (
                  <DoctorListCard
                    key={doctor.id}
                    name={doctor.name}
                    specialty={formatSpecialty(doctor.specialty)}
                    city={doctor.city}
                    area={doctor.area}
                    imageUrl={doctor.image_url}
                    rating={doctor.rating}
                    verified={doctor.verified}
                    featured={doctor.is_featured}
                    onPress={() => router.push(`/doctors/${doctor.id}` as any)}
                    onWhatsApp={
                      doctor.whatsapp || doctor.phone
                        ? () => {
                            const phone = (doctor.whatsapp || doctor.phone || "").replace(/[^0-9]/g, "");
                            if (phone) void Linking.openURL(`https://wa.me/${phone}`);
                          }
                        : undefined
                    }
                  />
                ))}
              </View>
            )}
          </View>

          <View style={{ backgroundColor: theme.navy, borderRadius: 24, padding: 22, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.white, textAlign: "right" }}>لماذا ملامح؟</Text>
            {[
              { icon: "check-circle" as const, title: "أطباء موثقون", desc: "كل طبيب مراجع ومتحقق منه قبل نشر ملفه." },
              { icon: "message-circle" as const, title: "تواصل مباشر", desc: "واتساب وهاتف بنقرة واحدة." },
              { icon: "tag" as const, title: "عروض وخصومات", desc: "احصل على أفضل الأسعار من العيادات المشاركة." },
            ].map((point) => (
              <View key={point.title} style={{ flexDirection: "row-reverse", gap: 12, alignItems: "flex-start" }}>
                <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center" }}>
                  <Feather name={point.icon} size={16} color={theme.tealLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "900", color: theme.white, textAlign: "right" }}>{point.title}</Text>
                  <Text style={{ fontSize: 12, color: "#94a3b8", fontWeight: "600", textAlign: "right", marginTop: 2 }}>{point.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";
import { formatSpecialty } from "../../lib/format";
import { Doctor } from "../../types";
import { apiFetch } from "../../lib/api";
import { theme } from "../../constants/theme";
import { getDistance, formatDistanceKm } from "../../lib/distance";
import { doctorMapCoordinates } from "../../lib/map-links";
import { cityMatchesFilter } from "../../lib/city-match";
import { EmptyStateCTA } from "../../components/EmptyStateCTA";
import {
  DoctorListCard,
  EmptyState,
  FilterChip,
  ScreenHero,
  SearchField,
  SectionHeader,
} from "../../components/ui/premium";

type Advertisement = {
  id: string;
  title?: string;
  image_url?: string;
  display_priority?: number;
};

const CITIES = ["الكل", "رام الله", "نابلس", "الخليل", "بيت لحم", "جنين", "غزة", "القدس", "طولكرم"];

export default function DoctorsTabScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("الكل");
  const [sortNearest, setSortNearest] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!sortNearest) return;
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setSortNearest(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
  }, [sortNearest]);

  async function load() {
    setLoading(true);
    try {
      const doctorsPromise = supabase
        ? supabase.from("doctors").select("*").eq("verified", true).order("rating", { ascending: false })
        : Promise.resolve({ data: [] as Doctor[] });
      const adsPromise = apiFetch<{ items?: Advertisement[] } | Advertisement[]>("/api/advertisements");

      const [doctorsRes, adsRes] = await Promise.all([doctorsPromise, adsPromise]);
      const doctorRows = "data" in doctorsRes ? (doctorsRes.data as Doctor[] | null) || [] : [];
      setDoctors(doctorRows);

      const adsData = adsRes.data as { items?: Advertisement[] } | Advertisement[] | null;
      const adRows = Array.isArray(adsData) ? adsData : Array.isArray(adsData?.items) ? adsData.items : [];
      setAds([...adRows].sort((a, b) => (b.display_priority || 0) - (a.display_priority || 0)));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = doctors.filter((doctor) => {
      const cityOk = cityMatchesFilter(doctor.city, city) || cityMatchesFilter(doctor.area, city);
      const text = `${doctor.name} ${formatSpecialty(doctor.specialty)} ${doctor.city || ""}`.toLowerCase();
      return cityOk && (!needle || text.includes(needle));
    });

    if (!sortNearest || !userCoords) return rows;

    return [...rows].sort((a, b) => {
      const aCoords = doctorMapCoordinates(a);
      const bCoords = doctorMapCoordinates(b);
      const aDist = getDistance(userCoords.lat, userCoords.lng, aCoords.latitude, aCoords.longitude);
      const bDist = getDistance(userCoords.lat, userCoords.lng, bCoords.latitude, bCoords.longitude);
      return aDist - bDist;
    });
  }, [city, doctors, query, sortNearest, userCoords]);

  const distanceByDoctorId = useMemo(() => {
    if (!userCoords) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const doctor of filtered) {
      const coords = doctorMapCoordinates(doctor);
      const km = getDistance(userCoords.lat, userCoords.lng, coords.latitude, coords.longitude);
      map.set(doctor.id, formatDistanceKm(km));
    }
    return map;
  }, [filtered, userCoords]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        paddingTop={12}
        badge="دليل موثّق"
        title="دليل الأطباء"
        subtitle="ابحث، قارن، واحجز من أفضل الأخصائيين في فلسطين"
      >
        <View style={{ flexDirection: "row-reverse", gap: 10, marginTop: 18 }}>
          {[
            { value: String(doctors.length), label: "طبيب" },
            { value: String(ads.length), label: "إعلان" },
            { value: "موثق", label: "التحقق" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 14,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <Text style={{ color: theme.white, fontWeight: "900", fontSize: 16 }}>{stat.value}</Text>
              <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 10, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </ScreenHero>

      <View style={{ paddingHorizontal: 16, marginTop: -20 }}>
        {ads.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, flexDirection: "row-reverse", marginBottom: 16 }}>
            {ads.slice(0, 6).map((ad) => (
              <View
                key={ad.id}
                style={{
                  width: 240,
                  height: 120,
                  borderRadius: 20,
                  overflow: "hidden",
                  backgroundColor: theme.navy,
                  justifyContent: "flex-end",
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.2)",
                }}
              >
                {ad.image_url ? (
                  <Image source={{ uri: ad.image_url }} style={{ position: "absolute", inset: 0, opacity: 0.35 }} resizeMode="cover" />
                ) : null}
                <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,22,40,0.55)" }} />
                <Text style={{ color: theme.white, fontWeight: "900", fontSize: 13, textAlign: "right" }} numberOfLines={2}>
                  {ad.title || "إعلان مميز"}
                </Text>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <Feather name="award" size={10} color={theme.gold} />
                  <Text style={{ color: theme.gold, fontSize: 10, fontWeight: "800" }}>باقة مميزة</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث بالاسم أو التخصص..."
          style={{ marginBottom: 12 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse", marginBottom: 8 }}>
          {CITIES.map((item) => (
            <FilterChip key={item} label={item} active={city === item} onPress={() => setCity(item)} />
          ))}
        </ScrollView>

        <Pressable
          onPress={() => setSortNearest((v) => !v)}
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
            gap: 8,
            alignSelf: "flex-end",
            marginBottom: 12,
            backgroundColor: sortNearest ? theme.tealMuted : theme.card,
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: sortNearest ? theme.teal : theme.border,
          }}
        >
          <Feather name="navigation" size={14} color={sortNearest ? theme.teal : theme.textSoft} />
          <Text style={{ fontSize: 12, fontWeight: "900", color: sortNearest ? theme.teal : theme.textSoft }}>
            {sortNearest ? "الأقرب إليك" : "ترتيب حسب القرب"}
          </Text>
        </Pressable>

        <SectionHeader title={`النتائج (${filtered.length})`} icon="users" />

        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.teal} />
            <Text style={{ color: theme.textSoft, fontWeight: "700", marginTop: 12 }}>جاري التحميل...</Text>
          </View>
        ) : doctors.length === 0 ? (
          <EmptyStateCTA
            icon="users"
            title="لا يوجد أطباء موثّقون بعد"
            description="كن من أوائل الأطباء على ملامح.ps واحصل على ظهور مميز في الدليل."
            primaryLabel="سجّل عيادتك"
            secondaryHref="/advertise"
            secondaryLabel="اعرف المزيد"
            tips={["مجاني للمؤسسين", "حجز إلكتروني", "ظهور على الخريطة"]}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search" title="لا توجد نتائج" description="جرّب مدينة أو تخصصاً مختلفاً" actionLabel="مسح البحث" onAction={() => { setQuery(""); setCity("الكل"); }} />
        ) : (
          <View style={{ gap: 12 }}>
            {filtered.map((doctor) => (
              <DoctorListCard
                key={doctor.id}
                name={doctor.name}
                specialty={formatSpecialty(doctor.specialty)}
                city={doctor.city}
                area={doctor.area}
                imageUrl={doctor.image_url}
                rating={doctor.rating}
                verified={doctor.verified}
                distanceLabel={distanceByDoctorId.get(doctor.id)}
                onPress={() => router.push(`/doctors/${doctor.id}`)}
                onWhatsApp={doctor.whatsapp ? () => Linking.openURL(`https://wa.me/${doctor.whatsapp!.replace(/[^0-9]/g, "")}`) : undefined}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

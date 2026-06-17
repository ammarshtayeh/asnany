import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { formatSpecialty } from "../../lib/format";
import { Doctor } from "../../types";
import { apiFetch } from "../../lib/api";
import { theme } from "../../constants/theme";
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

const CITIES = ["الكل", "رام الله", "نابلس", "الخليل", "بيت لحم", "غزة"];

export default function DoctorsTabScreen() {
  const insets = useSafeAreaInsets();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("الكل");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const doctorsPromise = supabase
        ? supabase.from("doctors").select("*").eq("verified", true).order("is_featured", { ascending: false })
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
    return doctors.filter((doctor) => {
      const cityOk = city === "الكل" || doctor.city === city;
      const text = `${doctor.name} ${formatSpecialty(doctor.specialty)} ${doctor.city || ""}`.toLowerCase();
      return cityOk && (!needle || text.includes(needle));
    });
  }, [city, doctors, query]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHero
        paddingTop={insets.top + 12}
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

        <SectionHeader title={`النتائج (${filtered.length})`} icon="users" />

        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: "center" }}>
            <ActivityIndicator size="large" color={theme.teal} />
            <Text style={{ color: theme.textSoft, fontWeight: "700", marginTop: 12 }}>جاري التحميل...</Text>
          </View>
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
                featured={doctor.is_featured}
                onPress={() => router.push(`/doctors/${doctor.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

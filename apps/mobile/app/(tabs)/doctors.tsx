import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View, Text } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { formatSpecialty } from "../../lib/format";
import { Doctor } from "../../types";
import { apiFetch } from "../../lib/api";

type Advertisement = {
  id: string;
  title?: string;
  image_url?: string;
  display_priority?: number;
};

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

      const adsData = adsRes.data as any;
      const adRows = Array.isArray(adsData) ? adsData : Array.isArray(adsData?.items) ? adsData.items : [];
      setAds(
        [...adRows].sort(
          (a: Advertisement, b: Advertisement) => (b.display_priority || 0) - (a.display_priority || 0),
        ),
      );
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
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>دليل الأطباء</Text>
      <Text style={{ marginTop: 4, color: "#64748b", fontWeight: "700", textAlign: "right" }}>ابحث واحجز من أفضل الأخصائيين في فلسطين</Text>

      {ads.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 10, flexDirection: "row-reverse" }}>
          {ads.slice(0, 6).map((ad) => (
            <View key={ad.id} style={{ width: 220, height: 110, borderRadius: 18, overflow: "hidden", backgroundColor: "#0f172a", justifyContent: "flex-end", padding: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13, textAlign: "right" }} numberOfLines={2}>
                {ad.title || "إعلان مميز"}
              </Text>
              <Text style={{ color: "#fde68a", fontSize: 10, fontWeight: "900", textAlign: "right", marginTop: 4 }}>إعلان مرتب حسب الباقة</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="ابحث بالاسم أو التخصص..."
        placeholderTextColor="#94a3b8"
        style={{
          marginTop: 16,
          minHeight: 50,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#fff",
          paddingHorizontal: 14,
          textAlign: "right",
          fontWeight: "700",
        }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12, flexDirection: "row-reverse" }}>
        {["الكل", "رام الله", "نابلس", "الخليل", "بيت لحم", "غزة"].map((item) => (
          <Pressable
            key={item}
            onPress={() => setCity(item)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: city === item ? "#0f172a" : "#fff",
              borderWidth: 1,
              borderColor: city === item ? "#0f172a" : "#e2e8f0",
            }}
          >
            <Text style={{ color: city === item ? "#fff" : "#334155", fontWeight: "900", fontSize: 12 }}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#0f172a" style={{ marginTop: 40 }} />
      ) : (
        <View style={{ gap: 12, marginTop: 16 }}>
          {filtered.map((doctor) => (
            <Pressable
              key={doctor.id}
              onPress={() => router.push(`/doctors/${doctor.id}`)}
              style={{ backgroundColor: "#fff", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "#f1f5f9" }}
            >
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={{ fontSize: 17, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{doctor.name}</Text>
                  <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "800", color: "#10b981", textAlign: "right" }}>{formatSpecialty(doctor.specialty)}</Text>
                  <Text style={{ marginTop: 2, fontSize: 11, fontWeight: "700", color: "#64748b", textAlign: "right" }}>
                    {doctor.city}
                    {doctor.area ? ` · ${doctor.area}` : ""}
                  </Text>
                </View>
                {doctor.is_featured ? (
                  <View style={{ backgroundColor: "#fef3c7", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: "#b45309", fontSize: 10, fontWeight: "900" }}>مميز</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
          {!filtered.length ? <Text style={{ textAlign: "center", color: "#64748b", fontWeight: "800", marginTop: 24 }}>لا توجد نتائج</Text> : null}
        </View>
      )}
    </ScrollView>
  );
}

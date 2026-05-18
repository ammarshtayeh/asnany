import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Image, 
  Dimensions,
  Platform
} from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

interface Doctor {
  id: string;
  name: string;
  specialty: string[];
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  bio: string;
  lat: number;
  lng: number;
  image_url: string;
  clinic_photos: string[];
  insurance_list: string[];
  working_hours: any;
  verified: boolean;
  is_featured: boolean;
  rating: number;
  accepts_insurance: boolean;
}

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

const CITIES = ["الكل", "رام الله", "نابلس", "الخليل", "جنين", "بيت لحم", "طولكرم", "قلقيلية", "أريحا", "غزة"];
const SPECIALTIES = ["الكل", "زراعة الأسنان", "تقويم الأسنان", "تجميل الأسنان", "علاج العصب", "أسنان الأطفال", "طب أسنان عام"];

export default function HomeScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        setLoading(false);
        return;
      }

      // Fetch Verified Doctors
      const { data: doctorsData, error: docError } = await supabase
        .from("doctors")
        .select("*")
        .eq("verified", true);

      if (docError) throw docError;
      setDoctors(doctorsData || []);

      // Fetch Active Advertisements
      const today = new Date().toISOString().split("T")[0];
      const { data: adsData, error: adsError } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .gte("end_date", today);

      if (!adsError) {
        setAds(adsData || []);
      }
    } catch (err) {
      console.error("Error fetching mobile data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Local working hours active check
  function isDoctorOpenNow(workingHours: any): boolean {
    if (!workingHours) return false;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Hebron",
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const weekdayPart = parts.find(p => p.type === "weekday")?.value;
      const hourPart = parts.find(p => p.type === "hour")?.value;
      const minutePart = parts.find(p => p.type === "minute")?.value;

      if (!weekdayPart || !hourPart || !minutePart) return false;

      const currentHour = parseInt(hourPart, 10);
      const currentMinute = parseInt(minutePart, 10);
      const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

      const dayMapping: { [key: string]: string } = {
        "Saturday": "السبت",
        "Sunday": "الأحد",
        "Monday": "الإثنين",
        "Tuesday": "الثلاثاء",
        "Wednesday": "الأربعاء",
        "Thursday": "الخميس",
        "Friday": "الجمعة"
      };

      const arabicDay = dayMapping[weekdayPart];
      if (!arabicDay) return false;

      const timeRange = workingHours[arabicDay];
      if (!timeRange || timeRange === "مغلق") return false;

      const cleanRange = timeRange.replace(/\s+/g, "");
      const times = cleanRange.split("-");
      if (times.length !== 2) return false;

      const parseTime = (timeStr: string): number | null => {
        const isPm = timeStr.includes("م");
        const isAm = timeStr.includes("ص");
        const cleanTime = timeStr.replace(/[صم]/g, "");
        const parts = cleanTime.split(":");
        if (parts.length !== 2) return null;
        let hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);

        if (isPm && hour < 12) hour += 12;
        if (isAm && hour === 12) hour = 0;

        return hour * 60 + minute;
      };

      const startTime = parseTime(times[0]);
      const endTime = parseTime(times[1]);

      if (startTime === null || endTime === null) return false;

      if (startTime <= endTime) {
        return currentMinutesSinceMidnight >= startTime && currentMinutesSinceMidnight <= endTime;
      } else {
        return currentMinutesSinceMidnight >= startTime || currentMinutesSinceMidnight <= endTime;
      }
    } catch (err) {
      console.error("isDoctorOpenNow mobile error:", err);
      return false;
    }
  }

  // Filtered Doctors list
  const filteredDoctors = doctors.filter((doc) => {
    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.trim().toLowerCase();
      const matchName = doc.name.toLowerCase().includes(query);
      const matchBio = doc.bio && doc.bio.toLowerCase().includes(query);
      const matchArea = doc.area && doc.area.toLowerCase().includes(query);
      if (!matchName && !matchBio && !matchArea) return false;
    }

    // 2. City Filter
    if (selectedCity !== "الكل" && doc.city !== selectedCity) return false;

    // 3. Specialty Filter
    if (selectedSpecialty !== "الكل") {
      const matchSpecialty = doc.specialty && doc.specialty.some(s => s.includes(selectedSpecialty));
      if (!matchSpecialty) return false;
    }

    // 4. Open Now Filter
    if (filterOpenNow && !isDoctorOpenNow(doc.working_hours)) return false;

    return true;
  });

  return (
    <ScrollView contentContainerStyle={styles.page} dir="rtl">
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>أسناني.ps</Text>
        <Text style={styles.title}>دليلك الطبي الذكي للأسنان</Text>
        <Text style={styles.subtitle}>ابحث عن أفضل عيادات الأسنان في فلسطين وتواصل معها مباشرة</Text>
      </View>

      {/* Active Advertisements Banner */}
      {ads.length > 0 && (
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.adsContainer}
        >
          {ads.map((ad) => (
            <View key={ad.id} style={styles.adSlide}>
              <Image 
                source={{ uri: ad.image_url || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80" }} 
                style={styles.adImage} 
              />
              <View style={styles.adOverlay}>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <Text style={styles.adBadge}>⭐ عرض خاص</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Unified Premium Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="🔎 ابحث عن طبيب بالاسم، المنطقة أو السيرة المهنية..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          textAlign="right"
        />

        {/* City Filter Picker Buttons */}
        <Text style={styles.sectionLabel}>📍 اختر المدينة:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {CITIES.map((c) => {
            const isSelected = selectedCity === c;
            return (
              <Pressable 
                key={c} 
                onPress={() => setSelectedCity(c)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Specialty Filter Picker Buttons */}
        <Text style={styles.sectionLabel}>🦷 اختر التخصص:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SPECIALTIES.map((s) => {
            const isSelected = selectedSpecialty === s;
            return (
              <Pressable 
                key={s} 
                onPress={() => setSelectedSpecialty(s)}
                style={[styles.chip, isSelected && styles.chipActiveSecondary]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Live Open Now Filter Switch */}
        <Pressable 
          onPress={() => setFilterOpenNow(!filterOpenNow)}
          style={[styles.openFilterRow, filterOpenNow && styles.openFilterRowActive]}
        >
          <View style={[styles.dot, { backgroundColor: filterOpenNow ? "#10b981" : "#94a3b8" }]} />
          <Text style={[styles.openFilterText, filterOpenNow && styles.openFilterTextActive]}>
            {filterOpenNow ? "عرض العيادات المفتوحة الآن فقط ✅" : "عرض العيادات المفتوحة الآن"}
          </Text>
        </Pressable>
      </View>

      {/* Doctors List Output */}
      <View style={styles.listContainer}>
        <Text style={styles.resultsCount}>
          🎯 تم العثور على ({filteredDoctors.length}) طبيب أسنان معتمد
        </Text>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0e766e" />
            <Text style={styles.loaderText}>جاري جلب أطباء فلسطين المعتمدين...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>🦷 لا توجد نتائج مطابقة لفلترتك</Text>
            <Text style={styles.emptyDesc}>الرجاء تجربة فلترة مدينة أخرى أو إزالة فلتر الوقت لرؤية كافة العيادات.</Text>
          </View>
        ) : (
          <View style={styles.stack}>
            {filteredDoctors.map((doc) => {
              const isOpen = isDoctorOpenNow(doc.working_hours);
              return (
                <Link href={`/doctor/${doc.id}`} asChild key={doc.id}>
                  <Pressable style={styles.card}>
                    {/* Top Row: Avatar & Badges */}
                    <View style={styles.cardHeader}>
                      <Image 
                        source={{ uri: doc.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80" }} 
                        style={styles.avatar} 
                      />
                      <View style={styles.headerInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.cardTitle}>{doc.name}</Text>
                          {doc.verified && <Text style={styles.verifiedBadge}>✔ موثق</Text>}
                        </View>
                        
                        <View style={styles.specialtyRow}>
                          {doc.specialty && doc.specialty.map((spec, i) => (
                            <Text key={i} style={styles.specialtyText}>{spec}</Text>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Middle Row: Location & Insurances */}
                    <View style={styles.cardDetails}>
                      <Text style={styles.detailText}>📍 {doc.city} — {doc.area || "العنوان الرئيسي"}</Text>
                      
                      {doc.accepts_insurance && doc.insurance_list && doc.insurance_list.length > 0 && (
                        <View style={styles.insuranceRow}>
                          <Text style={styles.insuranceTitle}>🛡️ يقبل تأمين:</Text>
                          {doc.insurance_list.map((ins, i) => (
                            <Text key={i} style={styles.insuranceBadge}>{ins}</Text>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Bottom Row: Rating & Open Status */}
                    <View style={styles.cardFooter}>
                      {/* Open Badge */}
                      <View style={[styles.statusBadge, isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
                        <View style={[styles.pulseDot, { backgroundColor: isOpen ? "#10b981" : "#64748b" }]} />
                        <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                          {isOpen ? "مفتوح الآن" : "مغلق حالياً"}
                        </Text>
                      </View>

                      {/* Stars */}
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>⭐ {doc.rating || 5.0}</Text>
                      </View>
                    </View>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    gap: 16,
    backgroundColor: "#f8fafc",
    paddingBottom: 40
  },
  header: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 24,
    gap: 8,
    alignItems: "flex-end",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0d9488",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "right"
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#cbd5e1",
    textAlign: "right",
    fontWeight: "500"
  },
  adsContainer: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  adSlide: {
    width: width - 32,
    height: 160,
    position: "relative"
  },
  adImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  adOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    padding: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  adTitle: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14
  },
  adBadge: {
    backgroundColor: "#e11d48",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  searchBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  searchInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    marginTop: 4,
    textAlign: "right"
  },
  chipRow: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingVertical: 4
  },
  chip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  chipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a"
  },
  chipActiveSecondary: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488"
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  openFilterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
    marginTop: 4
  },
  openFilterRowActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0"
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  openFilterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569"
  },
  openFilterTextActive: {
    color: "#065f46"
  },
  listContainer: {
    gap: 12
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
    textAlign: "right",
    paddingRight: 4
  },
  loaderContainer: {
    padding: 40,
    gap: 12,
    alignItems: "center"
  },
  loaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b"
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#334155"
  },
  emptyDesc: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500"
  },
  stack: {
    gap: 14
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3
  },
  cardHeader: {
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "center"
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#f1f5f9"
  },
  headerInfo: {
    flex: 1,
    gap: 4
  },
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a"
  },
  verifiedBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: "#10b981",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  specialtyRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0d9488",
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  cardDetails: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingVertical: 10,
    gap: 8
  },
  detailText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textAlign: "right"
  },
  insuranceRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center"
  },
  insuranceTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b"
  },
  insuranceBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  cardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusBadgeOpen: {
    backgroundColor: "#ecfdf5"
  },
  statusBadgeClosed: {
    backgroundColor: "#f1f5f9"
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900"
  },
  statusTextOpen: {
    color: "#047857"
  },
  statusTextClosed: {
    color: "#475569"
  },
  ratingBadge: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#fde68a"
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309"
  }
});

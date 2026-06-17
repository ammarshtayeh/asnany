import React from "react";
import { Link } from "expo-router";
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Image, 
  Dimensions, 
  ScrollView 
} from "react-native";
import { Doctor, Advertisement } from "../types";

const { width } = Dimensions.get("window");

const CITIES = ["الكل", "رام الله", "نابلس", "الخليل", "جنين", "بيت Bethlehem", "طولكرم", "قلقيلية", "أريحا", "غزة"];
const CITIES_AR = ["الكل", "رام الله", "نابلس", "الخليل", "جنين", "بيت لحم", "طولكرم", "قلقيلية", "أريحا", "غزة"];
const SPECIALTIES = ["الكل", "زراعة الأسنان", "تقويم الأسنان", "تجميل الأسنان", "علاج العصب", "أسنان الأطفال", "طب أسنان عام"];

interface DoctorsTabProps {
  doctors: Doctor[];
  ads: Advertisement[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (s: string) => void;
  filterOpenNow: boolean;
  setFilterOpenNow: (open: boolean) => void;
  isDoctorOpenNow: (workingHours: any) => boolean;
}

export default function DoctorsTab({
  doctors,
  ads,
  loading,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedSpecialty,
  setSelectedSpecialty,
  filterOpenNow,
  setFilterOpenNow,
  isDoctorOpenNow
}: DoctorsTabProps) {

  // Local helper for clean city rendering
  const mapCityText = (c: string) => {
    if (c === "بيت Bethlehem") return "بيت لحم";
    return c;
  };

  return (
    <View style={styles.tabContent}>
      {/* Active Ads Premium Slider */}
      {ads.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.adsContainer}>
          {ads.map((ad) => (
            <View key={ad.id} style={styles.adSlide}>
              <Image 
                source={{ uri: ad.image_url || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80" }} 
                style={styles.adImage as any} 
              />
              <View style={styles.adOverlay}>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <Text style={styles.adBadge}>🔥 إعلان مميز</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Premium Filter Box */}
      <View style={styles.filterBox}>
        <TextInput
          placeholder="🔎 ابحث عن طبيب، منطقة، أو عيادة..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          textAlign="right"
        />
        
        <Text style={styles.sectionLabel}>📍 اختر المدينة الفلسطينية:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {CITIES_AR.map((c) => {
            const val = c === "بيت لحم" ? "بيت Bethlehem" : c;
            const isSelected = selectedCity === val || (selectedCity === "الكل" && c === "الكل");
            return (
              <Pressable key={c} onPress={() => setSelectedCity(val)} style={[styles.chip, isSelected && styles.chipActive]}>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>🦷 اختر تخصص طب الأسنان:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SPECIALTIES.map((s) => {
            const isSelected = selectedSpecialty === s;
            return (
              <Pressable key={s} onPress={() => setSelectedSpecialty(s)} style={[styles.chip, isSelected && styles.chipActiveSecondary]}>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable onPress={() => setFilterOpenNow(!filterOpenNow)} style={[styles.openFilterRow, filterOpenNow && styles.openFilterRowActive]}>
          <View style={[styles.dot, { backgroundColor: filterOpenNow ? "#10b981" : "#64748b" }]} />
          <Text style={[styles.openFilterText, filterOpenNow && styles.openFilterTextActive]}>
            {filterOpenNow ? "عرض العيادات المفتوحة حالياً فقط ✅" : "إظهار العيادات المفتوحة الآن فقط"}
          </Text>
        </Pressable>
      </View>

      {/* Doctors Output Stack */}
      <Text style={styles.resultsCount}>🎯 تم العثور على ({doctors.length}) طبيب معتمد في فلسطين</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0d9488" style={{ marginVertical: 40 }} />
      ) : doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>لا توجد نتائج مطابقة لبحثك</Text>
          <Text style={styles.emptyDesc}>تأكد من ضبط فلاتر البحث والمدينة لرؤية الأطباء المعتمدين.</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {doctors.map((doc) => {
            const isOpen = isDoctorOpenNow(doc.working_hours);
            return (
              <Link href={`/doctors/${doc.id}`} asChild key={doc.id}>
                <Pressable style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Image source={{ uri: doc.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80" }} style={styles.avatar as any} />
                    <View style={styles.headerInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.cardTitle}>{doc.name}</Text>
                        {doc.verified && <Text style={styles.verifiedBadge}>✔ موثق</Text>}
                      </View>
                      <View style={styles.specialtyRow}>
                        {doc.specialty && doc.specialty.map((s, i) => (
                          <View key={i} style={styles.specialtyText as any}>
                            <Text style={{ color: "#0d9488", fontSize: 10, fontWeight: "800" }}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={styles.detailText}>📍 المقر: {mapCityText(doc.city)} — {doc.area || "العنوان الرئيسي"}</Text>
                    {doc.accepts_insurance && doc.insurance_list && doc.insurance_list.length > 0 && (
                      <View style={styles.insuranceRow}>
                        <Text style={styles.insuranceTitle}>🛡️ التأمين المقبول:</Text>
                        {doc.insurance_list.map((ins, i) => (
                          <View key={i} style={styles.insuranceBadge as any}>
                            <Text style={{ color: "#0284c7", fontSize: 10, fontWeight: "800" }}>{ins}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
                      <View style={[styles.pulseDot, { backgroundColor: isOpen ? "#10b981" : "#64748b" }]} />
                      <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>{isOpen ? "مفتوح الآن" : "مغلق حالياً"}</Text>
                    </View>
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
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: 16
  },
  adsContainer: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden"
  },
  adSlide: {
    width: width - 32,
    height: 160,
    position: "relative"
  },
  adImage: {
    width: "100%",
    height: "100%"
  },
  adOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    padding: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  adTitle: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 13
  },
  adBadge: {
    backgroundColor: "#e11d48",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  filterBox: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0a0f1d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
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
    color: "#334155",
    textAlign: "right"
  },
  chipRow: {
    flexDirection: "row-reverse",
    gap: 8
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
    gap: 10
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
  resultsCount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textAlign: "right"
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#475569"
  },
  emptyDesc: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18
  },
  stack: {
    gap: 14
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row-reverse",
    gap: 12,
    alignItems: "center"
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#f1f5f9"
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
    fontSize: 15,
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
    gap: 4
  },
  specialtyText: {
    fontSize: 10,
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
    fontSize: 10,
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

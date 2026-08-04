import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  TextInput, 
  Image, 
  ScrollView, 
  Linking 
} from "react-native";
import { Store } from "../types";

const CITIES_AR = ["الكل", "رام الله", "نابلس", "الخليل", "جنين", "بيت لحم", "طولكرم", "قلقيلية", "أريحا", "غزة"];

interface StoresTabProps {
  stores: Store[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
}

export default function StoresTab({
  stores,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity
}: StoresTabProps) {

  // Local helper for clean city rendering
  const mapCityText = (c: string) => {
    if (c === "بيت Bethlehem") return "بيت لحم";
    return c;
  };

  return (
    <View style={styles.tabContent}>
      {/* Filters */}
      <View style={styles.filterBox}>
        <TextInput
          placeholder="🔎 ابحث عن متجر أدوات، معدات أو مستلزمات..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          textAlign="right"
        />
        <Text style={styles.sectionLabel}>📍 تصفية حسب المدينة الرئيسية:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {CITIES_AR.map((c) => {
            const isSelected = selectedCity === c;
            return (
              <Pressable key={c} onPress={() => setSelectedCity(c)} style={[styles.chip, isSelected && styles.chipActive]}>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={styles.resultsCount}>🎯 تم العثور على ({stores.length}) شركة ومستودع أجهزة معتمد</Text>
      
      {stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>لا توجد متاجر مطابقة</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {stores.map((store) => (
            <View key={store.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: store.logo_url || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&auto=format&fit=crop&q=80" }} style={styles.avatar as any} />
                <View style={styles.headerInfo}>
                  <Text style={styles.cardTitle}>{store.store_name}</Text>
                  <Text style={styles.specialtyText}>{store.specialization || "معدات ومستلزمات أسنان"}</Text>
                </View>
              </View>
              <Text style={styles.bioText}>{store.description}</Text>
              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>📍 المقر الرئيسي: {mapCityText(store.city)}</Text>
              </View>
              <View style={styles.actionRow}>
                {store.whatsapp && (
                  <Pressable onPress={() => Linking.openURL(`https://wa.me/${store.whatsapp.replace(/\+/g, "")}`)} style={[styles.actionBtn, { backgroundColor: "#25d366" }]}>
                    <Text style={styles.actionBtnText}>💬 تواصل واتساب</Text>
                  </Pressable>
                )}
                {store.phone && (
                  <Pressable onPress={() => Linking.openURL(`tel:${store.phone}`)} style={[styles.actionBtn, { backgroundColor: "#0f172a" }]}>
                    <Text style={styles.actionBtnText}>📞 اتصال مبيعات</Text>
                  </Pressable>
                )}
                {store.website && (
                  <Pressable onPress={() => Linking.openURL(store.website)} style={[styles.actionBtn, { backgroundColor: "#0d9488" }]}>
                    <Text style={styles.actionBtnText}>🌐 موقع</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    gap: 16
  },
  filterBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569"
  },
  chipTextActive: {
    color: "#ffffff"
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
    borderColor: "#e2e8f0"
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#475569"
  },
  stack: {
    gap: 14
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
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
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  headerInfo: {
    flex: 1,
    gap: 4
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a"
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
  bioText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 20
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
  actionRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginTop: 4
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900"
  }
});

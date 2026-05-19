import React from "react";
import { StyleSheet, Text, View, TextInput, Image, Pressable, Linking } from "react-native";
import { MarketplaceAd } from "../types";

interface MarketplaceTabProps {
  marketplace: MarketplaceAd[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function MarketplaceTab({
  marketplace,
  searchQuery,
  setSearchQuery
}: MarketplaceTabProps) {

  // Local helper for clean city rendering
  const mapCityText = (c: string) => {
    if (c === "بيت Bethlehem") return "بيت لحم";
    return c;
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.filterBox}>
        <TextInput
          placeholder="🔎 ابحث في سوق أجهزة الأسنان المستعملة..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          textAlign="right"
        />
      </View>
      <Text style={styles.resultsCount}>🛒 أجهزة ومعدات أسنان مستعملة للبيع ({marketplace.length})</Text>

      {marketplace.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>لا توجد إعلانات مطابقة</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {marketplace.map((item) => (
            <Pressable key={item.id} onPress={() => console.log('Card pressed', item.id)} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }, styles.card, pressed && { opacity: 0.95 }]}>
              {item.image_url && <Image source={{ uri: item.image_url }} style={styles.offerImage as any} />}
              <View style={styles.offerPromoRow}>
                <Text style={styles.offerTitle}>{item.title}</Text>
                <Text style={styles.priceTag}>{item.price} ₪</Text>
              </View>
              <Text style={styles.bioText}>{item.description}</Text>
              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>📍 مكان تواجد الجهاز: {mapCityText(item.city)}</Text>
              </View>
              <Pressable onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.button, { backgroundColor: "#0f172a", marginTop: 8 }]}>
                <Text style={styles.buttonText}>📞 تواصل مع البائع مباشرة: {item.phone}</Text>
              </Pressable>
              <Pressable onPress={() => console.log('View details', item.id)} style={[styles.button, { backgroundColor: "#1e293b", marginTop: 8 }]}>
                <Text style={styles.buttonText}>🔎 عرض التفاصيل</Text>
              </Pressable>
            </Pressable>
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
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    // Add subtle scale on press handled via Pressable
  },
  offerImage: {
    width: "100%",
    height: 150,
    borderRadius: 18,
    resizeMode: "cover"
  },
  offerPromoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "right"
  },
  priceTag: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0d9488"
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
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  }
});

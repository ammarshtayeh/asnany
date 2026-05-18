import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { Offer } from "../types";

interface OffersTabProps {
  offers: Offer[];
}

export default function OffersTab({ offers }: OffersTabProps) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.resultsCount}>🏷️ العروض والخصومات الجارية حالياً في فلسطين</Text>
      {offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>لا توجد عروض جارية حالياً</Text>
          <Text style={styles.emptyDesc}>ترقبوا أقوى خصومات العيادات ومستلزمات الأسنان قريباً.</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {offers.map((offer) => (
            <View key={offer.id} style={styles.card}>
              <Image source={{ uri: offer.image_url || "https://images.unsplash.com/photo-1504813184591-015556c5c580?w=600&auto=format&fit=crop&q=80" }} style={styles.offerImage as any} />
              <View style={styles.offerPromoRow}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>خصم {offer.discount_pct}%</Text>
                </View>
              </View>
              <Text style={styles.bioText}>{offer.description}</Text>
              <Text style={styles.expiryText}>⏳ صالح حتى تاريخ: {new Date(offer.valid_until).toLocaleDateString("ar-EG")}</Text>
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
  discountBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  discountBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900"
  },
  bioText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 20
  },
  expiryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#d97706",
    textAlign: "right"
  }
});

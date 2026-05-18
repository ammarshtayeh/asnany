import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Article } from "../types";

interface BlogTabProps {
  articles: Article[];
  expandedBlog: string | null;
  setExpandedBlog: (id: string | null) => void;
}

export default function BlogTab({
  articles,
  expandedBlog,
  setExpandedBlog
}: BlogTabProps) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.resultsCount}>📚 نصائح ومقالات طب الأسنان والوقاية</Text>
      {articles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>لا توجد مقالات طبية حالياً</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {articles.map((art) => {
            const isExpanded = expandedBlog === art.id;
            return (
              <View key={art.id} style={styles.card}>
                <Text style={styles.offerTitle}>{art.title}</Text>
                <Text style={styles.authorText}>✍ بواسطة: {art.author} — {new Date(art.created_at).toLocaleDateString("ar-EG")}</Text>
                <Text style={styles.bioText} numberOfLines={isExpanded ? undefined : 3}>
                  {art.content}
                </Text>
                <Pressable 
                  onPress={() => setExpandedBlog(isExpanded ? null : art.id)}
                  style={styles.readMoreBtn}
                >
                  <Text style={styles.readMoreBtnText}>{isExpanded ? "🔼 قراءة أقل" : "📖 قراءة كامل المقال"}</Text>
                </Pressable>
              </View>
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
  offerTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "right"
  },
  authorText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textAlign: "right"
  },
  bioText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 20
  },
  readMoreBtn: {
    alignSelf: "flex-end",
    marginTop: 6
  },
  readMoreBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0d9488"
  }
});

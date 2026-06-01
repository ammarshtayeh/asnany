import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { Article } from "../../types";

export default function BlogListScreen() {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles((data as Article[]) || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  }

  const categories = Array.from(
    new Set(articles.map((a) => a.category).filter(Boolean))
  ) as string[];

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? a.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const lead = filtered[0];
  const rest = filtered.slice(1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={{ backgroundColor: "#0f172a", minHeight: 220, justifyContent: "flex-end", padding: 24, paddingTop: insets.top + 16 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#10b981", opacity: 0.15 }} />
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#a7f3d0", fontWeight: "900", fontSize: 12 }}>📖 مجلة أسناني</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right" }}>محتوى طبي واضح، بلا تعقيد</Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "right" }}>
          مقالات قصيرة ومفيدة تساعد المرضى على فهم الخيارات قبل زيارة الطبيب.
        </Text>
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        {/* Search Input */}
        <View style={{ backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 14, paddingVertical: 4, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 }}>
          <Text style={{ color: "#64748b", marginLeft: 8, fontSize: 16 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن المقالات أو التوعية الطبية..."
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, color: "#0f172a", fontWeight: "700", textAlign: "right", height: 44 }}
          />
        </View>

        {/* Categories Carousel */}
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: selectedCategory === null ? "#10b981" : "#fff",
                borderWidth: 1,
                borderColor: selectedCategory === null ? "#10b981" : "#e2e8f0",
              }}
            >
              <Text style={{ color: selectedCategory === null ? "#fff" : "#475569", fontWeight: "900", fontSize: 12 }}>الكل</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 100,
                  backgroundColor: selectedCategory === cat ? "#10b981" : "#fff",
                  borderWidth: 1,
                  borderColor: selectedCategory === cat ? "#10b981" : "#e2e8f0",
                }}
              >
                <Text style={{ color: selectedCategory === cat ? "#fff" : "#475569", fontWeight: "900", fontSize: 12 }}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Main list */}
        {loading ? (
          <View style={{ paddingVertical: 60 }}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", borderWidth: 1.5, borderColor: "#f1f5f9", borderStyle: "dashed" }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📓</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#94a3b8", textAlign: "center" }}>لا توجد مقالات منشورة حالياً في هذا القسم.</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {/* Lead Article */}
            {lead && (
              <Pressable
                onPress={() => router.push(`/blog/${lead.id}` as any)}
                style={{ backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
              >
                {lead.image_url ? (
                  <Image source={{ uri: lead.image_url }} style={{ width: "100%", height: 180 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: "100%", height: 180, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 48 }}>📖</Text>
                  </View>
                )}
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <View style={{ backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: "#2563eb", fontSize: 11, fontWeight: "800" }}>{lead.category || "توعية"}</Text>
                    </View>
                    <Text style={{ color: "#94a3b8", fontSize: 11, fontWeight: "700" }}>⏱️ {lead.read_time || "قراءة سريعة"}</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 8, lineHeight: 24 }}>{lead.title}</Text>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "600", textAlign: "right", lineHeight: 20 }} numberOfLines={3}>{lead.excerpt || lead.content}</Text>
                  <View style={{ borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 14, paddingTop: 12, flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#10b981", fontWeight: "900", fontSize: 12 }}>✍️ {lead.doctor_name || "إدارة أسناني"}</Text>
                    <Text style={{ color: "#475569", fontWeight: "800", fontSize: 12 }}>اقرأ المزيد ←</Text>
                  </View>
                </View>
              </Pressable>
            )}

            {/* Rest of the articles */}
            {rest.map((article) => (
              <Pressable
                key={article.id}
                onPress={() => router.push(`/blog/${article.id}` as any)}
                style={{ backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 1, flexDirection: "row-reverse", padding: 12, gap: 12 }}
              >
                {article.image_url ? (
                  <Image source={{ uri: article.image_url }} style={{ width: 100, height: 100, borderRadius: 14 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: 100, height: 100, borderRadius: 14, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 28 }}>📖</Text>
                  </View>
                )}
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  <View>
                    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <Text style={{ color: "#2563eb", fontSize: 10, fontWeight: "800" }}>{article.category || "توعية"}</Text>
                      <Text style={{ color: "#94a3b8", fontSize: 10, fontWeight: "700" }}>⏱️ {article.read_time}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a", textAlign: "right", lineHeight: 18 }} numberOfLines={2}>{article.title}</Text>
                  </View>
                  <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#64748b", fontWeight: "800", fontSize: 11 }}>✍️ {article.doctor_name || "أسناني"}</Text>
                    <Text style={{ color: "#10b981", fontWeight: "800", fontSize: 11 }}>تفاصيل ←</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

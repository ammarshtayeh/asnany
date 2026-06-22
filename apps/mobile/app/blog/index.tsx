import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Article } from "../../types";
import { StackCard, StackPageLayout } from "../../components/ui/StackPageLayout";
import { theme } from "../../constants/theme";

export default function BlogListScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    void fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setArticles((data as Article[]) || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  }

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))) as string[];
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
    <StackPageLayout
      badge="📖 مجلة ملامح"
      title="محتوى طبي واضح، بلا تعقيد"
      subtitle="مقالات قصيرة ومفيدة تساعد المرضى على فهم الخيارات قبل زيارة الطبيب."
    >
      <StackCard>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن المقالات أو التوعية الطبية..."
          placeholderTextColor={theme.textSoft}
          style={{ color: theme.text, fontWeight: "700", textAlign: "right", height: 44 }}
        />
      </StackCard>

      {categories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
          <Chip label="الكل" active={selectedCategory === null} onPress={() => setSelectedCategory(null)} />
          {categories.map((cat) => (
            <Chip key={cat} label={cat} active={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color={theme.teal} style={{ marginVertical: 40 }} />
      ) : filtered.length === 0 ? (
        <StackCard style={{ alignItems: "center", paddingVertical: 32 }}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>📓</Text>
          <Text style={{ fontSize: 14, fontWeight: "700", color: theme.textMuted, textAlign: "center" }}>لا توجد مقالات منشورة حالياً.</Text>
        </StackCard>
      ) : (
        <>
          {lead ? (
            <Pressable onPress={() => router.push(`/blog/${lead.id}` as never)}>
              <StackCard style={{ padding: 0, overflow: "hidden" }}>
                {lead.image_url ? (
                  <Image source={{ uri: lead.image_url }} style={{ width: "100%", height: 180 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: "100%", height: 180, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 48 }}>📖</Text>
                  </View>
                )}
                <View style={{ padding: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: "900", color: theme.text, textAlign: "right", marginBottom: 8 }}>{lead.title}</Text>
                  <Text style={{ fontSize: 13, color: theme.textMuted, fontWeight: "600", textAlign: "right" }} numberOfLines={3}>{lead.excerpt || lead.content}</Text>
                </View>
              </StackCard>
            </Pressable>
          ) : null}
          {rest.map((article) => (
            <Pressable key={article.id} onPress={() => router.push(`/blog/${article.id}` as never)}>
              <StackCard style={{ flexDirection: "row-reverse", gap: 12, alignItems: "center" }}>
                {article.image_url ? (
                  <Image source={{ uri: article.image_url }} style={{ width: 88, height: 88, borderRadius: 14 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: 88, height: 88, borderRadius: 14, backgroundColor: theme.tealMuted, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 28 }}>📖</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: theme.text, textAlign: "right" }} numberOfLines={2}>{article.title}</Text>
                  <Text style={{ color: theme.teal, fontWeight: "800", fontSize: 11, textAlign: "right", marginTop: 6 }}>تفاصيل ←</Text>
                </View>
              </StackCard>
            </Pressable>
          ))}
        </>
      )}
    </StackPageLayout>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        backgroundColor: active ? theme.teal : theme.card,
        borderWidth: 1,
        borderColor: active ? theme.teal : theme.border,
      }}
    >
      <Text style={{ color: active ? theme.white : theme.textMuted, fontWeight: "900", fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

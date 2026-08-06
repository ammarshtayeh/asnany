import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { theme } from "../../constants/theme";
import { Article } from "../../types";
import { StackCard, StackPrimaryButton } from "../../components/ui/StackPageLayout";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  async function fetchArticle() {
    setLoading(true);
    try {
      if (!supabase || !id) return;
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setArticle(data as Article);
    } catch (err) {
      console.error("Error fetching article:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📓</Text>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 6 }}>المقال غير موجود</Text>
        <Text style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 20 }}>عذراً، لم نتمكن من العثور على المقال المطلوب.</Text>
        <StackPrimaryButton label="العودة للمجلة" onPress={() => router.back()} />
      </View>
    );
  }

  const paragraphs = article.content ? article.content.split("\n\n") : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View style={{ height: 280, width: "100%", position: "relative" }}>
        {article.image_url ? (
          <Image source={{ uri: article.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View style={{ width: "100%", height: "100%", backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 64 }}>📖</Text>
          </View>
        )}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.4)" }} />

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: insets.top + 12, right: 20, backgroundColor: "rgba(15,23,42,0.6)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>

        {/* Floating Title block inside banner */}
        <View style={{ position: "absolute", bottom: 20, left: 20, right: 20, alignItems: "flex-end" }}>
          <View style={{ backgroundColor: "#10b981", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>{article.category || "توعية"}</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff", textAlign: "right", lineHeight: 28 }}>{article.title}</Text>
        </View>
      </View>

      {/* Info Bar */}
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.bgElevated, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderLight }}>
        <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "800" }}>✍️ كاتب المقال: {article.doctor_name || "إدارة ملامح"}</Text>
        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
          <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "700" }}>⏱️ {article.read_time || "قراءة سريعة"}</Text>
          {article.date && <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "700" }}>📅 {article.date}</Text>}
        </View>
      </View>

      {/* Article Content */}
      <View style={{ padding: 20 }}>
        {article.excerpt ? (
          <Text style={{ fontSize: 15, fontWeight: "bold", color: "#475569", textAlign: "right", lineHeight: 24, marginBottom: 18, backgroundColor: "#eff6ff", padding: 14, borderRadius: 16, borderRightWidth: 4, borderRightColor: "#2563eb" }}>
            {article.excerpt}
          </Text>
        ) : null}

        <View style={{ gap: 16 }}>
          {paragraphs.map((p: string, idx: number) => (
            <Text key={idx} style={{ fontSize: 14, color: "#334155", fontWeight: "600", textAlign: "right", lineHeight: 24 }}>
              {p.trim()}
            </Text>
          ))}
        </View>

        {/* Doctor CTA Box */}
        {article.doctor_id ? (
          <StackCard style={{ marginTop: 32, gap: 14 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 24 }}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>هل تود مراجعة هذه الحالة؟</Text>
                <Text style={{ fontSize: 12, color: "#64748b", textAlign: "right" }}>يمكنك حجز موعد للفحص المباشر أو الاستشارة.</Text>
              </View>
            </View>
            <StackPrimaryButton label={`احجز موعداً مع ${article.doctor_name}`} onPress={() => router.push(`/doctors/${article.doctor_id}` as never)} />
          </StackCard>
        ) : null}
      </View>
    </ScrollView>
  );
}

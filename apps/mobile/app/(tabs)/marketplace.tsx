import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { MarketplaceAd } from "../../types";

const SPECIALIZATIONS_EQUIP = ["كراسي أسنان", "أجهزة تعقيم", "أشعة وتصوير", "أدوات يدوية"];
const SPECIALIZATIONS_JOBS = ["أطباء أسنان", "مساعدي أسنان", "إداريين وسكرتاريا", "فنيي معمل"];
const CITIES = ["رام الله", "نابلس", "الخليل", "القدس", "بيت لحم", "جنين"];

export default function MarketplaceScreen() {
  const insets = useSafeAreaInsets();
  const [ads, setAds] = useState<MarketplaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "equipment" | "job">("all");
  const [search, setSearch] = useState("");

  // Modals state
  const [showPublish, setShowPublish] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    type: "equipment" as "equipment" | "job",
    category: SPECIALIZATIONS_EQUIP[0],
    price: "",
    salary: "",
    publisher: "",
    city: CITIES[0],
    description: "",
    phone: "",
    image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop",
  });

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    setLoading(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("marketplace_ads")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false });

      if (error) throw error;
      setAds((data as MarketplaceAd[]) || []);
    } catch (err) {
      console.error("Error loading marketplace ads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAd() {
    if (!form.title || !form.phone || !form.description || !form.publisher) return;
    setSubmitting(true);
    try {
      if (!supabase) return;
      const payload = {
        title: form.title,
        type: form.type,
        category: form.category,
        publisher: form.publisher,
        city: form.city,
        description: form.description,
        phone: form.phone,
        image_url: form.type === "equipment" ? form.image_url : undefined,
        price: form.type === "equipment" ? (form.price ? `${form.price} شيكل` : undefined) : undefined,
        salary: form.type === "job" ? (form.salary ? form.salary : "حسب الاتفاق") : undefined,
        is_active: false, // Admin must approve
      };

      const { error } = await supabase.from("marketplace_ads").insert([payload]);
      if (error) throw error;

      setSubmitted(true);
      loadAds();
      setTimeout(() => {
        setShowPublish(false);
        setSubmitted(false);
        setForm({
          title: "",
          type: "equipment",
          category: SPECIALIZATIONS_EQUIP[0],
          price: "",
          salary: "",
          publisher: "",
          city: CITIES[0],
          description: "",
          phone: "",
          image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop",
        });
      }, 2000);
    } catch (err) {
      console.error("Error submitting ad:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = ads.filter((ad) => {
    const matchesTab = activeTab === "all" || ad.type === activeTab;
    const matchesSearch =
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.description.toLowerCase().includes(search.toLowerCase()) ||
      (ad.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (ad.publisher || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Dark Hero */}
      <View style={{ backgroundColor: "#0f172a", paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 50 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#f59e0b", opacity: 0.08 }} />
        
        <View style={{ backgroundColor: "rgba(245,158,11,0.2)", borderWidth: 1, borderColor: "rgba(245,158,11,0.4)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#fef3c7", fontWeight: "900", fontSize: 12 }}>📢 سوق أطباء الأسنان</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right", marginBottom: 6 }}>
          معدات، وظائف، وفرص للعيادات
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", textAlign: "right", marginBottom: 20, lineHeight: 20 }}>
          مساحة منظمة لبيع وشراء أجهزة العيادات، ونشر فرص العمل الطبية، والتواصل المباشر.
        </Text>

        {/* Search */}
        <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12 }}>
          <Text style={{ color: "#64748b", marginLeft: 8 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث بالاسم أو القسم..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ flex: 1, color: "#fff", fontWeight: "700", textAlign: "right", height: 40 }}
          />
        </View>

        <View style={{ flexDirection: "row-reverse", gap: 10 }}>
          <Pressable
            onPress={() => setShowPublish(true)}
            style={{ flex: 1.2, backgroundColor: "#f59e0b", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "900", fontSize: 13 }}>+ انشر إعلانك</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowPricing(true)}
            style={{ flex: 0.8, backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>باقات الترويج</Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ backgroundColor: "#f8fafc", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 20, gap: 14 }}>
        <View style={{ flexDirection: "row-reverse", backgroundColor: "#e2e8f0", padding: 4, borderRadius: 12 }}>
          <Pressable
            onPress={() => setActiveTab("all")}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: activeTab === "all" ? "#fff" : "transparent", alignItems: "center" }}
          >
            <Text style={{ color: activeTab === "all" ? "#0f172a" : "#64748b", fontWeight: "900", fontSize: 12 }}>الكل</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("equipment")}
            style={{ flex: 1.3, paddingVertical: 8, borderRadius: 8, backgroundColor: activeTab === "equipment" ? "#fff" : "transparent", alignItems: "center" }}
          >
            <Text style={{ color: activeTab === "equipment" ? "#0f172a" : "#64748b", fontWeight: "900", fontSize: 12 }}>🛒 معدات</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("job")}
            style={{ flex: 1.3, paddingVertical: 8, borderRadius: 8, backgroundColor: activeTab === "job" ? "#fff" : "transparent", alignItems: "center" }}
          >
            <Text style={{ color: activeTab === "job" ? "#0f172a" : "#64748b", fontWeight: "900", fontSize: 12 }}>💼 وظائف</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 1.5, borderColor: "#f1f5f9", borderStyle: "dashed" }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>📦</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#94a3b8", textAlign: "center" }}>
              {search ? "لا توجد إعلانات مطابقة للبحث" : "سيتم عرض الإعلانات والفرص قريباً."}
            </Text>
          </View>
        ) : (
          filtered.map((ad) => (
            <View
              key={ad.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
                borderWidth: ad.is_featured ? 1.5 : 0,
                borderColor: ad.is_featured ? "#f59e0b" : "transparent",
              }}
            >
              {ad.is_featured && (
                <View style={{ backgroundColor: "#fef3c7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 10 }}>
                  <Text style={{ color: "#d97706", fontSize: 10, fontWeight: "900" }}>⭐ إعلان ممول</Text>
                </View>
              )}
              
              <View style={{ flexDirection: "row-reverse", gap: 12, marginBottom: 10 }}>
                {ad.type === "equipment" && ad.image_url ? (
                  <Image source={{ uri: ad.image_url }} style={{ width: 80, height: 80, borderRadius: 14, backgroundColor: "#f1f5f9" }} />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: 14, backgroundColor: ad.type === "equipment" ? "#eff6ff" : "#ecfdf5", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 36 }}>{ad.type === "equipment" ? "⚙️" : "💼"}</Text>
                  </View>
                )}
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  <View>
                    <View style={{ flexDirection: "row-reverse", gap: 6, marginBottom: 4 }}>
                      <View style={{ backgroundColor: ad.type === "equipment" ? "#eff6ff" : "#ecfdf5", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: ad.type === "equipment" ? "#2563eb" : "#059669", fontSize: 10, fontWeight: "800" }}>{ad.category || "عام"}</Text>
                      </View>
                      <View style={{ backgroundColor: "#f1f5f9", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: "#64748b", fontSize: 10, fontWeight: "800" }}>{ad.city}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>{ad.title}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: ad.type === "equipment" ? "#2563eb" : "#059669", textAlign: "right" }}>
                    {ad.price || ad.salary || "حسب الاتفاق"}
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "600", textAlign: "right", lineHeight: 18, marginBottom: 14 }}>
                {ad.description}
              </Text>

              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12 }}>
                <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: "800" }}>الناشر: {ad.publisher}</Text>
                <Pressable
                  onPress={() => Linking.openURL(`https://wa.me/${ad.phone.replace(/\+/g, "").replace(/\s/g, "")}`)}
                  style={{ backgroundColor: "#0f172a", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>💬 تواصل واتساب</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Pricing Explainer Modal */}
      {showPricing && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.8)", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 28, padding: 24 }}>
            <Pressable
              onPress={() => setShowPricing(false)}
              style={{ position: "absolute", top: 16, left: 16, backgroundColor: "#f1f5f9", width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#475569", fontWeight: "900" }}>✕</Text>
            </Pressable>

            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right", marginTop: 14, marginBottom: 8 }}>📢 أعلن معنا وحقق أهدافك</Text>
            <Text style={{ fontSize: 12, color: "#64748b", textAlign: "right", lineHeight: 18, marginBottom: 18 }}>
              عيادات الأسنان والموردون الطبيون يبحثون عن هذه المستلزمات والوظائف يومياً. اختر الباقة المناسبة:
            </Text>

            <View style={{ gap: 10, marginBottom: 18 }}>
              <View style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>إعلان عادي (Standard)</Text>
                  <Text style={{ fontSize: 10, color: "#94a3b8", textAlign: "right" }}>يظهر في القائمة لمدة 30 يوم.</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "900", color: "#0f172a" }}>50 شيكل</Text>
              </View>

              <View style={{ padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: "#f59e0b", backgroundColor: "#fffbeb", flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "900", color: "#d97706", textAlign: "right" }}>إعلان ممول مثبت (Featured)</Text>
                  <Text style={{ fontSize: 10, color: "#b45309", textAlign: "right" }}>يظهر بأعلى النتائج مع وصول مضاصف 5 مرات.</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "900", color: "#d97706" }}>120 شيكل</Text>
              </View>
            </View>

            <Pressable
              onPress={() => Linking.openURL("https://wa.me/970599000000?text=أهلاً أسناني، أرغب في إضافة إعلان جديد على سوق أسناني الطبي")}
              style={{ backgroundColor: "#25d366", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>تواصل معنا لتفعيل إعلانك 💬</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Publish Form Modal */}
      {showPublish && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.8)", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 28, padding: 24, maxHeight: "90%" }}>
            <Pressable
              onPress={() => setShowPublish(false)}
              style={{ position: "absolute", top: 16, left: 16, backgroundColor: "#f1f5f9", width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#475569", fontWeight: "900" }}>✕</Text>
            </Pressable>

            {submitted ? (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Text style={{ fontSize: 28 }}>✓</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 8 }}>تم إرسال الإعلان بنجاح!</Text>
                <Text style={{ fontSize: 12, color: "#64748b", textAlign: "center", fontWeight: "600" }}>سيقوم فريق المراجعة بتدقيق الإعلان ونشره قريباً.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <View style={{ backgroundColor: "#eff6ff", width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 20 }}>📢</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>انشر إعلانك مجاناً</Text>
                    <Text style={{ fontSize: 12, color: "#64748b", textAlign: "right" }}>أعلن عن أجهزتك الطبية أو ابحث عن كفاءات</Text>
                  </View>
                </View>

                <FormField label="عنوان الإعلان *" value={form.title} onChangeText={(v) => setForm(f => ({ ...f, title: v }))} placeholder="مثال: مطلوب جهاز أشعة بانوراما ديجيتال" />

                <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginTop: 14, marginBottom: 6 }}>نوع الإعلان</Text>
                <View style={{ flexDirection: "row-reverse", gap: 8 }}>
                  <Pressable
                    onPress={() => setForm(f => ({ ...f, type: "equipment", category: SPECIALIZATIONS_EQUIP[0] }))}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: form.type === "equipment" ? "#f59e0b" : "#e2e8f0", backgroundColor: form.type === "equipment" ? "#fffbeb" : "#fff", alignItems: "center" }}
                  >
                    <Text style={{ color: form.type === "equipment" ? "#d97706" : "#475569", fontWeight: "800", fontSize: 12 }}>⚙️ أجهزة ومعدات</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setForm(f => ({ ...f, type: "job", category: SPECIALIZATIONS_JOBS[0] }))}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: form.type === "job" ? "#f59e0b" : "#e2e8f0", backgroundColor: form.type === "job" ? "#fffbeb" : "#fff", alignItems: "center" }}
                  >
                    <Text style={{ color: form.type === "job" ? "#d97706" : "#475569", fontWeight: "800", fontSize: 12 }}>💼 وظائف شاغرة</Text>
                  </Pressable>
                </View>

                <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginTop: 14, marginBottom: 6 }}>القسم</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
                  {(form.type === "equipment" ? SPECIALIZATIONS_EQUIP : SPECIALIZATIONS_JOBS).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setForm(f => ({ ...f, category: cat }))}
                      style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, borderColor: form.category === cat ? "#0f172a" : "#e2e8f0", backgroundColor: form.category === cat ? "#0f172a" : "#fff" }}
                    >
                      <Text style={{ color: form.category === cat ? "#fff" : "#475569", fontWeight: "800", fontSize: 12 }}>{cat}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginTop: 14, marginBottom: 6 }}>المدينة</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
                  {CITIES.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setForm(f => ({ ...f, city: c }))}
                      style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, borderColor: form.city === c ? "#0f172a" : "#e2e8f0", backgroundColor: form.city === c ? "#0f172a" : "#fff" }}
                    >
                      <Text style={{ color: form.city === c ? "#fff" : "#475569", fontWeight: "800", fontSize: 12 }}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {form.type === "equipment" ? (
                  <FormField label="السعر (شيكل) *" value={form.price} onChangeText={(v) => setForm(f => ({ ...f, price: v }))} keyboardType="phone-pad" placeholder="مثال: 12,000" />
                ) : (
                  <FormField label="الراتب المتوقع (اختياري)" value={form.salary} onChangeText={(v) => setForm(f => ({ ...f, salary: v }))} placeholder="مثال: حسب الكفاءة والنسبة" />
                )}

                <FormField label="الناشر *" value={form.publisher} onChangeText={(v) => setForm(f => ({ ...f, publisher: v }))} placeholder="اسم العيادة أو اسمك الشخصي" />
                <FormField label="رقم التواصل (واتساب) *" value={form.phone} onChangeText={(v) => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" placeholder="+970599123456" />

                {form.type === "equipment" && (
                  <FormField label="رابط صورة الجهاز (اختياري)" value={form.image_url} onChangeText={(v) => setForm(f => ({ ...f, image_url: v }))} placeholder="رابط صورة للمنتج..." />
                )}

                <FormField label="وصف تفصيلي للإعلان *" value={form.description} onChangeText={(v) => setForm(f => ({ ...f, description: v }))} multiline placeholder="اذكر حالة الجهاز، الماركة، شروط العمل للوظيفة..." />

                <Pressable
                  onPress={handleSubmitAd}
                  disabled={submitting}
                  style={{ backgroundColor: "#f59e0b", borderRadius: 16, paddingVertical: 15, alignItems: "center", marginTop: 18, opacity: submitting ? 0.7 : 1 }}
                >
                  <Text style={{ color: "#0f172a", fontWeight: "900", fontSize: 14 }}>{submitting ? "جاري الحفظ..." : "انشر إعلانك مجاناً"}</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function FormField({ label, value, onChangeText, keyboardType, multiline, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void;
  keyboardType?: "default" | "phone-pad"; multiline?: boolean; placeholder?: string;
}) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        textAlign="right"
        style={{
          minHeight: multiline ? 80 : 48,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontWeight: "700",
          color: "#0f172a",
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

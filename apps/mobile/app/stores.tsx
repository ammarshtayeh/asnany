import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch } from "../lib/api";
import { FORM_PHONE_PLACEHOLDER } from "../lib/site-contact";

type Store = {
  id: string;
  store_name?: string;
  storeName?: string;
  specialization?: string;
  city?: string;
  description?: string;
  logo_url?: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
};

const SPECIALIZATIONS = ["أجهزة ومستلزمات طبية", "أجهزة ليزر وتجميل", "أجهزة بصرية وعيون", "أدوات ومواد استهلاكية", "أثاث عيادات ومراكز", "أنظمة وبرمجيات طبية"];
const CITIES = ["رام الله", "نابلس", "الخليل", "القدس", "بيت لحم", "جنين"];

export default function StoresScreen() {
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    storeName: "",
    specialization: SPECIALIZATIONS[0],
    city: CITIES[0],
    description: "",
    phone: "",
    whatsapp: "",
    website: "",
  });

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    setLoading(true);
    try {
      const { data } = await apiFetch<Store[]>("/api/stores");
      setStores(Array.isArray(data) ? data : []);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }

  async function submitStore() {
    if (!form.storeName || !form.phone || !form.description) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/stores", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      loadStores();
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setForm({ storeName: "", specialization: SPECIALIZATIONS[0], city: CITIES[0], description: "", phone: "", whatsapp: "", website: "" });
      }, 2000);
    } catch {
      // handle error silently
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = stores.filter((s) => {
    const q = search.toLowerCase();
    const name = (s.storeName || s.store_name || "").toLowerCase();
    return name.includes(q) || (s.city || "").toLowerCase().includes(q) || (s.specialization || "").toLowerCase().includes(q);
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0f172a" }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Dark Hero */}
      <View style={{ backgroundColor: "#0f172a", paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 60 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#3b82f6", opacity: 0.08 }} />
        <Pressable
          onPress={() => router.back()}
          style={{ alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", marginBottom: 24 }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>رجوع</Text>
        </Pressable>

        <View style={{ backgroundColor: "rgba(59,130,246,0.2)", borderWidth: 1, borderColor: "rgba(59,130,246,0.4)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start", marginBottom: 12 }}>
          <Text style={{ color: "#93c5fd", fontWeight: "900", fontSize: 12 }}>📦 للأطباء والعيادات والمراكز (B2B)</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "right", marginBottom: 6 }}>
          دليل الموردين و<Text style={{ color: "#60a5fa" }}>الشركات الطبية</Text>
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, fontWeight: "600", textAlign: "right", marginBottom: 20, lineHeight: 20 }}>
          تواصل مباشرة مع كبرى شركات الأجهزة والمستلزمات الطبية والتجميلية والبصريات في فلسطين
        </Text>

        {/* Search */}
        <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12 }}>
          <Text style={{ color: "#64748b", marginLeft: 8 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن شركة، منتج، أو مدينة..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ flex: 1, color: "#fff", fontWeight: "700", textAlign: "right", height: 40 }}
          />
        </View>

        <Pressable
          onPress={() => setShowForm(true)}
          style={{ backgroundColor: "#3b82f6", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>+ سجل شركتك الطبية</Text>
        </Pressable>
      </View>

      {/* Stores list */}
      <View style={{ backgroundColor: "#f8fafc", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 20, gap: 14 }}>
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 1.5, borderColor: "#f1f5f9", borderStyle: "dashed" }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🏢</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#94a3b8", textAlign: "center" }}>
              {search ? "لا توجد شركات مطابقة للبحث" : "سيتم عرض الشركات والموردين المعتمدين قريباً."}
            </Text>
          </View>
        ) : (
          filtered.map((store) => {
            const name = store.storeName || store.store_name || "";
            const logo = store.logo_url || store.logoUrl;
            return (
              <View key={store.id} style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, flexDirection: "row-reverse", gap: 14 }}>
                {logo ? (
                  <Image source={{ uri: logo }} style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: "#f1f5f9" }} />
                ) : (
                  <View style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 28 }}>🏢</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row-reverse", gap: 6, marginBottom: 6 }}>
                    {store.specialization && (
                      <View style={{ backgroundColor: "#eff6ff", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: "#2563eb", fontSize: 11, fontWeight: "800" }}>{store.specialization}</Text>
                      </View>
                    )}
                    {store.city && (
                      <View style={{ backgroundColor: "#f1f5f9", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "800" }}>{store.city}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", textAlign: "right", marginBottom: 4 }}>{name}</Text>
                  {store.description && (
                    <Text style={{ fontSize: 12, color: "#64748b", fontWeight: "500", textAlign: "right", lineHeight: 18 }} numberOfLines={2}>{store.description}</Text>
                  )}
                  <View style={{ flexDirection: "row-reverse", gap: 8, marginTop: 10 }}>
                    {store.whatsapp && (
                      <Pressable
                        onPress={() => Linking.openURL(`https://wa.me/${store.whatsapp?.replace(/\+/g, "").replace(/\s/g, "")}`)}
                        style={{ backgroundColor: "#dcfce7", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}
                      >
                        <Text style={{ color: "#16a34a", fontWeight: "900", fontSize: 12 }}>💬 واتساب</Text>
                      </Pressable>
                    )}
                    {store.website && (
                      <Pressable
                        onPress={() => Linking.openURL(store.website!)}
                        style={{ backgroundColor: "#f1f5f9", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}
                      >
                        <Text style={{ color: "#475569", fontWeight: "900", fontSize: 12 }}>🌐 الموقع</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Registration Modal */}
      {showForm && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15,23,42,0.8)", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 28, padding: 24, maxHeight: "90%" }}>
            <Pressable
              onPress={() => setShowForm(false)}
              style={{ position: "absolute", top: 16, left: 16, backgroundColor: "#f1f5f9", width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#475569", fontWeight: "900" }}>✕</Text>
            </Pressable>

            {submitted ? (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Text style={{ fontSize: 28 }}>✓</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "900", color: "#0f172a", textAlign: "center", marginBottom: 8 }}>تم تقديم طلبك بنجاح!</Text>
                <Text style={{ fontSize: 13, color: "#64748b", textAlign: "center", fontWeight: "600" }}>سيتواصل معك فريق الدعم للتحقق وتفعيل الشركة.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <View style={{ backgroundColor: "#eff6ff", width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 20 }}>🏢</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: "900", color: "#0f172a", textAlign: "right" }}>سجل شركتك الطبية</Text>
                    <Text style={{ fontSize: 12, color: "#64748b", textAlign: "right" }}>ابدأ بالإعلان وتسويق موادك للأطباء</Text>
                  </View>
                </View>

                <FormField label="اسم الشركة *" value={form.storeName} onChangeText={(v) => setForm(f => ({ ...f, storeName: v }))} placeholder="مثال: شركة القدس للمستلزمات الطبية" />

                <Text style={{ fontSize: 12, fontWeight: "900", color: "#64748b", textAlign: "right", marginTop: 14, marginBottom: 6 }}>التصنيف</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row-reverse" }}>
                  {SPECIALIZATIONS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setForm(f => ({ ...f, specialization: s }))}
                      style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1.5, borderColor: form.specialization === s ? "#3b82f6" : "#e2e8f0", backgroundColor: form.specialization === s ? "#3b82f6" : "#fff" }}
                    >
                      <Text style={{ color: form.specialization === s ? "#fff" : "#475569", fontWeight: "800", fontSize: 12 }}>{s}</Text>
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

                <FormField label="رقم الهاتف *" value={form.phone} onChangeText={(v) => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" placeholder="022987654" />
                <FormField label="رقم الواتساب" value={form.whatsapp} onChangeText={(v) => setForm(f => ({ ...f, whatsapp: v }))} keyboardType="phone-pad" placeholder={FORM_PHONE_PLACEHOLDER} />
                <FormField label="الموقع الإلكتروني (اختياري)" value={form.website} onChangeText={(v) => setForm(f => ({ ...f, website: v }))} placeholder="https://example.com" />
                <FormField label="وصف الشركة ونشاطها *" value={form.description} onChangeText={(v) => setForm(f => ({ ...f, description: v }))} multiline placeholder="صف نشاط شركتك والخدمات التي تقدمها للعيادات..." />

                <Pressable
                  onPress={submitStore}
                  disabled={submitting}
                  style={{ backgroundColor: "#3b82f6", borderRadius: 16, paddingVertical: 15, alignItems: "center", marginTop: 18, opacity: submitting ? 0.7 : 1 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>{submitting ? "جاري الحفظ..." : "تسجيل وإرسال الطلب"}</Text>
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

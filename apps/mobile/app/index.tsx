import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import Header from "../components/Header";
import { colors, cities, specialties } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { Article, Doctor, MarketplaceAd, MedicalService, Offer, Store } from "../types";

type TabKey = "doctors" | "services" | "offers" | "market" | "media" | "join";

const tabs: Array<{ key: TabKey; label: string; short: string; color: string }> = [
  { key: "doctors", label: "الأطباء", short: "الأطباء", color: colors.sky },
  { key: "services", label: "الخدمات", short: "خدمات", color: colors.fuchsia },
  { key: "offers", label: "العروض", short: "عروض", color: colors.amber },
  { key: "market", label: "السوق", short: "السوق", color: colors.emerald },
  { key: "media", label: "المجلة", short: "ميديا", color: colors.violet },
  { key: "join", label: "انضمام", short: "انضم", color: colors.teal },
];

const serviceLabels: Record<string, string> = {
  beauty: "مراكز التجميل",
  lab: "المختبرات",
  consultation: "الاستشارات",
  partner: "الشركات",
  media: "الميديا الطبية",
  booking: "الحجز",
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>("doctors");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [market, setMarket] = useState<MarketplaceAd[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const [regType, setRegType] = useState<"doctor" | "store">("doctor");
  const [regName, setRegName] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regCity, setRegCity] = useState("رام الله");
  const [regPhone, setRegPhone] = useState("");
  const [regNotes, setRegNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchData();
    Notifications.getPermissionsAsync().catch(() => null);
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      if (!supabase) return;
      const today = new Date().toISOString();
      const [doctorsRes, storesRes, servicesRes, offersRes, marketRes, articlesRes] = await Promise.all([
        supabase.from("doctors").select("*").eq("verified", true).order("is_featured", { ascending: false }),
        supabase.from("stores").select("*").eq("is_active", true),
        supabase.from("medical_services").select("*").eq("is_active", true).order("is_featured", { ascending: false }),
        supabase.from("offers").select("*").gte("valid_until", today),
        supabase.from("marketplace_ads").select("*").eq("is_active", true).order("is_featured", { ascending: false }),
        supabase.from("articles").select("*").order("created_at", { ascending: false }),
      ]);

      setDoctors((doctorsRes.data as Doctor[]) || []);
      setStores((storesRes.data as Store[]) || []);
      setServices((servicesRes.data as MedicalService[]) || []);
      setOffers((offersRes.data as Offer[]) || []);
      setMarket((marketRes.data as MarketplaceAd[]) || []);
      setArticles((articlesRes.data as Article[]) || []);
    } catch (error) {
      console.error("Mobile data error:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDoctors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const text = `${doctor.name} ${doctor.city} ${doctor.area || ""} ${doctor.bio || ""}`.toLowerCase();
      const cityOk = selectedCity === "الكل" || doctor.city === selectedCity;
      const specialtyOk =
        selectedSpecialty === "الكل" || doctor.specialty?.some((item) => item.includes(selectedSpecialty));
      return cityOk && specialtyOk && (!needle || text.includes(needle));
    });
  }, [doctors, query, selectedCity, selectedSpecialty]);

  const filteredServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const text = `${service.name} ${service.city || ""} ${service.category || ""} ${service.description || ""}`.toLowerCase();
      return !needle || text.includes(needle);
    });
  }, [services, query]);

  const submitRegistration = async () => {
    if (!regName || !regCity) {
      setNotice("يرجى تعبئة الاسم والمدينة على الأقل.");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      if (!supabase) throw new Error("Supabase غير مهيأ");
      if (regType === "doctor") {
        const { error } = await supabase.from("doctors").insert([
          {
            name: regName,
            specialty: regSpecialty ? [regSpecialty] : ["طب أسنان عام"],
            city: regCity,
            phone: regPhone,
            bio: regNotes,
            verified: false,
            clinic_photos: [],
            insurance_list: [],
          },
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("stores").insert([
          {
            store_name: regName,
            specialization: regSpecialty || "مستلزمات طبية",
            city: regCity,
            phone: regPhone,
            description: regNotes,
            is_active: false,
          },
        ]);
        if (error) throw error;
      }
      setRegName("");
      setRegSpecialty("");
      setRegPhone("");
      setRegNotes("");
      setNotice("تم إرسال الطلب بنجاح. سيتم مراجعته من لوحة الإدارة.");
    } catch (error) {
      console.error(error);
      setNotice("تعذر إرسال الطلب حالياً. تحقق من الاتصال وحاول مجدداً.");
    } finally {
      setSaving(false);
    }
  };

  const tabAccent = tabs.find((tab) => tab.key === activeTab)?.color || colors.sky;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingTop: Math.max(insets.top + 12, 24), paddingBottom: insets.bottom + 108 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key);
                  setQuery("");
                }}
                style={[styles.topTab, active && { backgroundColor: tab.color, borderColor: tab.color }]}
              >
                <Text style={[styles.topTabText, active && styles.topTabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeTab !== "join" ? (
          <View style={styles.searchCard}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ابحث بالاسم، المدينة، الخدمة..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              textAlign="right"
            />
            {activeTab === "doctors" ? (
              <>
                <ChipRow values={cities} value={selectedCity} onChange={setSelectedCity} color={colors.sky} />
                <ChipRow
                  values={specialties}
                  value={selectedSpecialty}
                  onChange={setSelectedSpecialty}
                  color={colors.teal}
                />
              </>
            ) : null}
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={tabAccent} />
            <Text style={styles.loadingText}>جار تحميل بيانات المنصة...</Text>
          </View>
        ) : null}

        {!loading && activeTab === "doctors" ? <DoctorsSection doctors={filteredDoctors} /> : null}
        {!loading && activeTab === "services" ? <ServicesSection services={filteredServices} stores={stores} /> : null}
        {!loading && activeTab === "offers" ? <OffersSection offers={offers} /> : null}
        {!loading && activeTab === "market" ? <MarketSection market={market} /> : null}
        {!loading && activeTab === "media" ? <MediaSection articles={articles} /> : null}
        {activeTab === "join" ? (
          <JoinSection
            regType={regType}
            setRegType={setRegType}
            regName={regName}
            setRegName={setRegName}
            regSpecialty={regSpecialty}
            setRegSpecialty={setRegSpecialty}
            regCity={regCity}
            setRegCity={setRegCity}
            regPhone={regPhone}
            setRegPhone={setRegPhone}
            regNotes={regNotes}
            setRegNotes={setRegNotes}
            saving={saving}
            notice={notice}
            onSubmit={submitRegistration}
          />
        ) : null}
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {tabs.slice(0, 5).map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.bottomItem}>
              <View style={[styles.bottomDot, { backgroundColor: active ? tab.color : "#e2e8f0" }]} />
              <Text style={[styles.bottomText, active && { color: tab.color }]}>{tab.short}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ChipRow({
  values,
  value,
  onChange,
  color,
}: {
  values: string[];
  value: string;
  onChange: (value: string) => void;
  color: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {values.map((item) => {
        const active = item === value;
        return (
          <Pressable key={item} onPress={() => onChange(item)} style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>يمكنك إضافة البيانات من لوحة الإدارة لتظهر هنا مباشرة.</Text>
    </View>
  );
}

function DoctorsSection({ doctors }: { doctors: Doctor[] }) {
  if (!doctors.length) return <EmptyState title="لا توجد نتائج مطابقة للأطباء" />;
  return (
    <View style={styles.stack}>
      <SectionTitle title={`الأطباء والعيادات (${doctors.length})`} color={colors.sky} />
      {doctors.map((doctor) => (
        <Link key={doctor.id} href={`/doctor/${doctor.id}`} asChild>
          <Pressable style={styles.card}>
            <View style={styles.row}>
              <Image source={{ uri: doctor.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop" }} style={styles.avatar} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>د. {doctor.name}</Text>
                <Text style={styles.cardMeta}>{doctor.specialty?.join("، ") || "طب أسنان عام"}</Text>
                <Text style={styles.cardText}>{doctor.city}{doctor.area ? ` - ${doctor.area}` : ""}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Badge label={doctor.verified ? "موثق" : "قيد المراجعة"} color={doctor.verified ? colors.emerald : colors.muted} />
              <Text style={styles.rating}>تقييم {doctor.rating || 5}</Text>
            </View>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

function ServicesSection({ services, stores }: { services: MedicalService[]; stores: Store[] }) {
  const combined = [
    ...services.map((service) => ({ id: service.id, title: service.name, subtitle: serviceLabels[service.service_type] || service.category || "خدمة طبية", description: service.description, city: service.city, phone: service.phone || service.whatsapp, image: service.image_url, color: colors.fuchsia })),
    ...stores.map((store) => ({ id: store.id, title: store.store_name, subtitle: store.specialization || "مورد طبي", description: store.description, city: store.city, phone: store.phone || store.whatsapp, image: store.logo_url, color: colors.emerald })),
  ];
  if (!combined.length) return <EmptyState title="لا توجد خدمات أو شركاء حالياً" />;
  return (
    <View style={styles.stack}>
      <SectionTitle title={`الخدمات الطبية والشركاء (${combined.length})`} color={colors.fuchsia} />
      {combined.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&auto=format&fit=crop" }} style={styles.avatar} />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={[styles.cardMeta, { color: item.color }]}>{item.subtitle}</Text>
              <Text style={styles.cardText}>{item.city || "فلسطين"}</Text>
            </View>
          </View>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          {item.phone ? <ContactButton phone={item.phone} /> : null}
        </View>
      ))}
    </View>
  );
}

function OffersSection({ offers }: { offers: Offer[] }) {
  if (!offers.length) return <EmptyState title="لا توجد عروض نشطة حالياً" />;
  return (
    <View style={styles.stack}>
      <SectionTitle title={`العروض الحالية (${offers.length})`} color={colors.amber} />
      {offers.map((offer) => {
        const discount = offer.discount_percentage ?? offer.discount_pct ?? 0;
        return (
          <View key={offer.id} style={styles.card}>
            {offer.image_url ? <Image source={{ uri: offer.image_url }} style={styles.heroImage} /> : null}
            <View style={styles.cardFooter}>
              <Text style={styles.cardTitle}>{offer.title}</Text>
              <Badge label={`خصم ${discount}%`} color={colors.rose} />
            </View>
            <Text style={styles.description}>{offer.description}</Text>
            <Text style={styles.cardMeta}>{offer.doctor_name || "عرض طبي"} - صالح حتى {formatDate(offer.valid_until)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MarketSection({ market }: { market: MarketplaceAd[] }) {
  if (!market.length) return <EmptyState title="لا توجد إعلانات سوق حالياً" />;
  return (
    <View style={styles.stack}>
      <SectionTitle title={`سوق أسناني (${market.length})`} color={colors.emerald} />
      {market.map((item) => (
        <View key={item.id} style={styles.card}>
          {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.heroImage} /> : null}
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <Badge label={item.type === "job" ? "وظيفة" : item.price ? String(item.price) : "معدات"} color={colors.emerald} />
            <Text style={styles.cardMeta}>{item.city || "فلسطين"}</Text>
          </View>
          {item.phone ? <ContactButton phone={item.phone} /> : null}
        </View>
      ))}
    </View>
  );
}

function MediaSection({ articles }: { articles: Article[] }) {
  if (!articles.length) return <EmptyState title="لا توجد مقالات أو أخبار حالياً" />;
  return (
    <View style={styles.stack}>
      <SectionTitle title={`المجلة الطبية (${articles.length})`} color={colors.violet} />
      {articles.map((article) => (
        <View key={article.id} style={styles.card}>
          {article.image_url ? <Image source={{ uri: article.image_url }} style={styles.heroImage} /> : null}
          <Badge label={article.category || "توعية"} color={colors.violet} />
          <Text style={styles.cardTitle}>{article.title}</Text>
          <Text style={styles.description} numberOfLines={4}>{article.excerpt || article.content}</Text>
          <Text style={styles.cardMeta}>{article.doctor_name || article.author || "أسناني"} - {article.read_time || "قراءة سريعة"}</Text>
        </View>
      ))}
    </View>
  );
}

function JoinSection(props: {
  regType: "doctor" | "store";
  setRegType: (value: "doctor" | "store") => void;
  regName: string;
  setRegName: (value: string) => void;
  regSpecialty: string;
  setRegSpecialty: (value: string) => void;
  regCity: string;
  setRegCity: (value: string) => void;
  regPhone: string;
  setRegPhone: (value: string) => void;
  regNotes: string;
  setRegNotes: (value: string) => void;
  saving: boolean;
  notice: string;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.card}>
      <SectionTitle title="انضم إلى شبكة أسناني" color={colors.teal} />
      <Text style={styles.description}>سجل عيادتك أو شركتك ليتم مراجعتها وتفعيلها من لوحة الإدارة.</Text>
      <View style={styles.segment}>
        <Pressable onPress={() => props.setRegType("doctor")} style={[styles.segmentBtn, props.regType === "doctor" && styles.segmentActive]}>
          <Text style={[styles.segmentText, props.regType === "doctor" && styles.segmentTextActive]}>طبيب/عيادة</Text>
        </Pressable>
        <Pressable onPress={() => props.setRegType("store")} style={[styles.segmentBtn, props.regType === "store" && styles.segmentActive]}>
          <Text style={[styles.segmentText, props.regType === "store" && styles.segmentTextActive]}>شركة/متجر</Text>
        </Pressable>
      </View>
      <FormInput placeholder="الاسم" value={props.regName} onChangeText={props.setRegName} />
      <FormInput placeholder="التخصص أو المجال" value={props.regSpecialty} onChangeText={props.setRegSpecialty} />
      <FormInput placeholder="المدينة" value={props.regCity} onChangeText={props.setRegCity} />
      <FormInput placeholder="رقم الهاتف" value={props.regPhone} onChangeText={props.setRegPhone} keyboardType="phone-pad" />
      <TextInput
        placeholder="ملاحظات أو وصف مختصر"
        placeholderTextColor="#94a3b8"
        value={props.regNotes}
        onChangeText={props.setRegNotes}
        style={[styles.input, styles.textArea]}
        textAlign="right"
        multiline
      />
      {props.notice ? <Text style={styles.notice}>{props.notice}</Text> : null}
      <Pressable disabled={props.saving} onPress={props.onSubmit} style={[styles.primaryButton, props.saving && { opacity: 0.7 }]}>
        <Text style={styles.primaryButtonText}>{props.saving ? "جار الإرسال..." : "إرسال الطلب"}</Text>
      </Pressable>
    </View>
  );
}

function SectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={[styles.sectionLine, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function ContactButton({ phone }: { phone: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(`tel:${phone}`)} style={styles.contactButton}>
      <Text style={styles.contactText}>اتصال مباشر: {phone}</Text>
    </Pressable>
  );
}

function FormInput(props: any) {
  return <TextInput {...props} placeholderTextColor="#94a3b8" style={styles.input} textAlign="right" />;
}

function formatDate(value?: string) {
  if (!value) return "غير محدد";
  try {
    return new Date(value).toLocaleDateString("ar");
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.soft,
  },
  page: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tabsRow: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingVertical: 4,
  },
  topTab: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  topTabText: {
    color: colors.muted,
    fontWeight: "900",
    fontSize: 13,
  },
  topTabTextActive: {
    color: "#fff",
  },
  searchCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontWeight: "800",
  },
  chipRow: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  chip: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  chipTextActive: {
    color: "#fff",
  },
  loadingCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    color: colors.muted,
    fontWeight: "800",
  },
  stack: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  heroImage: {
    width: "100%",
    height: 150,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 23,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 3,
  },
  cardText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
  },
  description: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "right",
  },
  cardFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-end",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  rating: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
  },
  contactButton: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  contactText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  sectionLine: {
    width: 5,
    height: 24,
    borderRadius: 99,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  segment: {
    flexDirection: "row-reverse",
    borderRadius: 16,
    padding: 5,
    backgroundColor: "#f1f5f9",
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.card,
  },
  segmentText: {
    color: colors.muted,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: colors.ink,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontWeight: "800",
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  notice: {
    color: colors.teal,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.teal,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  bottomNav: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    paddingTop: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  bottomItem: {
    alignItems: "center",
    minWidth: 54,
    gap: 4,
  },
  bottomDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  bottomText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
  },
});

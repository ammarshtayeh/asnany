import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Image, 
  Dimensions,
  Platform,
  Linking
} from "react-native";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

const { width } = Dimensions.get("window");

// Set notifications handler to show alerts natively
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

interface Doctor {
  id: string;
  name: string;
  specialty: string[];
  city: string;
  area: string;
  phone: string;
  whatsapp: string;
  bio: string;
  lat: number;
  lng: number;
  image_url: string;
  clinic_photos: string[];
  insurance_list: string[];
  working_hours: any;
  verified: boolean;
  is_featured: boolean;
  rating: number;
  accepts_insurance: boolean;
}

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

interface Store {
  id: string;
  store_name: string;
  description: string;
  city: string;
  phone: string;
  whatsapp: string;
  website: string;
  logo_url: string;
  specialization: string;
  is_active: boolean;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_pct: number;
  valid_until: string;
  image_url: string;
}

interface MarketplaceAd {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  phone: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
}

interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

const CITIES = ["الكل", "رام الله", "نابلس", "الخليل", "جنين", "بيت لحم", "طولكرم", "قلقيلية", "أريحا", "غزة"];
const SPECIALTIES = ["الكل", "زراعة الأسنان", "تقويم الأسنان", "تجميل الأسنان", "علاج العصب", "أسنان الأطفال", "طب أسنان عام"];

export default function HomeScreen() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"doctors" | "stores" | "offers" | "marketplace" | "blog" | "join" | "notifications">("doctors");

  // Database lists
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceAd[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  // Self Registration States
  const [regType, setRegType] = useState<"doctor" | "store">("doctor");
  const [regName, setRegName] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regCity, setRegCity] = useState("رام الله");
  const [regArea, setRegArea] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regBio, setRegBio] = useState("");
  const [regImageUrl, setRegImageUrl] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regSaving, setRegSaving] = useState(false);

  // Notifications permission state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Expanded blog state
  const [expandedBlog, setExpandedBlog] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    checkNotificationStatus();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        setLoading(false);
        return;
      }

      // 1. Fetch Verified Doctors
      const { data: doctorsData, error: docError } = await supabase
        .from("doctors")
        .select("*")
        .eq("verified", true);
      if (!docError) setDoctors(doctorsData || []);

      // 2. Fetch Active Advertisements (top banner)
      const today = new Date().toISOString().split("T")[0];
      const { data: adsData, error: adsError } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .gte("end_date", today);
      if (!adsError) setAds(adsData || []);

      // 3. Fetch Active Stores
      const { data: storesData } = await supabase!
        .from("stores")
        .select("*")
        .eq("is_active", true);
      setStores(storesData || []);

      // 4. Fetch Active Offers
      const { data: offersData } = await supabase!
        .from("offers")
        .select("*")
        .gte("valid_until", new Date().toISOString());
      setOffers(offersData || []);

      // 5. Fetch Active Marketplace Ads
      const { data: marketplaceData } = await supabase!
        .from("marketplace_ads")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false });
      setMarketplace(marketplaceData || []);

      // 6. Fetch Blog Articles
      const { data: articlesData } = await supabase!
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      setArticles(articlesData || []);

    } catch (err) {
      console.error("Error fetching mobile comprehensive data:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === "granted");
    } catch (err) {
      console.error(err);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setNotificationsEnabled(true);
        alert("🎉 تم تفعيل التنبيهات بنجاح!");
        triggerTestNotification();
      } else {
        alert("⚠️ لم يتم تفعيل التنبيهات. يرجى تفعيلها من إعدادات الهاتف.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "أسناني.ps 🔔",
          body: "أهلاً بك! تم تفعيل التنبيهات والاتصال بنجاح. ستصلك أحدث عروض مستلزمات الأسنان وحجوزات المرضى فوراً!",
          data: { data: "test" },
        },
        trigger: null, // immediate
      });
    } catch (err) {
      console.error("Error triggering notification:", err);
    }
  };

  // Local working hours active check
  function isDoctorOpenNow(workingHours: any): boolean {
    if (!workingHours) return false;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Hebron",
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const weekdayPart = parts.find(p => p.type === "weekday")?.value;
      const hourPart = parts.find(p => p.type === "hour")?.value;
      const minutePart = parts.find(p => p.type === "minute")?.value;

      if (!weekdayPart || !hourPart || !minutePart) return false;

      const currentHour = parseInt(hourPart, 10);
      const currentMinute = parseInt(minutePart, 10);
      const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

      const dayMapping: { [key: string]: string } = {
        "Saturday": "السبت",
        "Sunday": "الأحد",
        "Monday": "الإثنين",
        "Tuesday": "الثلاثاء",
        "Wednesday": "الأربعاء",
        "Thursday": "الخميس",
        "Friday": "الجمعة"
      };

      const arabicDay = dayMapping[weekdayPart];
      if (!arabicDay) return false;

      const timeRange = workingHours[arabicDay];
      if (!timeRange || timeRange === "مغلق") return false;

      const cleanRange = timeRange.replace(/\s+/g, "");
      const times = cleanRange.split("-");
      if (times.length !== 2) return false;

      const parseTime = (timeStr: string): number | null => {
        const isPm = timeStr.includes("م");
        const isAm = timeStr.includes("ص");
        const cleanTime = timeStr.replace(/[صم]/g, "");
        const parts = cleanTime.split(":");
        if (parts.length !== 2) return null;
        let hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);

        if (isPm && hour < 12) hour += 12;
        if (isAm && hour === 12) hour = 0;

        return hour * 60 + minute;
      };

      const startTime = parseTime(times[0]);
      const endTime = parseTime(times[1]);

      if (startTime === null || endTime === null) return false;

      if (startTime <= endTime) {
        return currentMinutesSinceMidnight >= startTime && currentMinutesSinceMidnight <= endTime;
      } else {
        return currentMinutesSinceMidnight >= startTime || currentMinutesSinceMidnight <= endTime;
      }
    } catch (err) {
      console.error("isDoctorOpenNow mobile error:", err);
      return false;
    }
  }

  // Handle registrations submission natively
  const handleRegistrationSubmit = async () => {
    if (!regName || !regCity) {
      alert("يرجى تعبئة الاسم والمدينة");
      return;
    }

    setRegSaving(true);
    try {
      if (regType === "doctor") {
        const { error } = await supabase!.from("doctors").insert([{
          name: regName,
          specialty: regSpecialty ? [regSpecialty] : ["طب أسنان عام"],
          city: regCity,
          area: regArea,
          phone: regPhone,
          whatsapp: regWhatsapp,
          bio: regBio,
          image_url: regImageUrl,
          verified: false, // Must be verified by admin
          clinic_photos: [],
          insurance_list: []
        }]);

        if (error) throw error;
      } else {
        const { error } = await supabase!.from("stores").insert([{
          store_name: regName,
          specialization: regSpecialty || "مستلزمات عامة",
          city: regCity,
          description: regBio,
          phone: regPhone,
          whatsapp: regWhatsapp,
          logo_url: regImageUrl,
          is_active: false // Must be approved by admin
        }]);

        if (error) throw error;
      }

      setRegSuccess(true);
      setRegName("");
      setRegSpecialty("");
      setRegArea("");
      setRegPhone("");
      setRegWhatsapp("");
      setRegBio("");
      setRegImageUrl("");
    } catch (err) {
      console.error(err);
      alert("فشل إرسال طلب الانضمام.");
    } finally {
      setRegSaving(false);
    }
  };

  // Filter lists based on states
  const filteredDoctors = doctors.filter((doc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchBio = doc.bio && doc.bio.toLowerCase().includes(q);
      const matchArea = doc.area && doc.area.toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchArea) return false;
    }
    if (selectedCity !== "الكل" && doc.city !== selectedCity) return false;
    if (selectedSpecialty !== "الكل") {
      const matchSpecialty = doc.specialty && doc.specialty.some(s => s.includes(selectedSpecialty));
      if (!matchSpecialty) return false;
    }
    if (filterOpenNow && !isDoctorOpenNow(doc.working_hours)) return false;
    return true;
  });

  const filteredStores = stores.filter((store) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = store.store_name.toLowerCase().includes(q);
      const matchDesc = store.description && store.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (selectedCity !== "الكل" && store.city !== selectedCity) return false;
    return true;
  });

  const filteredMarketplace = marketplace.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description && item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedCity !== "الكل" && item.city !== selectedCity) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Scrollable Body Content */}
      <ScrollView contentContainerStyle={styles.page}>
        {/* Premium Corporate Branding Header */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>أسناني.ps 🇵🇸</Text>
          <Text style={styles.title}>دليلك الفلسطيني الشامل للأسنان</Text>
          <Text style={styles.subtitle}>
            العيادات المعتمدة، مستلزمات طب الأسنان، عروض الخصم الحصرية، وسوق المعدات المستعملة في منصة موحدة فائقة السرعة.
          </Text>
        </View>

        {/* Categories / Navigation Tabs Swiper Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScrollRow}
        >
          <Pressable 
            onPress={() => { setActiveTab("doctors"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "doctors" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "doctors" && styles.tabButtonTextActive]}>👨‍⚕️ الأطباء والعيادات</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => { setActiveTab("stores"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "stores" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "stores" && styles.tabButtonTextActive]}>🏪 مستودعات الأجهزة</Text>
          </Pressable>

          <Pressable 
            onPress={() => { setActiveTab("offers"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "offers" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "offers" && styles.tabButtonTextActive]}>🏷️ العروض الجارية</Text>
          </Pressable>

          <Pressable 
            onPress={() => { setActiveTab("marketplace"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "marketplace" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "marketplace" && styles.tabButtonTextActive]}>🛒 سوق المستعمل</Text>
          </Pressable>

          <Pressable 
            onPress={() => { setActiveTab("blog"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "blog" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "blog" && styles.tabButtonTextActive]}>📚 مدونة الوقاية</Text>
          </Pressable>

          <Pressable 
            onPress={() => { setActiveTab("join"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "join" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "join" && styles.tabButtonTextActive]}>📝 سجّل عيادتك</Text>
          </Pressable>

          <Pressable 
            onPress={() => { setActiveTab("notifications"); setSearchQuery(""); }}
            style={[styles.tabButton, activeTab === "notifications" && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === "notifications" && styles.tabButtonTextActive]}>🔔 التنبيهات</Text>
          </Pressable>
        </ScrollView>

        {/* -------------------- 1. TAB: DOCTORS -------------------- */}
        {activeTab === "doctors" && (
          <View style={styles.tabContent}>
            {/* Active Ads Premium Slider */}
            {ads.length > 0 && (
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.adsContainer}>
                {ads.map((ad) => (
                  <View key={ad.id} style={styles.adSlide}>
                    <Image source={{ uri: ad.image_url || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80" }} style={styles.adImage as any} />
                    <View style={styles.adOverlay}>
                      <Text style={styles.adTitle}>{ad.title}</Text>
                      <Text style={styles.adBadge}>🔥 إعلان مميز</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Premium Filter Box */}
            <View style={styles.filterBox}>
              <TextInput
                placeholder="🔎 ابحث عن طبيب، منطقة، أو عيادة..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                textAlign="right"
              />
              
              <Text style={styles.sectionLabel}>📍 اختر المدينة الفلسطينية:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {CITIES.map((c) => {
                  const isSelected = selectedCity === c;
                  return (
                    <Pressable key={c} onPress={() => setSelectedCity(c)} style={[styles.chip, isSelected && styles.chipActive]}>
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionLabel}>🦷 اختر تخصص طب الأسنان:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {SPECIALTIES.map((s) => {
                  const isSelected = selectedSpecialty === s;
                  return (
                    <Pressable key={s} onPress={() => setSelectedSpecialty(s)} style={[styles.chip, isSelected && styles.chipActiveSecondary]}>
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{s}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable onPress={() => setFilterOpenNow(!filterOpenNow)} style={[styles.openFilterRow, filterOpenNow && styles.openFilterRowActive]}>
                <View style={[styles.dot, { backgroundColor: filterOpenNow ? "#10b981" : "#64748b" }]} />
                <Text style={[styles.openFilterText, filterOpenNow && styles.openFilterTextActive]}>
                  {filterOpenNow ? "عرض العيادات المفتوحة حالياً فقط ✅" : "إظهار العيادات المفتوحة الآن فقط"}
                </Text>
              </Pressable>
            </View>

            {/* Doctors Output Stack */}
            <Text style={styles.resultsCount}>🎯 تم العثور على ({filteredDoctors.length}) طبيب معتمد في فلسطين</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0d9488" style={{ marginVertical: 40 }} />
            ) : filteredDoctors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>لا توجد نتائج مطابقة لبحثك</Text>
                <Text style={styles.emptyDesc}>تأكد من ضبط فلاتر البحث والمدينة لرؤية الأطباء المعتمدين.</Text>
              </View>
            ) : (
              <View style={styles.stack}>
                {filteredDoctors.map((doc) => {
                  const isOpen = isDoctorOpenNow(doc.working_hours);
                  return (
                    <Link href={`/doctor/${doc.id}`} asChild key={doc.id}>
                      <Pressable style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Image source={{ uri: doc.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80" }} style={styles.avatar as any} />
                          <View style={styles.headerInfo}>
                            <View style={styles.nameRow}>
                              <Text style={styles.cardTitle}>{doc.name}</Text>
                              {doc.verified && <Text style={styles.verifiedBadge}>✔ موثق</Text>}
                            </View>
                            <View style={styles.specialtyRow}>
                              {doc.specialty && doc.specialty.map((s, i) => (
                                <Text key={i} style={styles.specialtyText}>{s}</Text>
                              ))}
                            </View>
                          </View>
                        </View>
                        <View style={styles.cardDetails}>
                          <Text style={styles.detailText}>📍 المقر: {doc.city} — {doc.area || "العنوان الرئيسي"}</Text>
                          {doc.accepts_insurance && doc.insurance_list && doc.insurance_list.length > 0 && (
                            <View style={styles.insuranceRow}>
                              <Text style={styles.insuranceTitle}>🛡️ التأمين المقبول:</Text>
                              {doc.insurance_list.map((ins, i) => (
                                <Text key={i} style={styles.insuranceBadge}>{ins}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                        <View style={styles.cardFooter}>
                          <View style={[styles.statusBadge, isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed]}>
                            <View style={[styles.pulseDot, { backgroundColor: isOpen ? "#10b981" : "#64748b" }]} />
                            <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>{isOpen ? "مفتوح الآن" : "مغلق حالياً"}</Text>
                          </View>
                          <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>⭐ {doc.rating || 5.0}</Text>
                          </View>
                        </View>
                      </Pressable>
                    </Link>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* -------------------- 2. TAB: STORES -------------------- */}
        {activeTab === "stores" && (
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
                {CITIES.map((c) => {
                  const isSelected = selectedCity === c;
                  return (
                    <Pressable key={c} onPress={() => setSelectedCity(c)} style={[styles.chip, isSelected && styles.chipActive]}>
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={styles.resultsCount}>🎯 تم العثور على ({filteredStores.length}) شركة ومستودع أجهزة معتمد</Text>
            
            {filteredStores.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>لا توجد متاجر مطابقة</Text>
              </View>
            ) : (
              <View style={styles.stack}>
                {filteredStores.map((store) => (
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
                      <Text style={styles.detailText}>📍 المقر الرئيسي: {store.city}</Text>
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
        )}

        {/* -------------------- 3. TAB: OFFERS -------------------- */}
        {activeTab === "offers" && (
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
        )}

        {/* -------------------- 4. TAB: MARKETPLACE -------------------- */}
        {activeTab === "marketplace" && (
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
            <Text style={styles.resultsCount}>🛒 أجهزة ومعدات أسنان مستعملة للبيع ({filteredMarketplace.length})</Text>

            {filteredMarketplace.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>لا توجد إعلانات مطابقة</Text>
              </View>
            ) : (
              <View style={styles.stack}>
                {filteredMarketplace.map((item) => (
                  <View key={item.id} style={styles.card}>
                    {item.image_url && <Image source={{ uri: item.image_url }} style={styles.offerImage as any} />}
                    <View style={styles.offerPromoRow}>
                      <Text style={styles.offerTitle}>{item.title}</Text>
                      <Text style={styles.priceTag}>{item.price} ₪</Text>
                    </View>
                    <Text style={styles.bioText}>{item.description}</Text>
                    <View style={styles.cardDetails}>
                      <Text style={styles.detailText}>📍 مكان تواجد الجهاز: {item.city}</Text>
                    </View>
                    <Pressable onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.button, { backgroundColor: "#0f172a", marginTop: 8 }]}>
                      <Text style={styles.buttonText}>📞 تواصل مع البائع مباشرة: {item.phone}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* -------------------- 5. TAB: BLOG -------------------- */}
        {activeTab === "blog" && (
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
        )}

        {/* -------------------- 6. TAB: JOIN -------------------- */}
        {activeTab === "join" && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📝 انضم كشريك في أسناني.ps</Text>
              <Text style={styles.bioText}>املأ الاستمارة أدناه لتسجيل عيادتك الطبية أو متجر المستلزمات الخاص بك مباشرة في البوابة الحية بانتظار توثيق وتفعيل الإدارة.</Text>
              
              {regSuccess ? (
                <View style={styles.successFormContainer}>
                  <Text style={styles.successFormTitle}>🎉 تم استلام طلبك بنجاح!</Text>
                  <Text style={styles.successFormDesc}>شكراً لانضمامك إلى شبكة أسناني.ps. سيقوم مسؤول البوابة بمراجعة مستنداتك وتفعيل عيادتك/متجرك للجمهور فوراً.</Text>
                  <Pressable onPress={() => setRegSuccess(false)} style={[styles.button, { backgroundColor: "#0f172a" }]}>
                    <Text style={styles.buttonText}>تسجيل حساب آخر</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.formToggle}>
                    <Pressable onPress={() => setRegType("doctor")} style={[styles.formToggleBtn, regType === "doctor" && styles.formToggleBtnActive]}>
                      <Text style={[styles.formToggleText, regType === "doctor" && styles.formToggleTextActive]}>👨‍⚕️ تسجيل طبيب</Text>
                    </Pressable>
                    <Pressable onPress={() => setRegType("store")} style={[styles.formToggleBtn, regType === "store" && styles.formToggleBtnActive]}>
                      <Text style={[styles.formToggleText, regType === "store" && styles.formToggleTextActive]}>🏪 تسجيل متجر</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.inputLabel}>{regType === "doctor" ? "الاسم الكامل للطبيب *:" : "اسم متجر المستلزمات *:"}</Text>
                  <TextInput value={regName} onChangeText={setRegName} placeholder="مثال: د. أحمد يوسف" style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>{regType === "doctor" ? "التخصص الرئيسي *:" : "مجال التخصص *:"}</Text>
                  <TextInput value={regSpecialty} onChangeText={setRegSpecialty} placeholder="مثال: زراعة وتقويم أسنان" style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>المدينة *:</Text>
                  <TextInput value={regCity} onChangeText={setRegCity} placeholder="رام الله، الخليل، نابلس..." style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>العنوان بالتفصيل:</Text>
                  <TextInput value={regArea} onChangeText={setRegArea} placeholder="مثال: شارع الإرسال، عمارة السلام" style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>رقم الهاتف:</Text>
                  <TextInput value={regPhone} onChangeText={setRegPhone} keyboardType="phone-pad" placeholder="مثال: 0599123456" style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>رقم واتساب الحجز/المبيعات:</Text>
                  <TextInput value={regWhatsapp} onChangeText={setRegWhatsapp} keyboardType="phone-pad" placeholder="مثال: +970599123456" style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>رابط الصورة الشخصية/شعار المتجر:</Text>
                  <TextInput value={regImageUrl} onChangeText={setRegImageUrl} placeholder="https://example.com/logo.jpg" style={styles.formInput} textAlign="right" />

                  <Text style={styles.inputLabel}>{regType === "doctor" ? "نبذة مهنية وسيرة ذاتية:" : "وصف الشركة ومستلزماتها:"}</Text>
                  <TextInput value={regBio} onChangeText={setRegBio} multiline numberOfLines={3} placeholder="اكتب نبذة هنا..." style={[styles.formInput, { height: 80 }]} textAlign="right" />

                  <Pressable disabled={regSaving} onPress={handleRegistrationSubmit} style={[styles.button, { backgroundColor: "#0d9488", marginTop: 8 }]}>
                    <Text style={styles.buttonText}>{regSaving ? "جاري إرسال طلبك..." : "💾 إرسال طلب الانضمام والتفعيل"}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* -------------------- 7. TAB: NOTIFICATIONS -------------------- */}
        {activeTab === "notifications" && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>🔔 مركز تنبيهات أسناني.ps</Text>
              <Text style={styles.bioText}>قم بتفعيل التنبيهات على هاتفك لتصلك إشعارات حية حول العروض والخصومات وحجوزات عيادتك فوراً.</Text>

              <View style={styles.notificationStatusBox}>
                <Text style={styles.statusLabelText}>حالة التنبيهات في الهاتف حالياً:</Text>
                <View style={[styles.statusIndicator, { backgroundColor: notificationsEnabled ? "#ecfdf5" : "#fef2f2" }]}>
                  <Text style={[styles.statusIndicatorText, { color: notificationsEnabled ? "#047857" : "#ef4444" }]}>
                    {notificationsEnabled ? "مفعلة ونشطة بالكامل ✅" : "غير مفعلة حالياً ❌"}
                  </Text>
                </View>
              </View>

              {!notificationsEnabled ? (
                <Pressable onPress={requestNotificationPermission} style={[styles.button, { backgroundColor: "#0d9488" }]}>
                  <Text style={styles.buttonText}>🔔 طلب الإذن وتفعيل التنبيهات الآن</Text>
                </Pressable>
              ) : (
                <View style={{ gap: 10 }}>
                  <Pressable onPress={triggerTestNotification} style={[styles.button, { backgroundColor: "#0f172a" }]}>
                    <Text style={styles.buttonText}>🚀 إرسال تنبيه تجريبي لهاتفي فوراً</Text>
                  </Pressable>
                  <Text style={styles.testDescText}>انقر على الزر أعلاه لتلقي إشعار فوري وتجربة نظام التنبيهات المعتمد في التطبيق.</Text>
                </View>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Persistent Bottom Tab Bar Floating Navigation Mock */}
      <View style={styles.bottomNav}>
        <Pressable onPress={() => setActiveTab("doctors")} style={[styles.bottomTabItem, activeTab === "doctors" && styles.bottomTabItemActive]}>
          <Text style={styles.bottomTabIcon}>👨‍⚕️</Text>
          <Text style={[styles.bottomTabText, activeTab === "doctors" && styles.bottomTabTextActive]}>الأطباء</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("stores")} style={[styles.bottomTabItem, activeTab === "stores" && styles.bottomTabItemActive]}>
          <Text style={styles.bottomTabIcon}>🏪</Text>
          <Text style={[styles.bottomTabText, activeTab === "stores" && styles.bottomTabTextActive]}>المتاجر</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("offers")} style={[styles.bottomTabItem, activeTab === "offers" && styles.bottomTabItemActive]}>
          <Text style={styles.bottomTabIcon}>🏷️</Text>
          <Text style={[styles.bottomTabText, activeTab === "offers" && styles.bottomTabTextActive]}>العروض</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("marketplace")} style={[styles.bottomTabItem, activeTab === "marketplace" && styles.bottomTabItemActive]}>
          <Text style={styles.bottomTabIcon}>🛒</Text>
          <Text style={[styles.bottomTabText, activeTab === "marketplace" && styles.bottomTabTextActive]}>المستعمل</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab("join")} style={[styles.bottomTabItem, activeTab === "join" && styles.bottomTabItemActive]}>
          <Text style={styles.bottomTabIcon}>📝</Text>
          <Text style={[styles.bottomTabText, activeTab === "join" && styles.bottomTabTextActive]}>انضمام</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa"
  },
  page: {
    padding: 16,
    gap: 16,
    backgroundColor: "#f4f6fa",
    paddingBottom: 110
  },
  header: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 24,
    gap: 8,
    alignItems: "flex-end",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0d9488",
    letterSpacing: 1.2
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "right"
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#cbd5e1",
    textAlign: "right",
    fontWeight: "600"
  },
  tabScrollRow: {
    flexDirection: "row-reverse",
    gap: 10,
    paddingVertical: 8
  },
  tabButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  tabButtonActive: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488"
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569"
  },
  tabButtonTextActive: {
    color: "#ffffff"
  },
  tabContent: {
    gap: 16
  },
  adsContainer: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden"
  },
  adSlide: {
    width: width - 32,
    height: 160,
    position: "relative"
  },
  adImage: {
    width: "100%",
    height: "100%"
  },
  adOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    padding: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  adTitle: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 13
  },
  adBadge: {
    backgroundColor: "#e11d48",
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
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
  chipActiveSecondary: {
    backgroundColor: "#0d9488",
    borderColor: "#0d9488"
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  openFilterRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10
  },
  openFilterRowActive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0"
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  openFilterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569"
  },
  openFilterTextActive: {
    color: "#065f46"
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
  nameRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a"
  },
  verifiedBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: "#10b981",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  specialtyRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 4
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
  insuranceRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center"
  },
  insuranceTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b"
  },
  insuranceBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  cardFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusBadgeOpen: {
    backgroundColor: "#ecfdf5"
  },
  statusBadgeClosed: {
    backgroundColor: "#f1f5f9"
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900"
  },
  statusTextOpen: {
    color: "#047857"
  },
  statusTextClosed: {
    color: "#475569"
  },
  ratingBadge: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#fde68a"
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309"
  },
  bioText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "right",
    lineHeight: 20
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
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900"
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
  expiryText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#d97706",
    textAlign: "right"
  },
  priceTag: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0d9488"
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900"
  },
  authorText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    textAlign: "right"
  },
  readMoreBtn: {
    alignSelf: "flex-end",
    marginTop: 6
  },
  readMoreBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0d9488"
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingBottom: 8,
    textAlign: "right"
  },
  formToggle: {
    flexDirection: "row-reverse",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 6,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  formToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center"
  },
  formToggleBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  formToggleText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b"
  },
  formToggleTextActive: {
    color: "#0f172a"
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#475569",
    textAlign: "right",
    marginTop: 8
  },
  formInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 6
  },
  successFormContainer: {
    padding: 20,
    alignItems: "center",
    gap: 12
  },
  successFormTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#10b981"
  },
  successFormDesc: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600"
  },
  formContainer: {
    gap: 10
  },
  notificationStatusBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 10
  },
  statusLabelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b"
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14
  },
  statusIndicatorText: {
    fontSize: 12,
    fontWeight: "900"
  },
  testDescText: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600"
  },
  bottomNav: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 75,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 0,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9"
  },
  bottomTabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16
  },
  bottomTabItemActive: {
    backgroundColor: "#f0fdfa"
  },
  bottomTabIcon: {
    fontSize: 20
  },
  bottomTabText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    marginTop: 2
  },
  bottomTabTextActive: {
    color: "#0d9488",
    fontWeight: "900"
  }
});

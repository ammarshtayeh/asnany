import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Pressable, 
  Text
} from "react-native";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

// Types
import { 
  Doctor, 
  Advertisement, 
  Store, 
  Offer, 
  MarketplaceAd, 
  Article 
} from "../types";

// Modular Subcomponents
import Header from "../components/Header";
import DoctorsTab from "../components/DoctorsTab";
import StoresTab from "../components/StoresTab";
import OffersTab from "../components/OffersTab";
import MarketplaceTab from "../components/MarketplaceTab";
import BlogTab from "../components/BlogTab";
import JoinTab from "../components/JoinTab";
import NotificationsTab from "../components/NotificationsTab";

export default function HomeScreen() {
  // Navigation active tab controller
  const [activeTab, setActiveTab] = useState<"doctors" | "stores" | "offers" | "marketplace" | "blog" | "join" | "notifications">("doctors");

  // Supabase lists state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceAd[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  // Self Registration State
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

  // Expanded blog article state
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

      // 2. Fetch Active Advertisements
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
        trigger: null,
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
          verified: false,
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
          is_active: false
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

  // Filter lists based on user search parameters
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
        <Header />

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

        {/* 1. Tab: Doctors Directory */}
        {activeTab === "doctors" && (
          <DoctorsTab 
            doctors={filteredDoctors}
            ads={ads}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            filterOpenNow={filterOpenNow}
            setFilterOpenNow={setFilterOpenNow}
            isDoctorOpenNow={isDoctorOpenNow}
          />
        )}

        {/* 2. Tab: Supply Stores */}
        {activeTab === "stores" && (
          <StoresTab 
            stores={filteredStores}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
          />
        )}

        {/* 3. Tab: Active Special Offers */}
        {activeTab === "offers" && (
          <OffersTab offers={offers} />
        )}

        {/* 4. Tab: Used Equipment Marketplace */}
        {activeTab === "marketplace" && (
          <MarketplaceTab 
            marketplace={filteredMarketplace}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* 5. Tab: Blog Articles */}
        {activeTab === "blog" && (
          <BlogTab 
            articles={articles}
            expandedBlog={expandedBlog}
            setExpandedBlog={setExpandedBlog}
          />
        )}

        {/* 6. Tab: Join Partners Portal */}
        {activeTab === "join" && (
          <JoinTab 
            regType={regType}
            setRegType={setRegType}
            regName={regName}
            setRegName={setRegName}
            regSpecialty={regSpecialty}
            setRegSpecialty={setRegSpecialty}
            regCity={regCity}
            setRegCity={setRegCity}
            regArea={regArea}
            setRegArea={setRegArea}
            regPhone={regPhone}
            setRegPhone={setRegPhone}
            regWhatsapp={regWhatsapp}
            setRegWhatsapp={setRegWhatsapp}
            regBio={regBio}
            setRegBio={setRegBio}
            regImageUrl={regImageUrl}
            setRegImageUrl={setRegImageUrl}
            regSuccess={regSuccess}
            setRegSuccess={setRegSuccess}
            regSaving={regSaving}
            handleRegistrationSubmit={handleRegistrationSubmit}
          />
        )}

        {/* 7. Tab: Push Notifications center */}
        {activeTab === "notifications" && (
          <NotificationsTab 
            notificationsEnabled={notificationsEnabled}
            requestNotificationPermission={requestNotificationPermission}
            triggerTestNotification={triggerTestNotification}
          />
        )}

      </ScrollView>

      {/* Persistent Bottom Tab Bar Floating Navigation */}
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

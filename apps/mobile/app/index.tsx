import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors, cities, specialties } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { doctorMapCoordinates } from "../lib/map-links";
import { Article, Doctor, MarketplaceAd, MedicalService, Offer, Store } from "../types";

type MainTab = "home" | "doctors" | "map" | "services" | "more";
type ServiceFilter = "all" | "booking" | "beauty" | "lab" | "consultation" | "partner" | "stores";
type UserLocation = { lat: number; lng: number };
type DistanceFilter = 0.5 | 1 | 3 | 5 | 10 | "all";
type QueryResult<T> = { data: T[] | null };

function withTimeout<T>(promise: Promise<T>, ms = 8000) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

const MOBILE_HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80";
const WEB_BASE_URL = "https://asnani.ps";
const OWNER_WHATSAPP = "9720595537190";
const OWNER_EMAIL = "ammar.shtayeh@gmail.com";

const distanceFilters: Array<{ value: DistanceFilter; label: string }> = [
  { value: 0.5, label: "0.5 كم" },
  { value: 1, label: "1 كم" },
  { value: 3, label: "3 كم" },
  { value: 5, label: "5 كم" },
  { value: 10, label: "10 كم" },
  { value: "all", label: "الكل" },
];

const mainTabs: Array<{ key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: "home", label: "الرئيسية", icon: "home-outline" },
  { key: "doctors", label: "الأطباء", icon: "medical-outline" },
  { key: "map", label: "الخريطة", icon: "map-outline" },
  { key: "services", label: "الخدمات", icon: "sparkles-outline" },
  { key: "more", label: "المزيد", icon: "grid-outline" },
];

const serviceFilters: Array<{ key: ServiceFilter; label: string; color: string }> = [
  { key: "all", label: "الكل", color: colors.sky },
  { key: "booking", label: "الحجز", color: colors.teal },
  { key: "beauty", label: "التجميل", color: colors.fuchsia },
  { key: "lab", label: "المختبرات", color: colors.violet },
  { key: "consultation", label: "استشارات", color: colors.sky },
  { key: "partner", label: "الشركاء", color: colors.rose },
  { key: "stores", label: "الموردون", color: colors.emerald },
];

const specialtyCards = [
  { label: "زراعة الأسنان", color: colors.sky },
  { label: "تقويم الأسنان", color: colors.emerald },
  { label: "تجميل الأسنان", color: colors.amber },
  { label: "أسنان الأطفال", color: colors.violet },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSpecialty, setSelectedSpecialty] = useState("الكل");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [market, setMarket] = useState<MarketplaceAd[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchData();
    checkLocationPermissionAndFetch();
  }, []);

  async function checkLocationPermissionAndFetch() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }
    } catch (e) {
      console.log("Auto-location error:", e);
    }
  }


  async function fetchData() {
    setLoading(true);
    try {
      if (!supabase) return;
      const today = new Date().toISOString();
      const [doctorsRes, storesRes, servicesRes, offersRes, marketRes, articlesRes] = await Promise.allSettled([
        withTimeout(Promise.resolve(supabase.from("doctors").select("*").eq("verified", true).order("is_featured", { ascending: false }))),
        withTimeout(Promise.resolve(supabase.from("stores").select("*").eq("is_active", true))),
        withTimeout(Promise.resolve(supabase.from("medical_services").select("*").eq("is_active", true).order("is_featured", { ascending: false }))),
        withTimeout(Promise.resolve(supabase.from("offers").select("*").gte("valid_until", today))),
        withTimeout(Promise.resolve(supabase.from("marketplace_ads").select("*").eq("is_active", true).order("is_featured", { ascending: false }))),
        withTimeout(Promise.resolve(supabase.from("articles").select("*").order("created_at", { ascending: false }))),
      ]);

      setDoctors(extractRows<Doctor>(doctorsRes));
      setStores(extractRows<Store>(storesRes));
      setServices(extractRows<MedicalService>(servicesRes));
      setOffers(extractRows<Offer>(offersRes));
      setMarket(extractRows<MarketplaceAd>(marketRes));
      setArticles(extractRows<Article>(articlesRes));
    } catch (error) {
      console.error("Mobile data error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function locateMe() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("صلاحية الموقع", "فعّل صلاحية الموقع حتى نرتب الأطباء حسب الأقرب لك.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setActiveTab("map");
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("تعذر تحديد الموقع", "تأكد من تفعيل GPS وخدمات الموقع ثم حاول مرة أخرى.");
    } finally {
      setLocating(false);
    }
  }

  const filteredDoctors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = doctors.filter((doctor) => {
      const text = `${doctor.name} ${doctor.city} ${doctor.area || ""} ${doctor.bio || ""} ${doctor.specialty?.join(" ") || ""}`.toLowerCase();
      const cityOk = selectedCity === "الكل" || doctor.city === selectedCity;
      const specialtyOk =
        selectedSpecialty === "الكل" || doctor.specialty?.some((item) => item.includes(selectedSpecialty));
      return cityOk && specialtyOk && (!needle || text.includes(needle));
    });

    if (!userLocation) return result;
    return [...result].sort((a, b) => distanceToDoctor(a, userLocation) - distanceToDoctor(b, userLocation));
  }, [doctors, query, selectedCity, selectedSpecialty, userLocation]);

  const filteredServices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const text = `${service.name} ${service.city || ""} ${service.category || ""} ${service.description || ""}`.toLowerCase();
      const typeOk = serviceFilter === "all" || service.service_type === serviceFilter;
      return typeOk && (!needle || text.includes(needle));
    });
  }, [query, serviceFilter, services]);

  const featuredDoctors = filteredDoctors.slice(0, 4);
  const featuredServices = filteredServices.slice(0, 4);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingTop: Math.max(insets.top + 12, 24), paddingBottom: insets.bottom + 156 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar />

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.sky} />
            <Text style={styles.loadingText}>جاري تجهيز تجربة أسناني...</Text>
          </View>
        ) : null}

        {!loading && activeTab === "home" ? (
          <HomeDashboard
            doctors={doctors}
            offers={offers}
            market={market}
            articles={articles}
            featuredDoctors={featuredDoctors}
            onOpenDoctors={() => setActiveTab("doctors")}
            onOpenMap={() => setActiveTab("map")}
            onOpenServices={(filter) => {
              setServiceFilter(filter);
              setActiveTab("services");
            }}
            setSelectedSpecialty={setSelectedSpecialty}
            userLocation={userLocation}
            locating={locating}
            onLocateMe={locateMe}
          />
        ) : null}

        {!loading && activeTab === "doctors" ? (
          <DoctorsScreen
            doctors={filteredDoctors}
            query={query}
            setQuery={setQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedSpecialty={selectedSpecialty}
            setSelectedSpecialty={setSelectedSpecialty}
            onOpenMap={() => setActiveTab("map")}
            userLocation={userLocation}
            locating={locating}
            onLocateMe={locateMe}
          />
        ) : null}

        {!loading && activeTab === "map" ? (
          <MapScreen
            doctors={filteredDoctors}
            userLocation={userLocation}
            locating={locating}
            onLocateMe={locateMe}
            onOpenDoctors={() => setActiveTab("doctors")}
          />
        ) : null}

        {!loading && activeTab === "services" ? (
          <ServicesScreen
            services={filteredServices}
            stores={stores}
            serviceFilter={serviceFilter}
            setServiceFilter={setServiceFilter}
            query={query}
            setQuery={setQuery}
          />
        ) : null}

        {!loading && activeTab === "more" ? (
          <MoreScreen offers={offers} market={market} articles={articles} onOpenServices={setServiceFilterAndOpen(setActiveTab, setServiceFilter)} />
        ) : null}
      </ScrollView>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} bottomInset={insets.bottom} />
    </View>
  );
}

function setServiceFilterAndOpen(
  setActiveTab: (tab: MainTab) => void,
  setServiceFilter: (filter: ServiceFilter) => void
) {
  return (filter: ServiceFilter) => {
    setServiceFilter(filter);
    setActiveTab("services");
  };
}

function getDistanceKm(from: UserLocation, to: UserLocation) {
  const radiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceToDoctor(doctor: Doctor, userLocation: UserLocation) {
  const coords = doctorMapCoordinates(doctor);
  return getDistanceKm(userLocation, { lat: coords.latitude, lng: coords.longitude });
}

function extractRows<T>(result: PromiseSettledResult<unknown>): T[] {
  if (result.status !== "fulfilled") {
    return [];
  }

  const value = result.value as { data?: T[] | null; error?: unknown } | null;
  if (!value || value.error) {
    return [];
  }

  return Array.isArray(value.data) ? value.data : [];
}

function formatDistance(doctor: Doctor, userLocation: UserLocation | null) {
  if (!userLocation) return null;
  const distance = distanceToDoctor(doctor, userLocation);
  if (!Number.isFinite(distance)) return null;
  return distance < 1 ? `${Math.round(distance * 1000)} م` : `${distance.toFixed(1)} كم`;
}

function openNativeMap(doctor: Doctor) {
  const coords = doctorMapCoordinates(doctor);
  const label = encodeURIComponent(doctor.name || "عيادة أسنان");
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${coords.latitude},${coords.longitude}&q=${label}`
      : `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;

  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`);
  });
}

function openWhatsApp(message: string) {
  Linking.openURL(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`);
}

function TopBar() {
  return (
    <View style={styles.topBar}>
      <View style={styles.logoMark}>
        <Text style={styles.logoText}>أ</Text>
      </View>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>أسناني.ps</Text>
        <Text style={styles.brandSub}>دليل رعاية الأسنان في فلسطين</Text>
      </View>
    </View>
  );
}

function HomeDashboard({
  doctors,
  offers,
  market,
  articles,
  featuredDoctors,
  onOpenDoctors,
  onOpenMap,
  onOpenServices,
  setSelectedSpecialty,
  userLocation,
  locating,
  onLocateMe,
}: {
  doctors: Doctor[];
  offers: Offer[];
  market: MarketplaceAd[];
  articles: Article[];
  featuredDoctors: Doctor[];
  onOpenDoctors: () => void;
  onOpenMap: () => void;
  onOpenServices: (filter: ServiceFilter) => void;
  setSelectedSpecialty: (value: string) => void;
  userLocation: UserLocation | null;
  locating: boolean;
  onLocateMe: () => void;
}) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  return (
    <View style={styles.stack}>
      <Animated.View
        style={[
          styles.hero,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Image source={{ uri: MOBILE_HERO_IMAGE_URL }} style={styles.heroImageBg} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>دليل أسنان فلسطين</Text>
          <Text style={styles.heroTitle}>الطبيب المناسب، أقرب وأسهل.</Text>
          <Text style={styles.heroText}>حدد موقعك، شاهد العيادات على الخريطة، وافتح الاتجاهات بتطبيق الخرائط على جهازك.</Text>
        </View>
        <View style={styles.heroActions}>
          <Pressable onPress={onOpenDoctors} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>ابحث عن طبيب</Text>
          </Pressable>
          <Pressable onPress={onLocateMe} disabled={locating} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{locating ? "جاري التحديد..." : userLocation ? "موقعي مفعل" : "حدد موقعي"}</Text>
          </Pressable>
        </View>
      </Animated.View>

      <View style={styles.homeSearchPanel}>
        <Text style={styles.homeSearchTitle}>شو بدك تعمل اليوم؟</Text>
        <View style={styles.homeActionGrid}>
          <Pressable onPress={onOpenDoctors} style={styles.homeAction}>
            <Ionicons name="medical-outline" size={22} color={colors.sky} />
            <Text style={styles.homeActionText}>طبيب</Text>
          </Pressable>
          <Pressable onPress={onOpenMap} style={styles.homeAction}>
            <Ionicons name="map-outline" size={22} color={colors.emerald} />
            <Text style={styles.homeActionText}>خريطة</Text>
          </Pressable>
          <Pressable onPress={() => onOpenServices("booking")} style={styles.homeAction}>
            <Ionicons name="calendar-clear-outline" size={22} color={colors.amber} />
            <Text style={styles.homeActionText}>حجز</Text>
          </Pressable>
          <Pressable onPress={() => onOpenServices("stores")} style={styles.homeAction}>
            <Ionicons name="storefront-outline" size={22} color={colors.violet} />
            <Text style={styles.homeActionText}>موردون</Text>
          </Pressable>
        </View>
      </View>

      <SectionHeader title="أطباء مقترحون" action="الكل" onPress={onOpenDoctors} />
      {featuredDoctors.length ? featuredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} userLocation={userLocation} />) : <EmptyState title="لا يوجد أطباء حالياً" />}

      <View style={styles.statsRow}>
        <StatCard value={doctors.length} label="طبيب" color={colors.sky} />
        <StatCard value={offers.length} label="عرض" color={colors.amber} />
        <StatCard value={market.length} label="إعلان سوق" color={colors.emerald} />
      </View>

      <View style={styles.joinPanel}>
        <View style={styles.flex}>
          <Text style={styles.joinTitle}>كن جزءاً من أسناني</Text>
          <Text style={styles.joinText}>سجل عيادتك أو شركتك لتظهر في الموقع والتطبيق بعد مراجعة الإدارة.</Text>
        </View>
        <Pressable onPress={() => Linking.openURL(`${WEB_BASE_URL}/doctors/register`)} style={styles.joinButton}>
          <Text style={styles.joinButtonText}>استمارة الطبيب</Text>
        </Pressable>
      </View>

      <SectionHeader title="الخريطة" action="فتح الخريطة" onPress={onOpenMap} />
      <MiniMap doctors={doctors.slice(0, 16)} userLocation={userLocation} compact />

      <SectionHeader title="تخصصات سريعة" />
      <View style={styles.categoryGrid}>
        {specialtyCards.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              setSelectedSpecialty(item.label);
              onOpenDoctors();
            }}
            style={styles.categoryCard}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${item.color}16` }]}>
              <Ionicons name="sparkles-outline" size={22} color={item.color} />
            </View>
            <Text style={styles.categoryTitle}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="خدمات الموقع" />
      <View style={styles.serviceShortcutGrid}>
        {serviceFilters.slice(1).map((item) => (
          <Pressable key={item.key} onPress={() => onOpenServices(item.key)} style={styles.shortcut}>
            <Text style={[styles.shortcutMark, { color: item.color }]}>●</Text>
            <Text style={styles.shortcutText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="آخر محتوى" />
      <InfoStrip label="المجلة" value={`${articles.length} مقال وخبر`} color={colors.violet} />
      <CreatorFooter />
    </View>
  );
}

function DoctorsScreen({
  doctors,
  query,
  setQuery,
  selectedCity,
  setSelectedCity,
  selectedSpecialty,
  setSelectedSpecialty,
  onOpenMap,
  userLocation,
  locating,
  onLocateMe,
}: {
  doctors: Doctor[];
  query: string;
  setQuery: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (value: string) => void;
  onOpenMap: () => void;
  userLocation: UserLocation | null;
  locating: boolean;
  onLocateMe: () => void;
}) {
  return (
    <View style={styles.stack}>
      <ScreenTitle title="الأطباء والعيادات" subtitle={`${doctors.length} نتيجة حسب الفلاتر`} />
      <SearchPanel query={query} setQuery={setQuery} placeholder="ابحث باسم طبيب، منطقة، أو تخصص" />
      <ChipRow values={cities} value={selectedCity} onChange={setSelectedCity} color={colors.sky} />
      <ChipRow values={specialties} value={selectedSpecialty} onChange={setSelectedSpecialty} color={colors.teal} />
      <View style={styles.doctorActionRow}>
        <Pressable onPress={onLocateMe} disabled={locating} style={styles.locationButton}>
          <Text style={styles.locationButtonText}>{locating ? "جاري تحديد موقعك..." : userLocation ? "رتب حسب الأقرب" : "حدد موقعي"}</Text>
        </Pressable>
        <Pressable onPress={onOpenMap} style={styles.locationButtonAlt}>
          <Text style={styles.locationButtonAltText}>الخريطة</Text>
        </Pressable>
      </View>
      <Pressable onPress={onOpenMap} style={styles.mapCallout}>
        <View>
          <Text style={styles.mapCalloutTitle}>الخريطة جاهزة</Text>
          <Text style={styles.mapCalloutText}>{userLocation ? "الأطباء مرتبون حسب الأقرب لموقعك." : "حدد موقعك لترتيب الأطباء حسب المسافة."}</Text>
        </View>
        <Text style={styles.mapCalloutAction}>فتح</Text>
      </Pressable>
      {doctors.length ? doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} userLocation={userLocation} />) : <EmptyState title="لا توجد نتائج مطابقة" />}
    </View>
  );
}

function MapScreen({
  doctors,
  userLocation,
  locating,
  onLocateMe,
  onOpenDoctors,
}: {
  doctors: Doctor[];
  userLocation: UserLocation | null;
  locating: boolean;
  onLocateMe: () => void;
  onOpenDoctors: () => void;
}) {
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(0.5);
  const doctorsWithLocation = doctors.filter((doctor) => {
    const coords = doctorMapCoordinates(doctor);
    return Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude);
  });
  const nearbyDoctors = useMemo(() => {
    if (!userLocation || distanceFilter === "all") return doctorsWithLocation;
    return doctorsWithLocation.filter((doctor) => distanceToDoctor(doctor, userLocation) <= distanceFilter);
  }, [distanceFilter, doctorsWithLocation, userLocation]);

  return (
    <View style={styles.stack}>
      <ScreenTitle
        title="خريطة العيادات"
        subtitle={userLocation ? `${nearbyDoctors.length} عيادة ضمن النطاق المحدد` : "حدد موقعك لتصفية الأقرب من 0.5 كم وما فوق"}
      />
      <MiniMap doctors={nearbyDoctors} userLocation={userLocation} />
      <View style={styles.distancePanel}>
        <View style={styles.distanceHeader}>
          <Text style={styles.distanceTitle}>نطاق البحث</Text>
          <Text style={styles.distanceHint}>{userLocation ? "ابدأ من نصف كيلو ووسّع النطاق" : "فعّل موقعك أولاً"}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.distanceChips}>
          {distanceFilters.map((item) => {
            const active = distanceFilter === item.value;
            return (
              <Pressable
                key={String(item.value)}
                onPress={() => setDistanceFilter(item.value)}
                style={[styles.distanceChip, active && styles.distanceChipActive]}
              >
                <Text style={[styles.distanceChipText, active && styles.distanceChipTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.heroActions}>
        <Pressable onPress={onLocateMe} disabled={locating} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{locating ? "جاري التحديد..." : userLocation ? "تحديث موقعي" : "حدد موقعي"}</Text>
        </Pressable>
        <Pressable onPress={onOpenDoctors} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>قائمة الأطباء</Text>
        </Pressable>
      </View>
      <View style={styles.stack}>
        {nearbyDoctors.slice(0, 8).map((doctor) => (
          <MapDoctorRow key={doctor.id} doctor={doctor} userLocation={userLocation} />
        ))}
      </View>
    </View>
  );
}

function ServicesScreen({
  services,
  stores,
  serviceFilter,
  setServiceFilter,
  query,
  setQuery,
}: {
  services: MedicalService[];
  stores: Store[];
  serviceFilter: ServiceFilter;
  setServiceFilter: (value: ServiceFilter) => void;
  query: string;
  setQuery: (value: string) => void;
}) {
  const showingStores = serviceFilter === "stores";
  return (
    <View style={styles.stack}>
      <ScreenTitle title="الخدمات" subtitle="حجز، تجميل، مختبرات، استشارات، شركاء وموردون" />
      <SearchPanel query={query} setQuery={setQuery} placeholder="ابحث عن خدمة أو شركة" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {serviceFilters.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setServiceFilter(item.key)}
            style={[styles.chip, serviceFilter === item.key && { backgroundColor: item.color, borderColor: item.color }]}
          >
            <Text style={[styles.chipText, serviceFilter === item.key && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {showingStores ? (
        stores.length ? stores.map((store) => <StoreCard key={store.id} store={store} />) : <EmptyState title="لا يوجد موردون حالياً" />
      ) : services.length ? (
        services.map((service) => <ServiceCard key={service.id} service={service} />)
      ) : (
        <EmptyState title="لا توجد خدمات مطابقة" />
      )}
    </View>
  );
}

function MoreScreen({
  offers,
  market,
  articles,
  onOpenServices,
}: {
  offers: Offer[];
  market: MarketplaceAd[];
  articles: Article[];
  onOpenServices: (filter: ServiceFilter) => void;
}) {
  return (
    <View style={styles.stack}>
      <ScreenTitle title="المزيد" subtitle="العروض، السوق، المجلة، الإعلان والانضمام" />
      <SectionHeader title="العروض" />
      {offers.length ? offers.slice(0, 4).map((offer) => <OfferCard key={offer.id} offer={offer} />) : <EmptyState title="لا توجد عروض نشطة" />}
      <SectionHeader title="سوق أسناني" />
      {market.length ? market.slice(0, 4).map((item) => <MarketCard key={item.id} item={item} />) : <EmptyState title="لا توجد إعلانات سوق" />}
      <SectionHeader title="المجلة" />
      {articles.length ? articles.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} />) : <EmptyState title="لا يوجد محتوى حالياً" />}
      <AdvertiseCard />
      <Pressable onPress={() => onOpenServices("partner")} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>الشركاء والخدمات</Text>
      </Pressable>
      <ExternalButton label="استمارة تسجيل طبيب" url={`${WEB_BASE_URL}/doctors/register`} color={colors.teal} />
      <CreatorFooter />
    </View>
  );
}

function AdvertiseCard() {
  return (
    <View style={styles.advertiseCard}>
      <View style={styles.advertiseIcon}>
        <Ionicons name="megaphone-outline" size={24} color={colors.amber} />
      </View>
      <Text style={styles.advertiseTitle}>أعلن معنا</Text>
      <Text style={styles.advertiseText}>
        اختر طبيعة الإعلان: بنر، عرض طبي، ترويج عيادة، إعلان سوق أو وظيفة. املأ الاستمارة أو تواصل واتساب مباشرة.
      </Text>
      <View style={styles.advertiseActions}>
        <Pressable onPress={() => Linking.openURL(`${WEB_BASE_URL}/advertise`)} style={styles.advertisePrimary}>
          <Text style={styles.advertisePrimaryText}>استمارة إلكترونية</Text>
        </Pressable>
        <Pressable
          onPress={() => openWhatsApp("مرحباً أسناني، أرغب بالإعلان. أريد تحديد نوع وطبيعة الإعلان.")}
          style={styles.advertiseWhatsapp}
        >
          <Text style={styles.advertiseWhatsappText}>واتساب</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MiniMap({
  doctors,
  userLocation,
  compact = false,
}: {
  doctors: Doctor[];
  userLocation?: UserLocation | null;
  compact?: boolean;
}) {
  const points = doctors.slice(0, compact ? 10 : 28);
  const center = userLocation || (() => {
    const first = points[0];
    if (!first) return { lat: 31.9522, lng: 35.2332 };
    const coords = doctorMapCoordinates(first);
    return { lat: coords.latitude, lng: coords.longitude };
  })();
  const latitudeDelta = compact ? 0.72 : 1.4;
  const longitudeDelta = compact ? 0.54 : 1.0;

  return (
    <View style={[styles.mapCard, compact && styles.mapCardCompact]}>
      <MapView
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.nativeMap}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta,
          longitudeDelta,
        }}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {points.map((doctor, index) => (
          <Marker
            key={doctor.id}
            coordinate={{ latitude: doctor.lat, longitude: doctor.lng }}
            title={doctor.name}
            description={`${doctor.city || ""}${doctor.area ? ` - ${doctor.area}` : ""}`}
            onCalloutPress={() => openNativeMap(doctor)}
          >
            <View style={[styles.nativeMarker, { backgroundColor: index < 4 ? colors.sky : colors.emerald }]}>
              <Text style={styles.nativeMarkerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}
        {userLocation ? (
          <Marker coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }} title="موقعي">
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View style={{
                position: "absolute",
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(225, 29, 72, 0.2)",
                borderWidth: 1.5,
                borderColor: "rgba(225, 29, 72, 0.4)",
              }} />
              <View style={{
                backgroundColor: "#fff",
                padding: 6,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: colors.rose,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 6,
              }}>
                <Ionicons name="location-sharp" size={20} color={colors.rose} />
              </View>
            </View>
          </Marker>
        ) : null}
      </MapView>
      <View style={styles.mapFloatingHeader}>
        <Text style={styles.mapFloatingTitle}>{points.length ? `${points.length} عيادة على الخريطة` : "الخريطة جاهزة"}</Text>
        <Text style={styles.mapFloatingText}>{userLocation ? "موقعك ظاهر باللون الأحمر" : "حدد موقعك لعرض الأقرب"}</Text>
      </View>
    </View>
  );
}

function DoctorCard({ doctor, userLocation }: { doctor: Doctor; userLocation?: UserLocation | null }) {
  const distance = formatDistance(doctor, userLocation || null);
  return (
    <Link href={`/doctor/${doctor.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.row}>
          <Image
            source={{ uri: doctor.image_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop" }}
            style={styles.avatar}
          />
          <View style={styles.flex}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>{doctor.name}</Text>
              {doctor.verified ? <Badge label="موثق" color={colors.emerald} /> : null}
            </View>
            <Text style={styles.cardMeta}>{doctor.specialty?.join("، ") || "طب أسنان عام"}</Text>
            <Text style={styles.cardText}>{doctor.city}{doctor.area ? ` - ${doctor.area}` : ""}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.footerBadges}>
            <Badge label={`تقييم ${doctor.rating || 5}`} color={colors.amber} />
            {distance !== null ? <Badge label={distance} color={colors.sky} /> : null}
          </View>
          <Pressable onPress={() => openNativeMap(doctor)} style={styles.mapOpenButton}>
            <Text style={styles.mapOpenButtonText}>الاتجاهات</Text>
          </Pressable>
        </View>
      </Pressable>
    </Link>
  );
}

function MapDoctorRow({ doctor, userLocation }: { doctor: Doctor; userLocation: UserLocation | null }) {
  const distance = formatDistance(doctor, userLocation);
  return (
    <View style={styles.mapRow}>
      <View style={styles.mapRowPin} />
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{doctor.name}</Text>
        <Text style={styles.cardMeta}>{doctor.city}{doctor.area ? ` - ${doctor.area}` : ""}{distance !== null ? ` • ${distance}` : ""}</Text>
      </View>
      <Pressable onPress={() => openNativeMap(doctor)} style={[styles.contactButton, styles.contactButtonCompact]}>
        <Text style={styles.contactText}>خرائط</Text>
      </Pressable>
    </View>
  );
}

function ServiceCard({ service }: { service: MedicalService }) {
  return (
    <View style={styles.card}>
      {service.image_url ? <Image source={{ uri: service.image_url }} style={styles.heroImage} /> : null}
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>{service.name}</Text>
        <Badge label={service.category || service.service_type} color={colors.sky} />
      </View>
      {service.description ? <Text style={styles.description}>{service.description}</Text> : null}
      <Text style={styles.cardMeta}>{service.city || "فلسطين"}{service.area ? ` - ${service.area}` : ""}</Text>
      {service.phone || service.whatsapp ? <ContactButton phone={service.phone || service.whatsapp || ""} /> : null}
    </View>
  );
}

function StoreCard({ store }: { store: Store }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{ uri: store.logo_url || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&auto=format&fit=crop" }}
          style={styles.avatar}
        />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{store.store_name}</Text>
          <Text style={styles.cardMeta}>{store.specialization || "مستلزمات طبية"}</Text>
          <Text style={styles.cardText}>{store.city || "فلسطين"}</Text>
        </View>
      </View>
      {store.description ? <Text style={styles.description}>{store.description}</Text> : null}
      {store.phone || store.whatsapp ? <ContactButton phone={store.phone || store.whatsapp} /> : null}
    </View>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const discount = offer.discount_percentage ?? offer.discount_pct ?? 0;
  return (
    <View style={styles.card}>
      {offer.image_url ? <Image source={{ uri: offer.image_url }} style={styles.heroImage} /> : null}
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>{offer.title}</Text>
        <Badge label={`خصم ${discount}%`} color={colors.rose} />
      </View>
      <Text style={styles.description}>{offer.description}</Text>
      <Text style={styles.cardMeta}>{offer.doctor_name || "عرض طبي"}</Text>
    </View>
  );
}

function MarketCard({ item }: { item: MarketplaceAd }) {
  return (
    <View style={styles.card}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.heroImage} /> : null}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Badge label={item.type === "job" ? "وظيفة" : item.price ? String(item.price) : "معدات"} color={colors.emerald} />
        <Text style={styles.cardMeta}>{item.city || "فلسطين"}</Text>
      </View>
      {item.phone ? <ContactButton phone={item.phone} /> : null}
    </View>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <View style={styles.card}>
      {article.image_url ? <Image source={{ uri: article.image_url }} style={styles.heroImage} /> : null}
      <Badge label={article.category || "توعية"} color={colors.violet} />
      <Text style={styles.cardTitle}>{article.title}</Text>
      <Text style={styles.description} numberOfLines={3}>{article.excerpt || article.content}</Text>
    </View>
  );
}

function SearchPanel({
  query,
  setQuery,
  placeholder,
}: {
  query: string;
  setQuery: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchBox}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={styles.searchInput}
        textAlign="right"
      />
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

function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      {action && onPress ? (
        <Pressable onPress={onPress}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : <View />}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.screenTitleBlock}>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenSubtitle}>{subtitle}</Text>
    </View>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}14`, borderColor: `${color}28` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function InfoStrip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.infoStrip}>
      <Badge label={label} color={color} />
      <Text style={styles.infoStripText}>{value}</Text>
    </View>
  );
}

function ContactButton({ phone, compact = false }: { phone: string; compact?: boolean }) {
  return (
    <Pressable onPress={() => Linking.openURL(`tel:${phone}`)} style={[styles.contactButton, compact && styles.contactButtonCompact]}>
      <Text style={styles.contactText}>{compact ? "اتصال" : `اتصال مباشر: ${phone}`}</Text>
    </Pressable>
  );
}

function ExternalButton({ label, url, color }: { label: string; url: string; color: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} style={[styles.contactButton, { backgroundColor: color }]}>
      <Text style={styles.contactText}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>جرّب تغيير الفلاتر أو تحديث البيانات من لوحة الإدارة.</Text>
    </View>
  );
}

function CreatorFooter() {
  return (
    <View style={styles.creatorFooter}>
      <Text style={styles.creatorTitle}>أسناني.ps</Text>
      <Text style={styles.creatorText}>الموقع والتطبيق باسم عمار اشتية</Text>
      <Text style={styles.creatorContact}>{OWNER_EMAIL}</Text>
      <Pressable onPress={() => openWhatsApp("مرحباً عمار، تواصل بخصوص منصة أسناني.")}>
        <Text style={styles.creatorWhatsapp}>واتساب: {OWNER_WHATSAPP}</Text>
      </Pressable>
    </View>
  );
}

function BottomNav({
  activeTab,
  setActiveTab,
  bottomInset,
}: {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 12) }]}>
      {mainTabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.bottomItem, active && styles.bottomItemActive]}>
            <Ionicons name={tab.icon} size={20} color={active ? colors.sky : colors.muted} />
            <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
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
  stack: {
    gap: 14,
  },
  topBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.sky,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  brandBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  brand: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  brandSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
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
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 26,
    padding: 22,
    gap: 20,
    overflow: "hidden",
  },
  heroImageBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.42,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
  },
  heroCopy: {
    alignItems: "flex-end",
    gap: 8,
  },
  kicker: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: "900",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 27,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "right",
  },
  heroText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "right",
  },
  heroActions: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: colors.sky,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  homeSearchPanel: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeSearchTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
  },
  homeActionGrid: {
    flexDirection: "row-reverse",
    gap: 9,
  },
  homeAction: {
    flex: 1,
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  homeActionText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  joinPanel: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  joinTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
  },
  joinText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4,
    textAlign: "right",
  },
  joinButton: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },
  sectionAction: {
    color: colors.sky,
    fontSize: 13,
    fontWeight: "900",
  },
  screenTitleBlock: {
    alignItems: "flex-end",
    gap: 4,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "right",
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  searchBox: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 10,
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
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: "#f8fafc",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  chipTextActive: {
    color: "#fff",
  },
  categoryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-end",
    gap: 10,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },
  serviceShortcutGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
  },
  shortcut: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  shortcutMark: {
    fontSize: 16,
  },
  shortcutText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  mapCard: {
    height: 420,
    backgroundColor: "#dbeafe",
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#bae6fd",
    position: "relative",
  },
  mapCardCompact: {
    height: 245,
  },
  nativeMap: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFloatingHeader: {
    position: "absolute",
    top: 12,
    right: 16,
    left: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: "flex-end",
  },
  distancePanel: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  distanceTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  distanceHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
    flex: 1,
  },
  distanceChips: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  distanceChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  distanceChipActive: {
    backgroundColor: colors.sky,
    borderColor: colors.sky,
  },
  distanceChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  distanceChipTextActive: {
    color: "#fff",
  },
  mapFloatingTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  mapFloatingText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "right",
  },
  nativeMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  nativeMarkerText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  nativeUserMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(225, 29, 72, 0.18)",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nativeUserMarkerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.rose,
  },
  mapCallout: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapCalloutTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  mapCalloutText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "right",
  },
  mapCalloutAction: {
    color: "#7dd3fc",
    fontSize: 14,
    fontWeight: "900",
  },
  mapRow: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  mapRowPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.sky,
  },
  doctorActionRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  locationButton: {
    flex: 1.3,
    backgroundColor: colors.sky,
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: "center",
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  locationButtonAlt: {
    flex: 0.7,
    backgroundColor: colors.card,
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationButtonAltText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
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
    height: 152,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    lineHeight: 23,
    flexShrink: 1,
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
  footerBadges: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  mapOpenButton: {
    backgroundColor: colors.ink,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  mapOpenButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
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
  linkText: {
    color: colors.sky,
    fontSize: 12,
    fontWeight: "900",
  },
  infoStrip: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoStripText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  contactButton: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  contactButtonCompact: {
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  contactText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  advertiseCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  advertiseIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  advertiseTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
  },
  advertiseText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "right",
  },
  advertiseActions: {
    flexDirection: "row-reverse",
    gap: 10,
    marginTop: 4,
  },
  advertisePrimary: {
    flex: 1,
    backgroundColor: colors.amber,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  advertisePrimaryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  advertiseWhatsapp: {
    flex: 1,
    backgroundColor: colors.emerald,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  advertiseWhatsappText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  creatorFooter: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    gap: 4,
  },
  creatorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  creatorText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  creatorContact: {
    color: "#7dd3fc",
    fontSize: 12,
    fontWeight: "900",
  },
  creatorWhatsapp: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 24,
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
  bottomNav: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    backgroundColor: "rgba(255,255,255,0.98)",
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
    minWidth: 58,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 2,
  },
  bottomItemActive: {
    backgroundColor: "#e0f2fe",
  },
  bottomLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
  },
  bottomLabelActive: {
    color: colors.sky,
  },
});

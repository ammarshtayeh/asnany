"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck2,
  ChevronDown,
  Clock,
  Ear,
  Eye,
  HeartPulse,
  MapPin,
  MessageCircle,
  Navigation,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import AdSlider from "@/components/AdSlider";
import { CITIES, HOME_DOCTORS_PAGE_SIZE } from "@/lib/constants";
import { cityMatchesFilter } from "@/lib/city-match";
import { getDistance } from "@/lib/distance";
import { doctorMapCoordinates } from "@/lib/map-links";
import { requestAccuratePosition, type UserMapLocation } from "@/lib/geolocation";
import { Advertisement, Doctor } from "@/lib/types";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { trackWhatsAppLead } from "@/lib/whatsapp-lead";

const TransformationsSection = dynamic(() => import("@/components/TransformationsSection"), { ssr: false });

// TransformationsSection hidden until real before/after content exists
const SHOW_TRANSFORMATIONS = false;

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-sm font-bold text-slate-500">جاري تحميل الخريطة...</span>
    </div>
  ),
});

const HERO_IMAGE_URL = "/brand/hero-clinic.png";

const QUICK_CATEGORIES = [
  { id: "dental", label: "أسنان", icon: Stethoscope, color: "text-primary", bg: "bg-primary/10" },
  { id: "derma", label: "جلدية", icon: ShieldCheck, color: "text-[#0a4d3a]", bg: "bg-[#e8f2ee]" },
  { id: "beauty", label: "تجميل", icon: Sparkles, color: "text-[#b8962e]", bg: "bg-[#f7f1e0]" },
  { id: "eyes", label: "عيون", icon: Eye, color: "text-primary", bg: "bg-primary/10" },
  { id: "ent", label: "أنف وأذن وحنجرة", icon: Ear, color: "text-[#1a7a64]", bg: "bg-[#eef6f3]" },
];

const PALESTINIAN_INSURANCES = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

const HOW_IT_WORKS = [
  { title: "ابحث", desc: "اختر التخصص والمدينة، أو رتّب النتائج حسب الأقرب لك.", icon: Search },
  { title: "قارن الخيارات", desc: "راجع التخصص، التقييم، الدوام والتأمين.", icon: ShieldCheck },
  { title: "احجز أو تواصل", desc: "اطلب موعدك من صفحة الطبيب أو راسل العيادة على واتساب.", icon: CalendarCheck2 },
];

const WORK_STATUS_VALUES = ["open", "closed"] as const;

function listingTier(doctor: Doctor) {
  return Number(doctor.listing_tier) || 0;
}

function isDoctorOpenNow(workingHours: any): boolean {
  if (!workingHours) return false;

  try {
    const now = new Date();
    const options = { timeZone: "Asia/Hebron", hour12: false };
    const formatter = new Intl.DateTimeFormat("ar-EG-u-ca-gregory", {
      ...options,
      weekday: "long",
    });
    const hourFormatter = new Intl.DateTimeFormat("en-US", {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
    });

    const dayNameAr = formatter.format(now);
    const timeStr = hourFormatter.format(now);
    const normalizedDay =
      dayNameAr.includes("سبت") ? "السبت" :
      dayNameAr.includes("أحد") ? "الأحد" :
      dayNameAr.includes("اثنين") ? "الإثنين" :
      dayNameAr.includes("ثلاثاء") ? "الثلاثاء" :
      dayNameAr.includes("أربعاء") ? "الأربعاء" :
      dayNameAr.includes("خميس") ? "الخميس" :
      dayNameAr.includes("جمعة") ? "الجمعة" : dayNameAr;

    const dayHours = workingHours[normalizedDay] || workingHours[dayNameAr];
    if (!dayHours || dayHours.includes("مغلق") || dayHours.includes("Closed")) return false;

    const parts = dayHours.split("-").map((part: string) => part.trim());
    if (parts.length !== 2) return true;

    const parseTime = (value: string): number => {
      const timeParts = value.split(" ");
      if (timeParts.length < 2) return 0;
      const [hStr, mStr] = timeParts[0].split(":");
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      const isPm = timeParts[1].includes("م") || timeParts[1].toLowerCase().includes("pm");
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
      return h * 60 + m;
    };

    const [nowH, nowM] = timeStr.split(":").map(Number);
    const nowMinutes = nowH * 60 + nowM;
    return nowMinutes >= parseTime(parts[0]) && nowMinutes <= parseTime(parts[1]);
  } catch (error) {
    console.error("Error parsing hours:", error);
    return true;
  }
}

export default function HomeClient({ initialDoctors }: { initialDoctors: Doctor[] }) {
  // The server sends the top-ranked doctors so the list is visible on first paint;
  // the full list replaces it once /api/doctors answers.
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(initialDoctors.length === 0);
  const [fullListLoaded, setFullListLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(HOME_DOCTORS_PAGE_SIZE);
  const [locationError, setLocationError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<"any" | "open" | "closed">("any");
  const [userLoc, setUserLoc] = useState<UserMapLocation | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [publicStats, setPublicStats] = useState({ verifiedProviders: 0, appointments: 0, cities: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const [doctorsRes, adsRes, statsRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/advertisements"),
          fetch("/api/stats/public"),
        ]);
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        }
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(Array.isArray(adsData) ? adsData : []);
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setPublicStats({
            verifiedProviders: Number(statsData.verifiedProviders) || 0,
            appointments: Number(statsData.appointments) || 0,
            cities: Number(statsData.cities) || 0,
          });
        }
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
        setFullListLoaded(true);
      }
    }

    loadData();
  }, []);

  // Filters live in the URL so a filtered view can be shared (e.g. /?city=نابلس&specialty=أسنان).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim().slice(0, 80);
    const city = params.get("city") || "";
    const specialty = (params.get("specialty") || "").trim().slice(0, 60);
    const insurance = params.get("insurance") || "";
    const status = params.get("status") || "";

    const validCity = CITIES.includes(city) ? city : "";
    const validInsurance = PALESTINIAN_INSURANCES.includes(insurance) ? insurance : "";
    const validStatus = WORK_STATUS_VALUES.find((value) => value === status);

    if (q) setSearchQuery(q);
    if (validCity) setSelectedCity(validCity);
    if (specialty) setSelectedSpecialty(specialty);
    if (validInsurance) setSelectedInsurance(validInsurance);
    if (validStatus) setSelectedWorkStatus(validStatus);
    setMounted(true);

    if (q || validCity || specialty || validInsurance || validStatus) {
      requestAnimationFrame(() => document.getElementById("doctors")?.scrollIntoView({ block: "start" }));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const entries: Array<[string, string]> = [
        ["q", searchQuery.trim()],
        ["city", selectedCity],
        ["specialty", selectedSpecialty],
        ["insurance", selectedInsurance],
        ["status", selectedWorkStatus === "any" ? "" : selectedWorkStatus],
      ];
      for (const [key, value] of entries) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const query = params.toString();
      const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next !== current) window.history.replaceState(null, "", next);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [mounted, searchQuery, selectedCity, selectedSpecialty, selectedInsurance, selectedWorkStatus]);

  useEffect(() => {
    setVisibleCount(HOME_DOCTORS_PAGE_SIZE);
  }, [searchQuery, selectedCity, selectedSpecialty, selectedInsurance, selectedWorkStatus, userLoc]);

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];
    const needle = searchQuery.trim().toLowerCase();

    if (needle) {
      result = result.filter((doc) =>
        [doc.name, doc.city, doc.area, doc.bio, ...(Array.isArray(doc.specialty) ? doc.specialty : [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
    if (selectedCity) {
      result = result.filter(
        (doc) => cityMatchesFilter(doc.city, selectedCity) || cityMatchesFilter(doc.area, selectedCity)
      );
    }
    if (selectedSpecialty) {
      result = result.filter((doc) =>
        (Array.isArray(doc.specialty) && doc.specialty.some((specialty) => specialty === selectedSpecialty)) ||
        doc.category === selectedSpecialty
      );
    }
    if (selectedInsurance) {
      result = result.filter((doc) => doc.accepts_insurance && doc.insurance_list?.includes(selectedInsurance));
    }
    if (selectedWorkStatus === "open") result = result.filter((doc) => isDoctorOpenNow(doc.working_hours));
    if (selectedWorkStatus === "closed") result = result.filter((doc) => !isDoctorOpenNow(doc.working_hours));

    if (userLoc) {
      result = result.map((doc) => ({
        ...doc,
        distance: (() => {
          const coords = doctorMapCoordinates(doc);
          return getDistance(userLoc.lat, userLoc.lng, coords.latitude, coords.longitude);
        })(),
      }));
      result.sort((a, b) => {
        const distanceA = a.distance ?? Number.POSITIVE_INFINITY;
        const distanceB = b.distance ?? Number.POSITIVE_INFINITY;
        return distanceA - distanceB;
      });
    } else {
      // Subscribed clinics first (package tier), then by rating inside each tier.
      result.sort((a, b) => listingTier(b) - listingTier(a) || (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [doctors, searchQuery, selectedCity, selectedInsurance, selectedSpecialty, selectedWorkStatus, userLoc]);

  const visibleDoctors = filteredDoctors.slice(0, visibleCount);
  const hiddenDoctorsCount = filteredDoctors.length - visibleDoctors.length;
  // Until the full list arrives, an empty match on the preloaded doctors is not a real "no results".
  const showSkeleton = loading || (!fullListLoaded && filteredDoctors.length === 0);

  const hasActiveFilters =
    searchQuery || selectedCity || selectedSpecialty || selectedInsurance || selectedWorkStatus !== "any";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedSpecialty("");
    setSelectedInsurance("");
    setSelectedWorkStatus("any");
  };

  const applySuggestion = (suggestion: string) => {
    resetFilters();
    if (CITIES.includes(suggestion)) setSelectedCity(suggestion);
    else setSelectedSpecialty(suggestion);
  };

  const handleLocationSearch = () => {
    setLocationError("");
    void requestAccuratePosition()
      .then((location) => setUserLoc(location))
      .catch(() => setLocationError("تعذر الوصول إلى الموقع. فعّل GPS/الموقع بدقة عالية وحاول مجدداً."));
  };

  const selectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      <section className="section-shell relative isolate pb-4 pt-2 sm:pt-4" dir="rtl">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="order-2 text-right lg:order-1">
            <motion.p
              className="section-kicker"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              ملامح.ps
            </motion.p>
            <motion.h1
              className="mt-3 font-display text-[1.85rem] font-extrabold leading-[1.25] tracking-tight text-[#0a1628] sm:text-4xl md:text-5xl lg:text-[3.15rem]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              ابحث عن الطبيب المناسب لوجهك وأسنانك
            </motion.h1>
            <motion.p
              className="mt-4 max-w-lg text-base font-semibold leading-8 text-slate-600 sm:text-lg"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              دليل لأطباء الأسنان، العيون، الجلدية، التجميل، والأنف والأذن في فلسطين — ابحث، قارن، واحجز في مكان واحد.
            </motion.p>
            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
            >
              <button
                type="button"
                onClick={() => document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="btn-malama"
              >
                <Search className="h-4 w-4" />
                ابدأ البحث
              </button>
              <Link href="/join" className="btn-malama-outline">
                انضم كطبيب
              </Link>
            </motion.div>
            {publicStats.verifiedProviders > 0 ? (
              <p className="mt-6 text-sm font-bold text-slate-500">
                <span className="font-extrabold text-primary">
                  <AnimatedCounter target={publicStats.verifiedProviders} duration={1800} />+
                </span>{" "}
                طبيب في الدليل
              </p>
            ) : null}
          </div>

          <motion.div
            className="order-1 relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#e8f0ef] shadow-soft sm:aspect-[5/4] lg:order-2 lg:aspect-auto lg:min-h-[420px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <Image
              src={HERO_IMAGE_URL}
              alt="عيادة أسنان حديثة"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              quality={90}
              className="object-cover object-[center_30%]"
            />
          </motion.div>
        </div>

        <motion.div
          className="mt-8 rounded-[1.75rem] border border-[#e8e4dc] bg-white p-5 shadow-soft sm:p-6"
          dir="rtl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-kicker">بحث سريع</p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 sm:text-2xl">من تبحث عنه اليوم؟</h2>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {QUICK_CATEGORIES.map((category) => {
              const active = selectedSpecialty === category.label;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectSpecialty(active ? "" : category.label)}
                  className={`group flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-right transition duration-200 ${
                    active
                      ? "border-primary/25 bg-[#eef5f3] text-primary"
                      : "border-[#ebe7df] bg-[#faf8f5] text-slate-700 hover:border-primary/20 hover:bg-white"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${active ? "bg-primary/10 text-primary" : "bg-white text-primary/70"}`}>
                    <category.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-extrabold leading-tight">{category.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-[#faf8f5] px-4 transition focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="h-5 w-5 text-primary" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-transparent py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="اسم الطبيب، المنطقة، أو التخصص"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectShellLight icon={<MapPin className="h-5 w-5 text-primary" />}>
                <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-extrabold text-slate-800 outline-none">
                  <option value="">كل المحافظات</option>
                  {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </SelectShellLight>
              <SelectShellLight icon={<Stethoscope className="h-5 w-5 text-primary" />}>
                <select value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-extrabold text-slate-800 outline-none">
                  <option value="">كل التخصصات</option>
                  {QUICK_CATEGORIES.map((category) => <option key={category.id} value={category.label}>{category.label}</option>)}
                  <option value="أسنان الأطفال">أسنان الأطفال</option>
                </select>
              </SelectShellLight>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectShellLight icon={<Clock className="h-5 w-5 text-primary" />}>
                <select value={selectedWorkStatus} onChange={(event) => setSelectedWorkStatus(event.target.value as "any" | "open" | "closed")} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-extrabold text-slate-800 outline-none">
                  <option value="any">كل الأوقات</option>
                  <option value="open">مفتوح الآن</option>
                  <option value="closed">مغلق حاليا</option>
                </select>
              </SelectShellLight>
              <SelectShellLight icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
                <select value={selectedInsurance} onChange={(event) => setSelectedInsurance(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-extrabold text-slate-800 outline-none">
                  <option value="">كل التأمينات</option>
                  {PALESTINIAN_INSURANCES.map((insurance) => <option key={insurance} value={insurance}>{insurance}</option>)}
                </select>
              </SelectShellLight>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleLocationSearch}
                className={`flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-extrabold text-white transition duration-200 ${
                  userLoc ? "bg-[#3d7a73]" : "bg-primary hover:bg-primary-dark"
                }`}
              >
                <Navigation className={`h-5 w-5 -rotate-45 ${userLoc ? "animate-pulse" : ""}`} />
                {userLoc ? "مرتّب حسب الأقرب" : "الأقرب لي"}
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="btn-malama-outline justify-center"
              >
                عرض النتائج
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            {locationError ? (
              <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-6 text-amber-800">
                {locationError}
              </p>
            ) : null}
            {hasActiveFilters ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedCity ? <FilterChipLight label={selectedCity} onClear={() => setSelectedCity("")} /> : null}
                {selectedSpecialty ? <FilterChipLight label={selectedSpecialty} onClear={() => setSelectedSpecialty("")} /> : null}
                {selectedInsurance ? <FilterChipLight label={selectedInsurance} onClear={() => setSelectedInsurance("")} /> : null}
                {selectedWorkStatus !== "any" ? (
                  <FilterChipLight label={selectedWorkStatus === "open" ? "مفتوح الآن" : "مغلق حاليا"} onClear={() => setSelectedWorkStatus("any")} />
                ) : null}
                <button type="button" onClick={resetFilters} className="text-xs font-extrabold text-slate-400 hover:text-primary">
                  مسح الكل
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>

        <div className="feature-strip mt-5" dir="rtl">
          {[
            { label: "دليل واضح", desc: "تخصص ومدينة وتقييم في مكان واحد", icon: Search, href: "/doctors/search" },
            { label: "حجز أوضح", desc: "من البحث إلى الموعد بخطوات قليلة", icon: CalendarCheck2, href: "/booking" },
            { label: "تغطية المدن", desc: "ابحث حسب محافظتك وتخصصك", icon: MapPin, href: "/doctors/search" },
            { label: "تواصل سريع", desc: "واتساب وحجز من صفحة الطبيب", icon: MessageCircle, href: "/doctors/search" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="feature-strip-item transition hover:bg-white/70">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <item.icon className="h-5 w-5" />
              </span>
              <span>
                <p className="text-sm font-extrabold text-slate-900">{item.label}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.desc}</p>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <main className="section-shell py-8">
        {/* Doctors Section (#doctors) */}
        {/* scroll margin clears the fixed navbar and the news ticker so the heading is not hidden behind them */}
        <section id="doctors" className="relative z-20 flex scroll-mt-[calc(var(--navbar-height,112px)+var(--ticker-height,0px)+1rem)] flex-col gap-6 lg:flex-row" dir="rtl">
          {showMap ? (
            <div className="h-[460px] w-full overflow-hidden rounded-3xl border border-slate-200/70 lg:sticky lg:top-24 lg:h-[calc(100vh-140px)] lg:w-[42%]">
              <DoctorMap doctors={filteredDoctors} userLocation={userLoc || undefined} />
            </div>
          ) : null}

          <div className={`flex flex-col gap-5 ${showMap ? "lg:w-[58%]" : "w-full"}`}>
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-[#e8e4dc] bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-950">
                  {showSkeleton ? "جاري تحميل الأطباء" : filteredDoctors.length ? "الأطباء المتاحون" : "لم نجد نتائج مطابقة"}
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {showSkeleton || !fullListLoaded ? "لحظات ونرتب القائمة." : `${filteredDoctors.length} نتيجة حسب اختياراتك`}
                </p>
              </div>
              <div className="flex w-fit items-center rounded-full border border-slate-200 bg-[#faf8f5] p-1">
                <button type="button" onClick={() => setShowMap(false)} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${!showMap ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800"}`}>
                  القائمة
                </button>
                <button type="button" onClick={() => setShowMap(true)} className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${showMap ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800"}`}>
                  الخريطة
                </button>
              </div>
            </div>

            {showSkeleton ? <LoadingList /> : null}
            {/* No entrance animation: these cards are server-rendered and must be visible before hydration. */}
            {!showSkeleton && visibleDoctors.map((doctor) => (
              <DoctorResult key={doctor.id} doctor={doctor} showOpenStatus={mounted} />
            ))}
            {!showSkeleton && hiddenDoctorsCount > 0 ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + HOME_DOCTORS_PAGE_SIZE)}
                className="btn-malama-outline justify-center py-4"
              >
                عرض المزيد من الأطباء
                <span className="rounded-full bg-[#295f59]/10 px-2.5 py-0.5 text-xs">{hiddenDoctorsCount}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            ) : null}
            {!showSkeleton && !filteredDoctors.length ? <EmptyResults onReset={resetFilters} onPick={applySuggestion} /> : null}

            <div className="relative overflow-hidden rounded-[1.75rem] bg-primary p-8 text-center text-white">
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">هل أنت طبيب أو أخصائي رعاية؟</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-white/80">
                انضم إلى شبكة ملامح، اعرض خدماتك الطبية والتجميلية، واستقبل طلبات المراجعين من مكان واحد.
              </p>
              <div className="relative mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/join" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary transition hover:bg-[#f7f5f0]">
                  سجل عيادتك الآن
                </Link>
                <Link href="/subscriptions" className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/20">
                  عرض باقات الاشتراك
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#e8e4dc] bg-white p-6 shadow-soft sm:p-8" dir="rtl">
          <div className="mb-6 text-right">
            <p className="section-kicker">كيف تعمل ملامح</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold text-slate-950">ثلاث خطوات للوصول للعيادة المناسبة</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative rounded-2xl border border-[#ebe7df] bg-[#faf8f5] p-5 text-right"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <step.icon className="h-5 w-5" />
                </span>
                <strong className="block text-base font-extrabold text-slate-950">{step.title}</strong>
                <span className="mt-1.5 block text-sm font-semibold leading-6 text-slate-500">{step.desc}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Before / After Transformations Section */}
        {SHOW_TRANSFORMATIONS ? <TransformationsSection /> : null}

        <section className="mt-8">
          <AdSlider ads={ads} />
        </section>
      </main>
    </div>
  );
}

function SelectShellLight({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="relative flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-[#faf8f5] px-4 transition focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
      {icon}
      <div className="w-full flex-1">{children}</div>
      <ChevronDown className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
    </label>
  );
}

function FilterChipLight({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#eef5f3] px-3 py-1.5 text-xs font-extrabold text-primary"
    >
      {label}
      <span className="text-sm leading-none">×</span>
    </button>
  );
}

function DoctorResult({ doctor, showOpenStatus }: { doctor: Doctor; showOpenStatus: boolean }) {
  // Open/closed depends on the visitor's clock, so it is only shown after hydration.
  const openNow = showOpenStatus ? isDoctorOpenNow(doctor.working_hours) : false;
  const whatsappHref = doctor.whatsapp ? `https://wa.me/${doctor.whatsapp.replace(/[^\d]/g, "")}` : undefined;

  return (
    <article className="relative group flex flex-col gap-5 overflow-hidden rounded-[1.5rem] border border-[#e8e4dc] bg-white p-4 shadow-soft transition-all duration-200 ease-spring hover:shadow-bento-hover sm:flex-row sm:p-5" dir="rtl">
      {(doctor.rating || 0) > 0 ? (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-xs font-extrabold text-[#b8962e] shadow-sm">
          {doctor.rating}
          <Star className="h-3.5 w-3.5 fill-current" />
        </span>
      ) : null}

      {/* Image Column — clear portrait crop, no dark overlay */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-[#e8f0ef] sm:aspect-auto sm:h-auto sm:min-h-[11.5rem] sm:w-48 sm:self-stretch">
        {doctor.image_url ? (
          <Image
            src={doctor.image_url}
            alt={doctor.name}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className="object-cover object-[center_18%] transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full min-h-[11.5rem] w-full items-center justify-center text-[#295f59]/30">
            <HeartPulse className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Info Column */}
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/doctors/${doctor.id}`} className="text-xl font-extrabold text-slate-950 transition-colors hover:text-primary">
                {doctor.name}
              </Link>
              {doctor.accepts_discount_card ? (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-[#eef5f3] px-2.5 py-1 text-[11px] font-extrabold text-primary">
                  بطاقة الخصم
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Array.isArray(doctor.specialty) ? doctor.specialty : []).map((specialty) => (
                <span key={specialty} className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-bold text-slate-600">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <MapPin className="h-4 w-4 text-slate-400" />
              {doctor.city}{doctor.area ? ` - ${doctor.area}` : ""}
            </p>
            <div className="flex min-h-[26px] flex-wrap gap-2">
              {showOpenStatus ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${
                  openNow ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-slate-100 text-slate-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {openNow ? "مفتوح الآن" : "مغلق حاليا"}
                </span>
              ) : null}
              {doctor.distance !== undefined ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-[#eef5f3] px-3 py-1 text-xs font-extrabold text-primary">
                  <Route className="h-3.5 w-3.5" />
                  {doctor.distance.toFixed(1)} كم
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link href={`/doctors/${doctor.id}#booking`} className="btn-malama py-3 text-sm">
              {doctor.can_book_online ? "احجز" : "طلب موعد"}
              <ArrowLeft className="h-4 w-4" />
            </Link>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackWhatsAppLead({
                    doctorId: doctor.id,
                    doctorName: doctor.name,
                    source: "home_card",
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d5e8e1] bg-[#eef5f3] px-4 py-3 text-sm font-extrabold text-primary transition hover:bg-[#e0ece9]"
              >
                <MessageCircle className="h-4 w-4" />
                واتساب
              </a>
            ) : null}
            <Link href={`/doctors/${doctor.id}/map`} className="btn-malama-outline py-3 text-sm">
              <MapPin className="h-4 w-4" />
              الخريطة
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function LoadingList() {
  return (
    <div className="grid gap-4">
      {["one", "two", "three"].map((key) => (
        <div key={key} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
          <div className="h-52 w-full animate-pulse rounded-xl bg-slate-100 sm:h-40 sm:w-44" />
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyResults({ onReset, onPick }: { onReset: () => void; onPick: (suggestion: string) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
        <Search className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900">لا توجد نتائج مطابقة</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-slate-500">
        جرّب مدينة قريبة مثل رام الله أو نابلس، أو اختر قسماً طبياً آخر لتوسيع البحث.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["رام الله", "نابلس", "الخليل", "أسنان", "عيون", "جلدية"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className="rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-black text-slate-700 transition hover:border-primary/30 hover:bg-white hover:text-primary"
          >
            {item}
          </button>
        ))}
      </div>
      <button type="button" onClick={onReset} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90">
        عرض كل الأطباء
      </button>
    </div>
  );
}


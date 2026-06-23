"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Ear,
  Eye,
  HeartPulse,
  MapPin,
  MessageCircle,
  Navigation,
  PhoneCall,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  X,
  Zap,
} from "lucide-react";
import AdSlider from "@/components/AdSlider";
import { CITIES } from "@/lib/constants";
import { getDistance } from "@/lib/distance";
import { doctorMapCoordinates } from "@/lib/map-links";
import { requestAccuratePosition, type UserMapLocation } from "@/lib/geolocation";
import { Advertisement, Doctor } from "@/lib/types";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const FloatingParticles = dynamic(() => import("@/components/FloatingParticles"), { ssr: false });
const TransformationsSection = dynamic(() => import("@/components/TransformationsSection"), { ssr: false });
const SubscriptionPackagesSection = dynamic(() => import("@/components/SubscriptionPackagesSection"), { ssr: false });

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-sm font-bold text-slate-500">جاري تحميل الخريطة...</span>
    </div>
  ),
});

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1629909613654-28e377c37b94?q=80&w=1920&auto=format&fit=crop";

const QUICK_CATEGORIES = [
  { id: "dental", label: "أسنان", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "derma", label: "جلدية", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "beauty", label: "تجميل", icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "eyes", label: "عيون", icon: Eye, color: "text-teal-600", bg: "bg-teal-50" },
  { id: "ent", label: "أنف وأذن وحنجرة", icon: Ear, color: "text-orange-600", bg: "bg-orange-50" },
];

const TRUST_POINTS = [
  { label: "أطباء موثقون", icon: BadgeCheck },
  { label: "حجز موعد", icon: CalendarCheck2 },
  { label: "تواصل مباشر", icon: PhoneCall },
];

const PALESTINIAN_INSURANCES = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];



const HOW_IT_WORKS = [
  { title: "حدد موقعك", desc: "رتب النتائج حسب الأقرب لك.", icon: Navigation },
  { title: "قارن الخيارات", desc: "راجع التخصص، المدينة، التقييم والدوام.", icon: ShieldCheck },
  { title: "افتح الاتجاهات", desc: "انتقل للعيادة من تطبيق الخرائط.", icon: MapPin },
];

const CARE_PATHS = [
  { label: "عيادات الأسنان", specialty: "طب أسنان عام", status: "any" as const },
  { label: "ليزر وجلدية", specialty: "جلدية وتجميل", status: "any" as const },
  { label: "فحص العيون والليزك", specialty: "طب وجراحة العيون", status: "any" as const },
];

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

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
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
      }
    }

    loadData();
  }, []);

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
    if (selectedCity) result = result.filter((doc) => doc.city === selectedCity);
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
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [doctors, searchQuery, selectedCity, selectedInsurance, selectedSpecialty, selectedWorkStatus, userLoc]);

  const hasActiveFilters =
    searchQuery || selectedCity || selectedSpecialty || selectedInsurance || selectedWorkStatus !== "any";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedSpecialty("");
    setSelectedInsurance("");
    setSelectedWorkStatus("any");
  };

  const handleLocationSearch = () => {
    void requestAccuratePosition()
      .then((location) => setUserLoc(location))
      .catch(() => alert("تعذر الوصول إلى الموقع. فعّل GPS/الموقع بدقة عالية وحاول مجدداً."));
  };

  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      <section className="section-shell relative isolate mb-10 mt-2 sm:mb-14">
        <div className="page-hero-dark relative overflow-hidden px-4 py-8 sm:py-12 lg:px-8">
        <Image
          src={HERO_IMAGE_URL}
          alt="عيادة تجميل وجلدية ملامح الحديثة"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/75 to-slate-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
        {/* Floating Particles - purely decorative */}
        <FloatingParticles count={45} className="opacity-70" />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -top-32 right-[20%] h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-[10%] h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="relative z-10 mx-auto grid min-h-[580px] w-full max-w-[1400px] items-center gap-10 py-4 lg:grid-cols-[1fr_480px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] items-center w-full text-right text-white" dir="rtl">
            <div className="max-w-xl flex-1">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 px-4 py-1.5 text-xs font-black text-[#f5d76e] mb-5 backdrop-blur-sm">
                  <Zap className="h-3.5 w-3.5" />
                  الأول من نوعه في فلسطين
                </span>
              </motion.div>
              <motion.h1
                className="text-4xl font-black leading-[1.15] sm:text-5xl lg:text-6xl tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                كل ما تحتاجه لصحتك وجمالك..{" "}
                <span className="block sm:inline bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#fde68a] bg-clip-text text-transparent">
                  في متناول يدك
                </span>
              </motion.h1>
              <motion.p
                className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-200 sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                دليلك الطبي والتجميلي الشامل لأطباء الأسنان، العيون، الجلدية، التجميل، والأنف والأذن والحنجرة الأقرب إليك في فلسطين.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-wrap gap-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.35 }}
              >
                {TRUST_POINTS.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-xs font-black text-slate-100 backdrop-blur-sm border border-white/5">
                    <item.icon className="h-4 w-4 text-[#d4af37]" />
                    {item.label}
                  </span>
                ))}
              </motion.div>
              <motion.div
                className="mt-6 flex flex-wrap gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Link href="/doctors/search" className="btn-malama-outline gap-2 bg-white px-6 py-3.5 text-sm shadow-float">
                  <Search className="h-4 w-4 text-primary" />
                  ابحث عن طبيب
                </Link>
                <Link href="/join" className="btn-malama-ghost px-6 py-3.5 text-sm">
                  <Sparkles className="h-4 w-4" />
                  انضم كطبيب شريك
                </Link>
              </motion.div>

              {(publicStats.verifiedProviders > 0 || publicStats.appointments > 0 || publicStats.cities > 0) && (
              <motion.div
                className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 max-w-xl text-right"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#d4af37]">
                    <AnimatedCounter target={publicStats.verifiedProviders} duration={2200} />
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300 mt-1">عيادة ومزود خدمة موثق</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#d4af37]">
                    <AnimatedCounter target={publicStats.appointments} duration={2500} />
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300 mt-1">حجز مسجّل</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#d4af37]">
                    <AnimatedCounter target={publicStats.cities} duration={1500} />
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300 mt-1">مدينة مغطاة</p>
                </div>
              </motion.div>
              )}
            </div>

            {/* Interactive Face Map Search */}
            <div className="hidden lg:block">
              <InteractiveFaceMap onSelectSpecialty={setSelectedSpecialty} />
            </div>
          </div>

          <div className="glass rounded-[2rem] border border-white/30 p-5 text-right shadow-[0_20px_50px_rgba(15,23,42,0.18)] sm:p-6 backdrop-blur-xl" dir="rtl">
            <p className="text-xs font-black text-primary tracking-wider">ابدأ البحث الآن</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">من تبحث عنه اليوم؟</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {CARE_PATHS.map((path) => (
                <button
                  key={path.label}
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty(path.specialty);
                    setSelectedWorkStatus(path.status);
                    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-3 py-3 text-xs font-black text-slate-700 transition-all hover:border-primary/30 hover:bg-white hover:text-primary"
                >
                  {path.label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 px-4 focus-within:border-primary focus-within:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                <Search className="h-5 w-5 text-primary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full bg-transparent py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="اسم الطبيب، المنطقة، أو التخصص"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectShell icon={<MapPin className="h-5 w-5 text-primary" />}>
                  <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-slate-800 outline-none">
                    <option value="">كل المحافظات</option>
                    {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </SelectShell>
                <SelectShell icon={<Stethoscope className="h-5 w-5 text-primary" />}>
                  <select value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-slate-800 outline-none">
                    <option value="">كل التخصصات</option>
                    {QUICK_CATEGORIES.map((category) => <option key={category.id} value={category.label}>{category.label}</option>)}
                    <option value="أسنان الأطفال">أسنان الأطفال</option>
                  </select>
                </SelectShell>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectShell icon={<Clock className="h-5 w-5 text-primary" />}>
                  <select value={selectedWorkStatus} onChange={(event) => setSelectedWorkStatus(event.target.value as any)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-slate-800 outline-none">
                    <option value="any">كل الأوقات</option>
                    <option value="open">مفتوح الآن</option>
                    <option value="closed">مغلق حاليا</option>
                  </select>
                </SelectShell>
                <SelectShell icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
                  <select value={selectedInsurance} onChange={(event) => setSelectedInsurance(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-slate-800 outline-none">
                    <option value="">كل التأمينات</option>
                    {PALESTINIAN_INSURANCES.map((insurance) => <option key={insurance} value={insurance}>{insurance}</option>)}
                  </select>
                </SelectShell>
              </div>
              <button
                type="button"
                onClick={handleLocationSearch}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black text-white transition-all duration-300 ${
                  userLoc 
                    ? "bg-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.25)]" 
                    : "bg-primary hover:bg-primary/90 hover:shadow-[0_8px_20px_rgba(12,94,71,0.25)] hover:-translate-y-0.5"
                }`}
              >
                <Navigation className={`h-5 w-5 -rotate-45 ${userLoc ? "animate-pulse" : ""}`} />
                {userLoc ? "تم ترتيب النتائج حسب الأقرب" : "رتب النتائج حسب الأقرب لي"}
              </button>
              {hasActiveFilters ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedCity ? <FilterChip label={selectedCity} onClear={() => setSelectedCity("")} /> : null}
                  {selectedSpecialty ? <FilterChip label={selectedSpecialty} onClear={() => setSelectedSpecialty("")} /> : null}
                  {selectedInsurance ? <FilterChip label={selectedInsurance} onClear={() => setSelectedInsurance("")} /> : null}
                  {selectedWorkStatus !== "any" ? (
                    <FilterChip label={selectedWorkStatus === "open" ? "مفتوح الآن" : "مغلق حاليا"} onClear={() => setSelectedWorkStatus("any")} />
                  ) : null}
                  <button type="button" onClick={resetFilters} className="text-xs font-black text-slate-500 hover:text-primary">
                    مسح الكل
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        </div>
      </section>


      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8">
        {/* Floating Quick Categories by Specialty */}
        <section className="-mt-10 sm:-mt-12 mb-12 flex flex-wrap justify-center gap-3 px-4 relative z-20" dir="rtl">
          {QUICK_CATEGORIES.map((category, i) => {
            const isSelected = selectedSpecialty === category.label;
            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => {
                  setSelectedSpecialty(isSelected ? "" : category.label);
                  document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-3 transition-colors duration-200 shadow-md ${
                  isSelected
                    ? "border-primary bg-primary text-white shadow-[0_8px_20px_rgba(12,94,71,0.25)]"
                    : "border-slate-200/60 bg-white/90 backdrop-blur-md hover:border-primary/30 hover:bg-white text-slate-800 hover:shadow-lg"
                }`}
              >
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  isSelected
                    ? "bg-white/20 border-white/10 text-white"
                    : `${category.bg} ${category.color} border-slate-100 shadow-sm`
                }`}>
                  <category.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-black whitespace-nowrap">{category.label}</span>
              </motion.button>
            );
          })}
        </section>

        {/* Doctors Section (#doctors) */}
        <section id="doctors" className="flex flex-col gap-6 lg:flex-row relative z-20" dir="rtl">
          {showMap ? (
            <div className="h-[460px] w-full lg:sticky lg:top-24 lg:h-[calc(100vh-140px)] lg:w-[42%]">
              <DoctorMap doctors={filteredDoctors} userLocation={userLoc || undefined} />
            </div>
          ) : null}

          <div className={`flex flex-col gap-5 ${showMap ? "lg:w-[58%]" : "w-full"}`}>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  {loading ? "جاري تحميل الأطباء" : filteredDoctors.length ? "الأطباء المتاحون" : "لم نجد نتائج مطابقة"}
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {loading ? "لحظات ونرتب القائمة." : `${filteredDoctors.length} نتيجة حسب اختياراتك`}
                </p>
              </div>
              <div className="flex w-fit items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button type="button" onClick={() => setShowMap(false)} className={`rounded-lg px-4 py-2 text-xs font-black ${!showMap ? "bg-slate-950 text-white" : "text-slate-500"}`}>
                  القائمة
                </button>
                <button type="button" onClick={() => setShowMap(true)} className={`rounded-lg px-4 py-2 text-xs font-black ${showMap ? "bg-primary text-white" : "text-slate-500"}`}>
                  الخريطة
                </button>
              </div>
            </div>

            {loading ? <LoadingList /> : null}
            {!loading && filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.5) }}
              >
                <DoctorResult doctor={doctor} />
              </motion.div>
            ))}
            {!loading && !filteredDoctors.length ? <EmptyResults onReset={resetFilters} /> : null}

            <div className="rounded-2xl bg-slate-950 p-7 text-center text-white">
              <h3 className="text-2xl font-black">هل أنت طبيب أو أخصائي رعاية؟</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
                انضم إلى شبكة ملامح، اعرض خدماتك الطبية والتجميلية، واستقبل طلبات المراجعين من مكان واحد.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/join" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black text-primary hover:bg-emerald-50">
                  سجل عيادتك الآن
                </Link>
                <Link href="/subscriptions" className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white hover:bg-white/20">
                  عرض باقات الاشتراك
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" dir="rtl">
          <div className="grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                className="flex items-start gap-3 text-right"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-sm font-black text-slate-950">{step.title}</strong>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{step.desc}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Before / After Transformations Section */}
        <TransformationsSection />

        <SubscriptionPackagesSection />

        <section className="mt-8">
          <AdSlider ads={ads} />
        </section>
      </main>
    </div>
  );
}

function SelectShell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="relative flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 px-4 focus-within:border-primary focus-within:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] cursor-pointer">
      {icon}
      <div className="flex-1 w-full">
        {children}
      </div>
      <ChevronDown className="h-4 w-4 text-slate-400 pointer-events-none absolute left-4" />
    </label>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-primary"
    >
      {label}
      <span className="text-sm leading-none text-emerald-500">×</span>
    </button>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm">
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function DoctorResult({ doctor }: { doctor: Doctor }) {
  const openNow = isDoctorOpenNow(doctor.working_hours);
  const whatsappHref = doctor.whatsapp ? `https://wa.me/${doctor.whatsapp.replace(/[^\d]/g, "")}` : undefined;

  return (
    <article className="relative group flex flex-col gap-5 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(10,22,40,0.08)] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_16px_40px_-14px_rgba(10,22,40,0.12)] hover:-translate-y-0.5 sm:flex-row" dir="rtl">
      
      {/* Top Left Absolute Rating Badge */}
      {(doctor.rating || 0) > 0 ? (
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-black text-[#d4af37] shadow-sm z-10 border border-slate-100">
          {doctor.rating}
          <Star className="h-3.5 w-3.5 fill-current" />
        </span>
      ) : null}

      {/* Image Column */}
      <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-auto sm:w-44">
        {doctor.image_url ? (
          <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-200">
            <HeartPulse className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Info Column */}
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/doctors/${doctor.id}`} className="text-xl font-black text-slate-950 hover:text-primary transition-colors">
                {doctor.name}
              </Link>
              {doctor.verified ? <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50/50" /> : null}
              {doctor.accepts_discount_card ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 border border-emerald-100">
                  بطاقة الخصم
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Array.isArray(doctor.specialty) ? doctor.specialty : []).map((specialty) => (
                <span key={specialty} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200/20">
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
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
                openNow ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-slate-100 text-slate-500"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {openNow ? "مفتوح الآن" : "مغلق حاليا"}
              </span>
              {doctor.distance !== undefined ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-primary border border-emerald-100">
                  <Route className="h-3.5 w-3.5" />
                  {doctor.distance.toFixed(1)} كم
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons arranged horizontally */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Link href={`/doctors/${doctor.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/15">
              احجز
              <ArrowLeft className="h-4 w-4" />
            </Link>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-100 transition-all">
                <MessageCircle className="h-4 w-4" />
                واتساب
              </a>
            ) : null}
            <Link href={`/doctors/${doctor.id}/map`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-primary hover:bg-emerald-100 transition-all">
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

function EmptyResults({ onReset }: { onReset: () => void }) {
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
          <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            {item}
          </span>
        ))}
      </div>
      <button type="button" onClick={onReset} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90">
        عرض كل الأطباء
      </button>
    </div>
  );
}

function InteractiveFaceMap({
  onSelectSpecialty
}: {
  onSelectSpecialty: (specialty: string) => void;
}) {
  const [hoveredLabel, setHoveredLabel] = useState<string>("");

  const handleClick = (specialty: string) => {
    onSelectSpecialty(specialty);
    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/60 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl max-w-xs mx-auto shadow-2xl">
      <div className="relative">
        <svg
          viewBox="0 0 400 400"
          className="w-[240px] h-[240px] select-none"
        >
          {/* Base Head Outline (representing general Dermatology/Skin) */}
          <g
            className="group cursor-pointer"
            onClick={() => handleClick("جلدية")}
            onMouseEnter={() => setHoveredLabel("جلدية (أمراض جلدية وبشرة) 🧴")}
            onMouseLeave={() => setHoveredLabel("")}
          >
            <path
              d="M 200,60 C 110,60 100,120 100,190 C 100,280 140,340 200,340 C 260,340 300,280 300,190 C 300,120 290,60 200,60 Z"
              fill="transparent"
              className="group-hover:fill-amber-500/5 transition-all duration-300"
            />
            <path
              d="M 200,60 C 110,60 100,120 100,190 C 100,280 140,340 200,340 C 260,340 300,280 300,190 C 300,120 290,60 200,60 Z"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3] transition-all duration-300"
              strokeDasharray="6 4"
            />
          </g>

          {/* Ears & Nose (representing ENT) */}
          <g
            className="group cursor-pointer"
            onClick={() => handleClick("أنف وأذن وحنجرة")}
            onMouseEnter={() => setHoveredLabel("أنف وأذن وحنجرة 👂")}
            onMouseLeave={() => setHoveredLabel("")}
          >
            <path
              d="M 100,150 C 75,150 75,230 100,230"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3.5] transition-all duration-300"
            />
            <path
              d="M 300,150 C 325,150 325,230 300,230"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3.5] transition-all duration-300"
            />
            <path
              d="M 200,175 L 192,230 C 192,238 208,238 208,230 Z"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3.5] transition-all duration-300"
            />
          </g>

          {/* Eyes (representing Ophthalmology) */}
          <g
            className="group cursor-pointer"
            onClick={() => handleClick("عيون")}
            onMouseEnter={() => setHoveredLabel("عيون (طب وجراحة العيون) 👁️")}
            onMouseLeave={() => setHoveredLabel("")}
          >
            <ellipse
              cx="150"
              cy="150"
              rx="20"
              ry="10"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3.5] transition-all duration-300"
            />
            <circle
              cx="150"
              cy="150"
              r="6"
              fill="#cbd5e1"
              className="group-hover:fill-amber-400 transition-all duration-300"
            />
            <ellipse
              cx="250"
              cy="150"
              rx="20"
              ry="10"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3.5] transition-all duration-300"
            />
            <circle
              cx="250"
              cy="150"
              r="6"
              fill="#cbd5e1"
              className="group-hover:fill-amber-400 transition-all duration-300"
            />
          </g>

          {/* Cheeks (representing Cosmetics) */}
          <g
            className="group cursor-pointer"
            onClick={() => handleClick("تجميل")}
            onMouseEnter={() => setHoveredLabel("تجميل (فيلر وبوتوكس للوجه) ✨")}
            onMouseLeave={() => setHoveredLabel("")}
          >
            <circle
              cx="140"
              cy="200"
              r="14"
              fill="rgba(245,158,11,0.02)"
              stroke="rgba(245,158,11,0.2)"
              strokeWidth="1.5"
              className="group-hover:fill-amber-500/10 group-hover:stroke-amber-400/60 transition-all duration-300"
              strokeDasharray="3 3"
            />
            <circle
              cx="260"
              cy="200"
              r="14"
              fill="rgba(245,158,11,0.02)"
              stroke="rgba(245,158,11,0.2)"
              strokeWidth="1.5"
              className="group-hover:fill-amber-500/10 group-hover:stroke-amber-400/60 transition-all duration-300"
              strokeDasharray="3 3"
            />
          </g>

          {/* Mouth/Teeth (representing Dental) */}
          <g
            className="group cursor-pointer"
            onClick={() => handleClick("أسنان")}
            onMouseEnter={() => setHoveredLabel("أسنان (تجميل وزراعة وتقويم) 🦷")}
            onMouseLeave={() => setHoveredLabel("")}
          >
            <path
              d="M 160,270 Q 200,285 240,270 Q 200,310 160,270 Z"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              className="group-hover:stroke-amber-400 group-hover:strokeWidth-[3.5] transition-all duration-300"
            />
            <path
              d="M 170,274 Q 200,282 230,274"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              className="group-hover:stroke-amber-200 transition-all duration-300"
            />
          </g>
        </svg>
      </div>

      <div className="text-center h-10 flex items-center justify-center mt-2">
        {hoveredLabel ? (
          <span className="text-xs font-black text-amber-400 animate-pulse tracking-wide">{hoveredLabel}</span>
        ) : (
          <span className="text-[10px] font-black text-slate-400 leading-relaxed">انقر للتصفية السريعة والبحث الذكي 👆</span>
        )}
      </div>
    </div>
  );
}

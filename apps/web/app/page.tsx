"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
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
import { CITIES } from "@/lib/constants";
import { cityMatchesFilter } from "@/lib/city-match";
import { getDistance } from "@/lib/distance";
import { doctorMapCoordinates } from "@/lib/map-links";
import { requestAccuratePosition, type UserMapLocation } from "@/lib/geolocation";
import { Advertisement, Doctor } from "@/lib/types";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { trackWhatsAppLead } from "@/lib/whatsapp-lead";

const FloatingParticles = dynamic(() => import("@/components/FloatingParticles"), { ssr: false });
const TransformationsSection = dynamic(() => import("@/components/TransformationsSection"), { ssr: false });
const SubscriptionPackagesSection = dynamic(() => import("@/components/SubscriptionPackagesSection"), { ssr: false });

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

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1629909613654-28e377c37b94?q=70&w=1600&auto=format&fit=crop";

const QUICK_CATEGORIES = [
  { id: "dental", label: "أسنان", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "derma", label: "جلدية", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "beauty", label: "تجميل", icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "eyes", label: "عيون", icon: Eye, color: "text-teal-600", bg: "bg-teal-50" },
  { id: "ent", label: "أنف وأذن وحنجرة", icon: Ear, color: "text-orange-600", bg: "bg-orange-50" },
];

const PALESTINIAN_INSURANCES = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

const HOW_IT_WORKS = [
  { title: "حدد موقعك", desc: "رتب النتائج حسب الأقرب لك.", icon: Navigation },
  { title: "قارن الخيارات", desc: "راجع التخصص، المدينة، التقييم والدوام.", icon: ShieldCheck },
  { title: "افتح الاتجاهات", desc: "انتقل للعيادة من تطبيق الخرائط.", icon: MapPin },
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

  const selectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden font-sans">
      <section className="relative isolate mb-8 sm:mb-12">
        <div className="relative min-h-[min(88vh,760px)] overflow-hidden">
          <Image
            src={HERO_IMAGE_URL}
            alt="ملامح — دليل صحة وجمال الوجه في فلسطين"
            fill
            priority
            sizes="100vw"
            quality={70}
            className="object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(16,185,129,0.18),transparent_45%),linear-gradient(180deg,rgba(6,12,24,0.55)_0%,rgba(6,12,24,0.72)_45%,rgba(6,12,24,0.96)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#060c18]/90 via-[#060c18]/45 to-transparent" />
          <FloatingParticles count={28} className="opacity-40" />

          <div className="relative z-10 mx-auto flex min-h-[min(88vh,760px)] w-full max-w-[1400px] flex-col justify-end gap-6 px-[var(--page-gutter)] pb-10 pt-24 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-end lg:gap-10 lg:pb-12 lg:pt-28">
            <div className="max-w-xl text-right text-white lg:pb-4" dir="rtl">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/35 bg-[#e8c86a]/10 px-4 py-1.5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <span className="text-base font-black tracking-wide text-[#f5d76e] sm:text-lg">ملامح</span>
                <span className="text-[10px] font-bold text-slate-300">.ps</span>
              </motion.div>
              <motion.h1
                className="mt-5 text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.35rem]"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
              >
                <span className="block text-white">ابحث عن الطبيب المناسب</span>
                <span className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <span className="relative inline-block rounded-2xl bg-[#e8c86a] px-4 py-1.5 text-[#0a1628] shadow-[0_12px_32px_-10px_rgba(232,200,106,0.55)]">
                    لوجهك
                  </span>
                  <span className="text-white/90">و</span>
                  <span className="relative inline-block rounded-2xl border-2 border-[#e8c86a] bg-[#e8c86a]/15 px-4 py-1.5 text-[#f5d76e]">
                    أسنانك
                  </span>
                </span>
              </motion.h1>
              <motion.p
                className="mt-5 max-w-lg text-base font-semibold leading-8 text-slate-200/90 sm:text-lg"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.16 }}
              >
                دليل موثّق لأطباء الأسنان، العيون، الجلدية، التجميل، والأنف والأذن — ابحث، قارن، واحجز في مكان واحد.
              </motion.p>
              <motion.div
                className="mt-7 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
              >
                <button
                  type="button"
                  onClick={() => document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_12px_40px_-12px_rgba(255,255,255,0.45)] transition hover:-translate-y-0.5"
                >
                  <Search className="h-4 w-4 text-primary" />
                  ابدأ البحث
                </button>
                <Link href="/join" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/12">
                  انضم كطبيب
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="w-full rounded-[1.75rem] border border-white/15 bg-[#0b1526]/80 p-5 text-right shadow-[0_40px_80px_-28px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-6"
              dir="rtl"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
            >
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e8c86a]/90">بحث سريع</p>
                  <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">من تبحث عنه اليوم؟</h2>
                </div>
                {(publicStats.verifiedProviders > 0) && (
                  <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black text-slate-200">
                    <AnimatedCounter target={publicStats.verifiedProviders} duration={1800} />+ مزود موثّق
                  </p>
                )}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {QUICK_CATEGORIES.map((category) => {
                  const active = selectedSpecialty === category.label;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => selectSpecialty(active ? "" : category.label)}
                      className={`group flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right transition duration-300 ${
                        active
                          ? "border-[#e8c86a]/50 bg-[#e8c86a]/15 text-white"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-[#e8c86a]/25 text-[#f5d76e]" : "bg-white/10 text-slate-300 group-hover:text-white"}`}>
                        <category.icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-black leading-tight">{category.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 transition focus-within:border-[#e8c86a]/40 focus-within:bg-white/10">
                  <Search className="h-5 w-5 text-[#e8c86a]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm font-bold text-white outline-none placeholder:text-slate-400"
                    placeholder="اسم الطبيب، المنطقة، أو التخصص"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectShellDark icon={<MapPin className="h-5 w-5 text-[#e8c86a]" />}>
                    <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-white outline-none [&>option]:text-slate-900">
                      <option value="">كل المحافظات</option>
                      {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </SelectShellDark>
                  <SelectShellDark icon={<Stethoscope className="h-5 w-5 text-[#e8c86a]" />}>
                    <select value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-white outline-none [&>option]:text-slate-900">
                      <option value="">كل التخصصات</option>
                      {QUICK_CATEGORIES.map((category) => <option key={category.id} value={category.label}>{category.label}</option>)}
                      <option value="أسنان الأطفال">أسنان الأطفال</option>
                    </select>
                  </SelectShellDark>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectShellDark icon={<Clock className="h-5 w-5 text-[#e8c86a]" />}>
                    <select value={selectedWorkStatus} onChange={(event) => setSelectedWorkStatus(event.target.value as "any" | "open" | "closed")} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-white outline-none [&>option]:text-slate-900">
                      <option value="any">كل الأوقات</option>
                      <option value="open">مفتوح الآن</option>
                      <option value="closed">مغلق حاليا</option>
                    </select>
                  </SelectShellDark>
                  <SelectShellDark icon={<ShieldCheck className="h-5 w-5 text-[#e8c86a]" />}>
                    <select value={selectedInsurance} onChange={(event) => setSelectedInsurance(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-6 text-sm font-black text-white outline-none [&>option]:text-slate-900">
                      <option value="">كل التأمينات</option>
                      {PALESTINIAN_INSURANCES.map((insurance) => <option key={insurance} value={insurance}>{insurance}</option>)}
                    </select>
                  </SelectShellDark>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black text-white transition duration-300 ${
                      userLoc
                        ? "bg-emerald-600 shadow-[0_10px_28px_rgba(16,185,129,0.35)]"
                        : "bg-primary hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_10px_28px_rgba(12,94,71,0.4)]"
                    }`}
                  >
                    <Navigation className={`h-5 w-5 -rotate-45 ${userLoc ? "animate-pulse" : ""}`} />
                    {userLoc ? "مرتّب حسب الأقرب" : "الأقرب لي"}
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-black text-white transition hover:bg-white/16"
                  >
                    عرض النتائج
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
                {hasActiveFilters ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {selectedCity ? <FilterChipDark label={selectedCity} onClear={() => setSelectedCity("")} /> : null}
                    {selectedSpecialty ? <FilterChipDark label={selectedSpecialty} onClear={() => setSelectedSpecialty("")} /> : null}
                    {selectedInsurance ? <FilterChipDark label={selectedInsurance} onClear={() => setSelectedInsurance("")} /> : null}
                    {selectedWorkStatus !== "any" ? (
                      <FilterChipDark label={selectedWorkStatus === "open" ? "مفتوح الآن" : "مغلق حاليا"} onClear={() => setSelectedWorkStatus("any")} />
                    ) : null}
                    <button type="button" onClick={resetFilters} className="text-xs font-black text-slate-400 hover:text-[#e8c86a]">
                      مسح الكل
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="section-shell relative z-20 -mt-5 mb-6" dir="rtl">
        <div className="grid gap-3 rounded-[1.35rem] border border-slate-200/70 bg-white/95 p-3 shadow-[0_16px_40px_-24px_rgba(10,22,40,0.2)] backdrop-blur-md sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-x-reverse sm:divide-slate-100 sm:p-1">
          {[
            { label: "أطباء موثّقون", desc: "تحقق قبل الظهور في الدليل", href: "/trust" },
            { label: "حجز أوضح", desc: "من البحث إلى الموعد بخطوات قليلة", href: "/booking" },
            { label: "تغطية المدن", desc: "ابحث حسب محافظتك وتخصصك", href: "/doctors/search" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl px-4 py-3 text-right transition hover:bg-slate-50"
            >
              <p className="text-sm font-black text-slate-900">{item.label}</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>


      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8">
        {/* Doctors Section (#doctors) */}
        <section id="doctors" className="flex flex-col gap-6 lg:flex-row relative z-20" dir="rtl">
          {showMap ? (
            <div className="h-[460px] w-full overflow-hidden rounded-3xl border border-slate-200/70 lg:sticky lg:top-24 lg:h-[calc(100vh-140px)] lg:w-[42%]">
              <DoctorMap doctors={filteredDoctors} userLocation={userLoc || undefined} />
            </div>
          ) : null}

          <div className={`flex flex-col gap-5 ${showMap ? "lg:w-[58%]" : "w-full"}`}>
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_16px_40px_-24px_rgba(10,22,40,0.18)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {loading ? "جاري تحميل الأطباء" : filteredDoctors.length ? "الأطباء المتاحون" : "لم نجد نتائج مطابقة"}
                </h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {loading ? "لحظات ونرتب القائمة." : `${filteredDoctors.length} نتيجة حسب اختياراتك`}
                </p>
              </div>
              <div className="flex w-fit items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                <button type="button" onClick={() => setShowMap(false)} className={`rounded-xl px-4 py-2 text-xs font-black transition ${!showMap ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                  القائمة
                </button>
                <button type="button" onClick={() => setShowMap(true)} className={`rounded-xl px-4 py-2 text-xs font-black transition ${showMap ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
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

            <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0a1628] p-8 text-center text-white">
              <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
              <h3 className="relative text-2xl font-black tracking-tight sm:text-3xl">هل أنت طبيب أو أخصائي رعاية؟</h3>
              <p className="relative mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
                انضم إلى شبكة ملامح، اعرض خدماتك الطبية والتجميلية، واستقبل طلبات المراجعين من مكان واحد.
              </p>
              <div className="relative mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/join" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-black text-primary transition hover:-translate-y-0.5 hover:bg-emerald-50">
                  سجل عيادتك الآن
                </Link>
                <Link href="/subscriptions" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20">
                  عرض باقات الاشتراك
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br from-white via-white to-emerald-50/40 p-6 shadow-[0_20px_50px_-28px_rgba(10,22,40,0.2)] sm:p-8" dir="rtl">
          <div className="mb-6 text-right">
            <p className="text-xs font-black tracking-[0.16em] text-primary">كيف تعمل ملامح</p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">ثلاث خطوات للوصول للعيادة المناسبة</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                className="relative text-right"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <strong className="block text-base font-black text-slate-950">{step.title}</strong>
                <span className="mt-1.5 block text-sm font-semibold leading-6 text-slate-500">{step.desc}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Before / After Transformations Section */}
        {SHOW_TRANSFORMATIONS ? <TransformationsSection /> : null}

        <SubscriptionPackagesSection />

        <section className="mt-8">
          <AdSlider ads={ads} />
        </section>
      </main>
    </div>
  );
}

function SelectShellDark({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="relative flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 transition focus-within:border-[#e8c86a]/40 focus-within:bg-white/10">
      {icon}
      <div className="w-full flex-1">{children}</div>
      <ChevronDown className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
    </label>
  );
}

function FilterChipDark({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 rounded-full border border-[#e8c86a]/30 bg-[#e8c86a]/10 px-3 py-1.5 text-xs font-black text-[#f5d76e]"
    >
      {label}
      <span className="text-sm leading-none text-[#e8c86a]">×</span>
    </button>
  );
}

function DoctorResult({ doctor }: { doctor: Doctor }) {
  const openNow = isDoctorOpenNow(doctor.working_hours);
  const whatsappHref = doctor.whatsapp ? `https://wa.me/${doctor.whatsapp.replace(/[^\d]/g, "")}` : undefined;

  return (
    <article className="relative group flex flex-col gap-5 overflow-hidden rounded-[1.6rem] border border-slate-200/60 bg-white p-5 shadow-[0_12px_36px_-16px_rgba(10,22,40,0.12)] transition-all duration-300 ease-spring hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_22px_48px_-18px_rgba(10,22,40,0.16)] sm:flex-row" dir="rtl">
      
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
              {doctor.verified ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700"
                  title="راجعت الإدارة بيانات العيادة الأساسية قبل الظهور"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  موثّق
                </span>
              ) : null}
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
            <Link href={`/doctors/${doctor.id}#booking`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/15">
              {(doctor as any).can_book_online ? "احجز" : "طلب موعد"}
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 hover:bg-emerald-100 transition-all"
              >
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


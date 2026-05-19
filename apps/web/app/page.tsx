"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseMedical,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  HeartPulse,
  MapPin,
  Navigation,
  PhoneCall,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AdSlider from "@/components/AdSlider";
import PlatformExpansion from "@/components/PlatformExpansion";
import { Doctor, Advertisement } from "@/lib/types";
import { CITIES } from "@/lib/constants";
import { getDistance } from "@/lib/distance";

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100/50 backdrop-blur-md animate-pulse rounded-[2rem] border border-slate-200/50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <span className="text-slate-500 font-bold tracking-wider">جاري تحميل الخريطة الذكية...</span>
    </div>
  ),
});

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1777331903190-341a3dd0441b?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2200";

const QUICK_CATEGORIES = [
  { id: "implants", label: "زراعة الأسنان", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "orthodontics", label: "تقويم الأسنان", icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "cosmetic", label: "تجميل الأسنان", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "general", label: "طب أسنان عام", icon: BriefcaseMedical, color: "text-purple-500", bg: "bg-purple-50" },
];

const HERO_TRUST_POINTS = [
  { label: "أطباء موثقون", icon: BadgeCheck },
  { label: "حجز ومقارنة سريعة", icon: CalendarCheck2 },
  { label: "تواصل مباشر", icon: PhoneCall },
];

// Major Palestinian insurance companies list
const PALESTINIAN_INSURANCES = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

// Self-diagnosis options mapping to specialties
const DIAGNOSIS_OPTIONS = [
  { id: "diag1", title: "ألم شديد أو نابض في السن (عصب)", specialty: "طب أسنان عام", desc: "غالباً ما يستدعي سحب عصب السن وتنظيف القنوات" },
  { id: "diag2", title: "اعوجاج أو فراغات في ترتيب الأسنان", specialty: "تقويم الأسنان", desc: "تصحيح الفكين واصطفاف الأسنان للأطفال والبالغين" },
  { id: "diag3", title: "أسنان مفقودة وتريد تعويضها", specialty: "زراعة الأسنان", desc: "تعويض الأسنان المفقودة بجذور تيتانيوم ألمانية/سويسرية" },
  { id: "diag4", title: "ألم لثة أو فحص لأسنان طفلك", specialty: "أسنان الأطفال", desc: "عناية متكاملة بأسنان الأطفال اللبنية والوقاية" }
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

    let normalizedDay = "";
    if (dayNameAr.includes("سبت")) normalizedDay = "السبت";
    else if (dayNameAr.includes("أحد")) normalizedDay = "الأحد";
    else if (dayNameAr.includes("اثنين")) normalizedDay = "الإثنين";
    else if (dayNameAr.includes("ثلاثاء")) normalizedDay = "الثلاثاء";
    else if (dayNameAr.includes("أربعاء")) normalizedDay = "الأربعاء";
    else if (dayNameAr.includes("خميس")) normalizedDay = "الخميس";
    else if (dayNameAr.includes("جمعة")) normalizedDay = "الجمعة";

    const dayHours = workingHours[normalizedDay] || workingHours[dayNameAr];
    if (!dayHours || dayHours.includes("مغلق") || dayHours.includes("Closed")) {
      return false;
    }

    const parts = dayHours.split("-").map((p: string) => p.trim());
    if (parts.length !== 2) return true;

    const parseTime = (str: string): number => {
      const timeParts = str.split(" ");
      if (timeParts.length < 2) return 0;
      const [hStr, mStr] = timeParts[0].split(":");
      let h = parseInt(hStr);
      const m = parseInt(mStr);
      const isPm = timeParts[1].includes("م") || timeParts[1].toLowerCase().includes("pm");
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
      return h * 60 + m;
    };

    const startMinutes = parseTime(parts[0]);
    const endMinutes = parseTime(parts[1]);

    const [nowH, nowM] = timeStr.split(":").map(Number);
    const nowMinutes = nowH * 60 + nowM;

    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  } catch (e) {
    console.error("Error parsing hours:", e);
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
  const [activeDiagnosis, setActiveDiagnosis] = useState("");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Fetch real data on load
  useEffect(() => {
    async function loadData() {
      try {
        const [doctorsRes, adsRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/advertisements")
        ]);
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        }
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(Array.isArray(adsData) ? adsData : []);
        }
      } catch (err) {
        console.error("Error loading homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => alert("تعذر الوصول إلى الموقع. يرجى تفعيل الـ GPS والتأكد من الصلاحيات.")
      );
    }
  };

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    const needle = searchQuery.trim().toLowerCase();
    if (needle) {
      result = result.filter((doc) => {
        const searchable = [
          doc.name,
          doc.city,
          doc.area,
          doc.bio,
          ...(Array.isArray(doc.specialty) ? doc.specialty : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(needle);
      });
    }
    if (selectedCity) {
      result = result.filter((doc) => doc.city === selectedCity);
    }
    if (selectedSpecialty) {
      result = result.filter((doc) =>
        Array.isArray(doc.specialty) && doc.specialty.some((s) => s === selectedSpecialty)
      );
    }
    if (selectedInsurance) {
      result = result.filter((doc) =>
        doc.accepts_insurance && doc.insurance_list?.includes(selectedInsurance)
      );
    }
    if (selectedWorkStatus === "open") {
      result = result.filter((doc) => isDoctorOpenNow(doc.working_hours));
    } else if (selectedWorkStatus === "closed") {
      result = result.filter((doc) => !isDoctorOpenNow(doc.working_hours));
    }
    if (activeDiagnosis) {
      const match = DIAGNOSIS_OPTIONS.find(d => d.id === activeDiagnosis);
      if (match) {
        result = result.filter((doc) =>
          Array.isArray(doc.specialty) && doc.specialty.some((s) => s === match.specialty)
        );
      }
    }

    if (userLoc) {
      result = result.map((doc) => ({
        ...doc,
        distance: (doc.lat && doc.lng) ? getDistance(userLoc.lat, userLoc.lng, doc.lat, doc.lng) : undefined
      }));
      result.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    } else {
      result.sort((a, b) => {
        if (a.is_featured === b.is_featured) return (b.rating || 0) - (a.rating || 0);
        return a.is_featured ? -1 : 1;
      });
    }

    return result;
  }, [doctors, searchQuery, selectedCity, selectedSpecialty, selectedInsurance, selectedWorkStatus, activeDiagnosis, userLoc]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f7fafc] font-sans">
      <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-8 sm:py-10 lg:px-8">
        <Image
          src={HERO_IMAGE_URL}
          alt="طبيب أسنان يتحدث مع مريض داخل عيادة حديثة"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/95 via-slate-950/72 to-slate-900/30" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7fafc] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-[1400px] flex-col justify-center sm:min-h-[620px]">
          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-12">
            <div className="max-w-4xl text-right text-white" dir="rtl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-black text-white backdrop-blur-md sm:mb-6 sm:text-sm">
                <Sparkles className="h-4 w-4 text-amber-300" />
                دليل الأسنان الذكي في فلسطين
              </div>

              <h1 className="text-2xl font-black leading-tight min-[430px]:text-3xl sm:text-5xl lg:text-7xl">
                ابتسامتك تبدأ من اختيار الطبيب الصح.
              </h1>

              <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-slate-100 sm:text-base md:text-xl">
                ابحث عن أطباء الأسنان والعيادات حسب المدينة، التخصص، التأمين، والدوام، ثم قارن واحجز أو تواصل مباشرة من مكان واحد.
              </p>

              <div className="mt-5 flex flex-wrap justify-start gap-2 sm:mt-8 sm:gap-3">
                {HERO_TRUST_POINTS.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white backdrop-blur-md sm:px-4 sm:text-sm"
                  >
                    <item.icon className="h-4 w-4 text-sky-300" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/25 bg-white/95 p-4 text-right shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-md md:p-5" dir="rtl">
              <div className="mb-3 sm:mb-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">ابدأ البحث</p>
                <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">اعثر على الطبيب المناسب</h2>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white sm:min-h-12">
                  <Search className="h-5 w-5 flex-shrink-0 text-sky-500" />
                  <input
                    type="text"
                    placeholder="اسم الطبيب، المنطقة، أو التخصص"
                    className="w-full bg-transparent py-2.5 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 sm:py-3 sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>

                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white sm:min-h-12">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-sky-500" />
                  <select
                    aria-label="اختيار المحافظة"
                    className="w-full cursor-pointer appearance-none bg-transparent py-2.5 text-sm font-black text-slate-800 outline-none sm:py-3 sm:text-base"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">كل المحافظات</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white sm:min-h-12">
                    <Clock className="h-5 w-5 flex-shrink-0 text-sky-500" />
                    <select
                      aria-label="اختيار حالة الدوام"
                      className="w-full cursor-pointer appearance-none bg-transparent py-2.5 text-sm font-black text-slate-800 outline-none sm:py-3"
                      value={selectedWorkStatus}
                      onChange={(e) => setSelectedWorkStatus(e.target.value as any)}
                    >
                      <option value="any">كل الأوقات</option>
                      <option value="open">مفتوح الآن</option>
                      <option value="closed">مغلق حالياً</option>
                    </select>
                  </label>

                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white sm:min-h-12">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-sky-500" />
                    <select
                      aria-label="اختيار التأمين"
                      className="w-full cursor-pointer appearance-none bg-transparent py-2.5 text-sm font-black text-slate-800 outline-none sm:py-3"
                      value={selectedInsurance}
                      onChange={(e) => setSelectedInsurance(e.target.value)}
                    >
                      <option value="">كل التأمينات</option>
                      {PALESTINIAN_INSURANCES.map((ins) => (
                        <option key={ins} value={ins}>{ins}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLocationSearch}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-all sm:mt-4 sm:py-4 ${
                  userLoc
                    ? "bg-emerald-600 shadow-lg shadow-emerald-600/20"
                    : "bg-slate-950 hover:bg-sky-600"
                }`}
              >
                <Navigation className={`h-5 w-5 -rotate-45 ${userLoc ? "animate-pulse" : ""}`} />
                {userLoc ? "تم تفعيل البحث بالقرب منك" : "رتب النتائج حسب الأقرب لي"}
              </button>
            </div>
          </div>

          <div className="mt-5 grid max-w-3xl grid-cols-3 gap-2 text-right sm:mt-8 sm:gap-3" dir="rtl">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md">
              <p className="text-2xl font-black">{doctors.length || "24+"}</p>
              <p className="mt-1 text-xs font-bold text-slate-200">عيادة وطبيب</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md">
              <p className="text-2xl font-black">{CITIES.length}</p>
              <p className="mt-1 text-xs font-bold text-slate-200">محافظة</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md">
              <p className="text-2xl font-black">4.8</p>
              <p className="mt-1 text-xs font-bold text-slate-200">تجربة موثوقة</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-8 w-full max-w-[1400px] px-4 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-7" dir="rtl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950">اختيار سريع حسب الحالة</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">اختر العرض الأقرب لك وسنقرب نتائج التخصص المناسب.</p>
              </div>
            </div>
            {activeDiagnosis ? (
              <button
                type="button"
                onClick={() => setActiveDiagnosis("")}
                className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:border-sky-200 hover:text-sky-700"
              >
                إزالة الاختيار
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {DIAGNOSIS_OPTIONS.map((diag) => (
              <button
                key={diag.id}
                type="button"
                onClick={() => setActiveDiagnosis(activeDiagnosis === diag.id ? "" : diag.id)}
                className={`min-h-36 rounded-xl border p-4 text-right transition-all ${
                  activeDiagnosis === diag.id
                    ? "border-sky-500 bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-sky-200 hover:bg-white"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className={`text-xs font-black ${activeDiagnosis === diag.id ? "text-sky-100" : "text-sky-600"}`}>
                    {diag.specialty}
                  </span>
                  {activeDiagnosis === diag.id ? <CheckCircle2 className="h-5 w-5 text-white" /> : null}
                </div>
                <h4 className="text-base font-black leading-6">{diag.title}</h4>
                <p className={`mt-2 text-xs font-bold leading-6 ${activeDiagnosis === diag.id ? "text-sky-50" : "text-slate-500"}`}>
                  {diag.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main App Content */}
      <section id="doctors" className="relative z-20 mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 pb-24 pt-10 lg:flex-row lg:px-8">
        
        {/* Left Column: Smart Map */}
        {showMap && (
          <div className="order-1 h-[500px] w-full animate-in fade-in slide-in-from-left duration-500 lg:sticky lg:top-24 lg:order-2 lg:h-[calc(100vh-140px)] lg:w-[45%]">
            <div className="h-full w-full relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent blur-3xl -z-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
              <DoctorMap doctors={filteredDoctors} userLocation={userLoc || undefined} />
              
              {userLoc && (
                <div className="absolute left-6 top-6 z-30 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-white shadow-2xl backdrop-blur-md">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-sm tracking-wide">رادار الموقع الذكي مفعل</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Listing & Ads */}
        <div className={`order-2 flex flex-col gap-8 transition-all duration-500 lg:order-1 ${showMap ? "w-full lg:w-[55%]" : "mx-auto w-full max-w-5xl"}`}>
          
          {/* Quick Categories */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSpecialty(selectedSpecialty === cat.label ? "" : cat.label)}
                className={`group relative flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                  selectedSpecialty === cat.label 
                  ? "bg-white shadow-xl shadow-primary/15 border-primary scale-[1.03] ring-2 ring-primary/20" 
                  : "bg-white/70 shadow-sm border-slate-200/60 hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-slate-300"
                }`}
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${cat.bg} ${cat.color} transition-transform duration-300 group-hover:scale-105 ${selectedSpecialty === cat.label ? "scale-105" : ""}`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <span className={`font-black text-sm transition-colors ${selectedSpecialty === cat.label ? "text-primary" : "text-slate-800 group-hover:text-slate-900"}`}>{cat.label}</span>
                
                {/* Click indicator */}
                <span className={`text-[10px] font-bold mt-1.5 transition-all ${selectedSpecialty === cat.label ? "text-primary" : "text-slate-400 group-hover:text-sky-500"}`}>
                  {selectedSpecialty === cat.label ? "✓ مُفعّل" : "انقر للتصفية"}
                </span>

                {/* Selected checkmark */}
                {selectedSpecialty === cat.label && (
                  <div className="absolute left-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Monetization: Ad Slider */}
          <AdSlider ads={ads} />

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2" dir="rtl">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">
                {loading ? "جاري تحميل الأطباء" : filteredDoctors.length > 0 ? "الأطباء المتاحون" : "لم نجد نتائج"}
              </h2>
              <span className="bg-slate-200/50 text-slate-600 font-black px-4 py-1.5 rounded-full text-xs">
                {loading ? "..." : `${filteredDoctors.length} نتيجة`}
              </span>
            </div>

            {/* Beautiful Map/List Toggle Switch */}
            <div className="flex items-center bg-white/85 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50 shadow-sm w-fit self-end sm:self-auto">
              <button
                onClick={() => setShowMap(false)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  !showMap
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BriefcaseMedical className="w-3.5 h-3.5" />
                <span>عرض القائمة</span>
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  showMap
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>عرض الخريطة</span>
              </button>
            </div>
          </div>

          {/* Doctors List */}
          <div className="flex flex-col gap-6">
            {loading && (
              <div className="grid gap-4">
                {["skeleton-one", "skeleton-two", "skeleton-three"].map((key) => (
                  <div key={key} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
                    <div className="h-52 w-full animate-pulse rounded-xl bg-slate-100 sm:h-40 sm:w-44" />
                    <div className="flex flex-1 flex-col justify-center gap-4">
                      <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100" />
                      <div className="flex gap-2">
                        <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-100" />
                        <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
                      </div>
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredDoctors.map((doc, index) => (
              <div key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <Link href={`/doctors/${doc.id}`} className="block group">
                  <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/60 hover:shadow-[0_20px_40px_-10px_rgba(14,165,233,0.15)] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row gap-6 cursor-pointer">
                    
                    <div className="relative w-full sm:w-44 h-52 sm:h-auto rounded-[1.5rem] overflow-hidden bg-slate-50 flex-shrink-0">
                      {doc.image_url ? (
                        <Image src={doc.image_url} alt={doc.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30">
                          <HeartPulse className="w-12 h-12" />
                        </div>
                      )}
                      {doc.is_featured && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-1 backdrop-blur-md">
                          <Star className="w-3 h-3 fill-current" /> مميز
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{doc.name}</h3>
                          {doc.verified && <CheckCircle2 className="w-5 h-5 text-secondary" />}
                        </div>
                        {(doc.rating || 0) > 0 && (
                          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl font-bold text-sm border border-yellow-100">
                            <Star className="w-4 h-4 fill-current" /> {doc.rating}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {(Array.isArray(doc.specialty) ? doc.specialty : []).map((spec, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200/50">
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {doc.city}{doc.area ? ` — ${doc.area}` : ""}
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${
                              isDoctorOpenNow(doc.working_hours) 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDoctorOpenNow(doc.working_hours) ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                              {isDoctorOpenNow(doc.working_hours) ? "مفتوح الآن" : "مغلق حالياً"}
                            </span>
                          </div>
                          {doc.distance !== undefined && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-black bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                              <Route className="w-4 h-4" />
                              يبعد {doc.distance.toFixed(1)} كم عنك
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 group-hover:from-primary group-hover:to-sky-500 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 text-center shadow-lg group-hover:shadow-primary/30 flex items-center justify-center gap-2 flex-shrink-0">
                          عرض واحجز <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              </div>
            ))}

            {!loading && filteredDoctors.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm md:p-16">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">لا توجد نتائج مطابقة</h3>
                <p className="text-slate-500 font-medium text-lg">الرجاء إزالة بعض الفلاتر أو استخدام كلمات عامة.</p>
              </div>
            )}

            {/* B2B Call to Action */}
            <div className="relative mt-8 overflow-hidden rounded-2xl bg-slate-950 p-8 text-center text-white shadow-2xl md:p-12">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-sky-400 via-emerald-300 to-amber-300" />
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-black mb-4">هل أنت طبيب أسنان؟</h3>
                <p className="text-slate-300 font-medium text-lg mb-8 max-w-xl mx-auto">
                  انضم لأكبر شبكة طبية، احصل على حجوزات أكثر، واعرض خدماتك أمام الآلاف من المرضى يومياً.
                </p>
                <Link 
                  href="/join"
                  className="inline-block bg-white text-slate-900 hover:bg-primary hover:text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-primary/40"
                >
                  سجّل عيادتك الآن
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PlatformExpansion />

      {/* Sleek Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-right md:text-left">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-1 select-none">
              <span>أسناني</span>
              <span className="text-primary">.ps</span>
            </h2>
            <p className="text-slate-500 font-medium mt-2">دليلك الأذكى للرعاية السنية في فلسطين.</p>
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-600">
            <Link href="/about" className="hover:text-primary transition-colors">عن المنصة</Link>
            <Link href="/join" className="hover:text-primary transition-colors">انضم كطبيب</Link>
            <Link href="/advertise" className="hover:text-primary transition-colors">أعلن معنا</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
          </div>
          <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} Asnani.ps. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

    </div>
  );
}

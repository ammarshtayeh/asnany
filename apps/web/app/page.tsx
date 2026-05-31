"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
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
import AdSlider from "@/components/AdSlider";
import PlatformExpansion from "@/components/PlatformExpansion";
import { CITIES } from "@/lib/constants";
import { getDistance } from "@/lib/distance";
import { Advertisement, Doctor } from "@/lib/types";

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      <span className="text-sm font-bold text-slate-500">جاري تحميل الخريطة...</span>
    </div>
  ),
});

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&fm=jpg&q=80&w=2200";

const QUICK_CATEGORIES = [
  { id: "implants", label: "زراعة الأسنان", icon: ShieldCheck, color: "text-sky-600", bg: "bg-sky-50" },
  { id: "orthodontics", label: "تقويم الأسنان", icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "cosmetic", label: "تجميل الأسنان", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "general", label: "طب أسنان عام", icon: BriefcaseMedical, color: "text-violet-600", bg: "bg-violet-50" },
];

const TRUST_POINTS = [
  { label: "أطباء موثقون", icon: BadgeCheck },
  { label: "حجز ومقارنة", icon: CalendarCheck2 },
  { label: "تواصل مباشر", icon: PhoneCall },
];

const PALESTINIAN_INSURANCES = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

const DIAGNOSIS_OPTIONS = [
  { id: "diag1", title: "ألم شديد أو نابض", specialty: "طب أسنان عام", desc: "غالبا يحتاج فحص عصب أو علاج طارئ." },
  { id: "diag2", title: "اعوجاج أو فراغات", specialty: "تقويم الأسنان", desc: "ابدأ بمقارنة أطباء التقويم القريبين." },
  { id: "diag3", title: "سن مفقود", specialty: "زراعة الأسنان", desc: "اعثر على عيادات زراعة الأسنان الموثقة." },
  { id: "diag4", title: "أسنان الأطفال", specialty: "أسنان الأطفال", desc: "خيارات مناسبة لفحص الأطفال والوقاية." },
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
  const [activeDiagnosis, setActiveDiagnosis] = useState("");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [doctorsRes, adsRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/advertisements"),
        ]);
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        }
        if (adsRes.ok) {
          const adsData = await adsRes.json();
          setAds(Array.isArray(adsData) ? adsData : []);
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
        Array.isArray(doc.specialty) && doc.specialty.some((specialty) => specialty === selectedSpecialty)
      );
    }
    if (selectedInsurance) {
      result = result.filter((doc) => doc.accepts_insurance && doc.insurance_list?.includes(selectedInsurance));
    }
    if (selectedWorkStatus === "open") result = result.filter((doc) => isDoctorOpenNow(doc.working_hours));
    if (selectedWorkStatus === "closed") result = result.filter((doc) => !isDoctorOpenNow(doc.working_hours));
    if (activeDiagnosis) {
      const match = DIAGNOSIS_OPTIONS.find((diagnosis) => diagnosis.id === activeDiagnosis);
      if (match) {
        result = result.filter((doc) =>
          Array.isArray(doc.specialty) && doc.specialty.some((specialty) => specialty === match.specialty)
        );
      }
    }

    if (userLoc) {
      result = result.map((doc) => ({
        ...doc,
        distance: doc.lat && doc.lng ? getDistance(userLoc.lat, userLoc.lng, doc.lat, doc.lng) : undefined,
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
  }, [activeDiagnosis, doctors, searchQuery, selectedCity, selectedInsurance, selectedSpecialty, selectedWorkStatus, userLoc]);

  const hasActiveFilters =
    searchQuery || selectedCity || selectedSpecialty || selectedInsurance || selectedWorkStatus !== "any" || activeDiagnosis;

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedSpecialty("");
    setSelectedInsurance("");
    setSelectedWorkStatus("any");
    setActiveDiagnosis("");
  };

  const handleLocationSearch = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("تعذر الوصول إلى الموقع. يرجى تفعيل صلاحيات الموقع والمحاولة مجددا.")
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans">
      <section className="relative isolate bg-slate-950 px-4 py-6 sm:py-8 lg:px-8">
        <Image
          src={HERO_IMAGE_URL}
          alt="عيادة أسنان حديثة"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative z-10 mx-auto grid min-h-[520px] w-full max-w-[1400px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="max-w-3xl text-right text-white" dir="rtl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              دليل الأسنان الذكي في فلسطين
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              اعثر على طبيب الأسنان المناسب، بسرعة ووضوح.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-100 sm:text-lg">
              ابحث حسب المدينة، التخصص، التأمين، أو الدوام. قارن الأطباء والعيادات وتواصل أو احجز من مكان واحد.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {TRUST_POINTS.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-black text-white">
                  <item.icon className="h-4 w-4 text-sky-300" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white p-4 text-right shadow-2xl sm:p-5" dir="rtl">
            <p className="text-xs font-black text-sky-600">ابدأ البحث</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">من تبحث عنه اليوم؟</h2>
            <div className="mt-4 space-y-3">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white">
                <Search className="h-5 w-5 text-sky-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full bg-transparent py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="اسم الطبيب، المنطقة، أو التخصص"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectShell icon={<MapPin className="h-5 w-5 text-sky-500" />}>
                  <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 text-sm font-black text-slate-800 outline-none">
                    <option value="">كل المحافظات</option>
                    {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </SelectShell>
                <SelectShell icon={<Stethoscope className="h-5 w-5 text-sky-500" />}>
                  <select value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 text-sm font-black text-slate-800 outline-none">
                    <option value="">كل التخصصات</option>
                    {QUICK_CATEGORIES.map((category) => <option key={category.id} value={category.label}>{category.label}</option>)}
                    <option value="أسنان الأطفال">أسنان الأطفال</option>
                  </select>
                </SelectShell>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectShell icon={<Clock className="h-5 w-5 text-sky-500" />}>
                  <select value={selectedWorkStatus} onChange={(event) => setSelectedWorkStatus(event.target.value as any)} className="w-full cursor-pointer appearance-none bg-transparent py-3 text-sm font-black text-slate-800 outline-none">
                    <option value="any">كل الأوقات</option>
                    <option value="open">مفتوح الآن</option>
                    <option value="closed">مغلق حاليا</option>
                  </select>
                </SelectShell>
                <SelectShell icon={<ShieldCheck className="h-5 w-5 text-sky-500" />}>
                  <select value={selectedInsurance} onChange={(event) => setSelectedInsurance(event.target.value)} className="w-full cursor-pointer appearance-none bg-transparent py-3 text-sm font-black text-slate-800 outline-none">
                    <option value="">كل التأمينات</option>
                    {PALESTINIAN_INSURANCES.map((insurance) => <option key={insurance} value={insurance}>{insurance}</option>)}
                  </select>
                </SelectShell>
              </div>
              <button
                type="button"
                onClick={handleLocationSearch}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition ${
                  userLoc ? "bg-emerald-600" : "bg-slate-950 hover:bg-sky-600"
                }`}
              >
                <Navigation className={`h-5 w-5 -rotate-45 ${userLoc ? "animate-pulse" : ""}`} />
                {userLoc ? "تم ترتيب النتائج حسب الأقرب" : "رتب النتائج حسب الأقرب لي"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8">
        <section className="grid gap-3 sm:grid-cols-3" dir="rtl">
          <Metric value={loading ? "..." : doctors.length || "24+"} label="عيادة وطبيب" />
          <Metric value={String(CITIES.length)} label="محافظة" />
          <Metric value="موثوق" label="تجربة بحث وحجز" />
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm" dir="rtl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-sky-600">اختيار سريع</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">اختر حسب الحالة أو التخصص</h2>
            </div>
            {hasActiveFilters ? (
              <button type="button" onClick={resetFilters} className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 hover:border-sky-200 hover:text-sky-700">
                إزالة الفلاتر
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {DIAGNOSIS_OPTIONS.map((diagnosis) => (
              <button
                key={diagnosis.id}
                type="button"
                onClick={() => setActiveDiagnosis(activeDiagnosis === diagnosis.id ? "" : diagnosis.id)}
                className={`min-h-32 rounded-xl border p-4 text-right transition ${
                  activeDiagnosis === diagnosis.id
                    ? "border-sky-500 bg-sky-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-sky-200 hover:bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className={`text-xs font-black ${activeDiagnosis === diagnosis.id ? "text-sky-100" : "text-sky-600"}`}>
                    {diagnosis.specialty}
                  </span>
                  {activeDiagnosis === diagnosis.id ? <CheckCircle2 className="h-5 w-5" /> : null}
                </div>
                <h3 className="text-base font-black leading-6">{diagnosis.title}</h3>
                <p className={`mt-2 text-xs font-bold leading-6 ${activeDiagnosis === diagnosis.id ? "text-sky-50" : "text-slate-500"}`}>
                  {diagnosis.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" dir="rtl">
          {QUICK_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedSpecialty(selectedSpecialty === category.label ? "" : category.label)}
              className={`min-h-28 rounded-2xl border p-4 text-center transition ${
                selectedSpecialty === category.label ? "border-sky-400 bg-white shadow-md" : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <span className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${category.bg} ${category.color}`}>
                <category.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-black text-slate-900">{category.label}</span>
            </button>
          ))}
        </section>

        <section className="mt-8">
          <AdSlider ads={ads} />
        </section>

        <section id="doctors" className="mt-8 flex flex-col gap-6 lg:flex-row" dir="rtl">
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
                <button type="button" onClick={() => setShowMap(true)} className={`rounded-lg px-4 py-2 text-xs font-black ${showMap ? "bg-sky-600 text-white" : "text-slate-500"}`}>
                  الخريطة
                </button>
              </div>
            </div>

            {loading ? <LoadingList /> : null}
            {!loading && filteredDoctors.map((doctor) => <DoctorResult key={doctor.id} doctor={doctor} />)}
            {!loading && !filteredDoctors.length ? <EmptyResults onReset={resetFilters} /> : null}

            <div className="rounded-2xl bg-slate-950 p-7 text-center text-white">
              <h3 className="text-2xl font-black">هل أنت طبيب أسنان؟</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
                انضم إلى شبكة أسناني، اعرض خدماتك، واستقبل طلبات المرضى من مكان واحد.
              </p>
              <Link href="/join" className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black text-slate-950 hover:bg-sky-50">
                سجل عيادتك الآن
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PlatformExpansion />
      <Footer />
    </div>
  );
}

function SelectShell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white">
      {icon}
      {children}
    </label>
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
  return (
    <Link href={`/doctors/${doctor.id}`} className="group block">
      <article className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow-md sm:flex-row">
        <div className="relative h-52 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-auto sm:w-44">
          {doctor.image_url ? (
            <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sky-200">
              <HeartPulse className="h-12 w-12" />
            </div>
          )}
          {doctor.is_featured ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-black text-white">
              <Star className="h-3 w-3 fill-current" />
              مميز
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-950 group-hover:text-sky-600">{doctor.name}</h3>
                {doctor.verified ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Array.isArray(doctor.specialty) ? doctor.specialty : []).map((specialty) => (
                  <span key={specialty} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            {(doctor.rating || 0) > 0 ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-700">
                <Star className="h-4 w-4 fill-current" />
                {doctor.rating}
              </span>
            ) : null}
          </div>
          <div className="mt-auto flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <MapPin className="h-4 w-4" />
                {doctor.city}{doctor.area ? ` - ${doctor.area}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${
                  openNow ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-slate-200 bg-slate-100 text-slate-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {openNow ? "مفتوح الآن" : "مغلق حاليا"}
                </span>
                {doctor.distance !== undefined ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
                    <Route className="h-3.5 w-3.5" />
                    {doctor.distance.toFixed(1)} كم
                  </span>
                ) : null}
              </div>
            </div>
            <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition group-hover:bg-sky-600">
              عرض واحجز
              <ArrowLeft className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
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
        جرّب إزالة بعض الفلاتر أو البحث باسم مدينة أو تخصص أوسع.
      </p>
      <button type="button" onClick={onReset} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-sky-600">
        عرض كل الأطباء
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 lg:px-8" dir="rtl">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-5 text-center md:flex-row md:text-right">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            أسناني<span className="text-sky-500">.ps</span>
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">دليلك الأذكى للرعاية السنية في فلسطين.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-5 text-sm font-bold text-slate-600">
          <Link href="/about" className="hover:text-sky-600">عن المنصة</Link>
          <Link href="/join" className="hover:text-sky-600">انضم كطبيب</Link>
          <Link href="/advertise" className="hover:text-sky-600">أعلن معنا</Link>
          <Link href="/terms" className="hover:text-sky-600">الشروط والأحكام</Link>
        </div>
        <p className="text-sm font-semibold text-slate-400">© {new Date().getFullYear()} Asnani.ps</p>
      </div>
    </footer>
  );
}

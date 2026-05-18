"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Navigation, Star, CheckCircle2, Route, HeartPulse, ShieldCheck, Stethoscope, BriefcaseMedical, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AdSlider from "@/components/AdSlider";
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

// Expanded Mock Data
// Expanded Mock Data with Palestinian Insurance list
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "د. أحمد محمود",
    specialty: ["زراعة الأسنان", "تجميل الأسنان", "جراحة الفكين"],
    city: "رام الله",
    area: "الماصيون - شارع المعهد",
    lat: 31.898,
    lng: 35.201,
    rating: 4.9,
    is_featured: true,
    accepts_insurance: true,
    insurance_list: ["التكافل", "ترست", "المشرق"],
    verified: true,
    image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "د. سارة عيسى",
    specialty: ["تقويم الأسنان"],
    city: "نابلس",
    area: "رفيديا",
    lat: 32.221,
    lng: 35.254,
    rating: 4.8,
    is_featured: true,
    accepts_insurance: false,
    verified: true,
    image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "د. خالد عبد الله",
    specialty: ["طب أسنان عام", "علاج العصب"],
    city: "الخليل",
    area: "عين سارة",
    lat: 31.532,
    lng: 35.099,
    rating: 4.5,
    is_featured: false,
    accepts_insurance: true,
    insurance_list: ["التكافل", "المجموعة الأهلية"],
    verified: false,
    image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "د. ياسمين خليل",
    specialty: ["أسنان الأطفال"],
    city: "رام الله",
    area: "الإرسال",
    lat: 31.912,
    lng: 35.205,
    rating: 4.7,
    is_featured: false,
    accepts_insurance: true,
    insurance_list: ["ترست", "تمكين"],
    verified: true,
    image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=400&auto=format&fit=crop",
    created_at: new Date().toISOString(),
  },
];

const MOCK_ADS: Advertisement[] = [
  {
    id: "ad1",
    advertiser_name: "مركز رام الله لزراعة الأسنان",
    advertiser_type: "doctor",
    ad_type: "banner",
    image_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
    link_url: "#",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    is_active: true,
    clicks: 120,
  },
  {
    id: "ad2",
    advertiser_name: "شركة فلسطين للمعدات الطبية",
    advertiser_type: "store",
    ad_type: "banner",
    image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop",
    link_url: "#",
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    is_active: true,
    clicks: 450,
  },
];

const QUICK_CATEGORIES = [
  { id: "implants", label: "زراعة الأسنان", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "orthodontics", label: "تقويم الأسنان", icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "cosmetic", label: "تجميل الأسنان", icon: SparklesIcon, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "general", label: "طب عام", icon: BriefcaseMedical, color: "text-purple-500", bg: "bg-purple-50" },
];

function SparklesIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

// Major Palestinian insurance companies list
const PALESTINIAN_INSURANCES = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

// Self-diagnosis options mapping to specialties
const DIAGNOSIS_OPTIONS = [
  { id: "diag1", title: "ألم شديد أو نابض في السن (عصب)", specialty: "طب أسنان عام", desc: "غالباً ما يستدعي سحب عصب السن وتنظيف القنوات" },
  { id: "diag2", title: "اعوجاج أو فراغات في ترتيب الأسنان", specialty: "تقويم الأسنان", desc: "تصحيح الفكين واصطفاف الأسنان للأطفال والبالغين" },
  { id: "diag3", title: "أسنان مفقودة وتريد تعويضها", specialty: "زراعة الأسنان", desc: "تعويض الأسنان المفقودة بجذور تيتانيوم ألمانية/سويسرية" },
  { id: "diag4", title: "ألم لثة أو فحص لأسنان طفلك", specialty: "أسنان الأطفال", desc: "عناية متكاملة بأسنان الأطفال اللبنية والوقاية" }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState("");
  const [activeDiagnosis, setActiveDiagnosis] = useState("");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

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
    let result = [...MOCK_DOCTORS];

    if (searchQuery) {
      result = result.filter((doc) => doc.name.includes(searchQuery));
    }
    if (selectedCity) {
      result = result.filter((doc) => doc.city === selectedCity);
    }
    if (selectedSpecialty) {
      result = result.filter((doc) =>
        doc.specialty.some((s) => s === selectedSpecialty)
      );
    }
    if (selectedInsurance) {
      result = result.filter((doc) =>
        doc.accepts_insurance && doc.insurance_list?.includes(selectedInsurance)
      );
    }
    if (activeDiagnosis) {
      const match = DIAGNOSIS_OPTIONS.find(d => d.id === activeDiagnosis);
      if (match) {
        result = result.filter((doc) =>
          doc.specialty.some((s) => s === match.specialty)
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
        if (a.is_featured === b.is_featured) return b.rating - a.rating;
        return a.is_featured ? -1 : 1;
      });
    }

    return result;
  }, [searchQuery, selectedCity, selectedSpecialty, selectedInsurance, activeDiagnosis, userLoc]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* 🚀 BREATHTAKING HERO SECTION */}
      <section className="relative pt-28 pb-36 px-4 lg:px-8 z-10 flex flex-col items-center text-center overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-0 -left-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" />
        <div className="absolute top-0 -right-10 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[40rem] h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-sm font-black text-slate-800">أضخم شبكة طبية في فلسطين</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
            رعاية أسنانك تبدأ <br className="hidden md:block" />
            <span className="text-gradient">بخطوة ذكية</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-600 mb-12 max-w-3xl font-medium leading-relaxed">
            منصة متكاملة تجمع نخبة أطباء الأسنان. حدد موقعك، اختر طبيبك بناءً على التقييمات الحقيقية، واحجز موعدك فوراً.
          </p>

          {/* Premium Search Bar */}
          <div className="w-full max-w-4xl bg-white rounded-full p-2 flex flex-col md:flex-row items-center gap-1 shadow-[0_15px_50px_-10px_rgba(0,0,0,0.08)] border border-slate-100/80 relative z-30 transition-all duration-300 hover:shadow-[0_20px_60px_-5px_rgba(0,0,0,0.12)]" dir="rtl">
            
            {/* 🔍 Search Input */}
            <div className="flex-1 w-full relative flex items-center pr-4">
              <Search className="text-sky-500 w-5 h-5 ml-3" />
              <input
                type="text"
                placeholder="ابحث باسم الطبيب..."
                className="w-full bg-transparent border-none outline-none py-3 text-slate-800 font-bold placeholder:text-slate-400 placeholder:font-semibold text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Divider */}
            <div className="hidden md:block w-[1px] h-8 bg-slate-200/80" />

            {/* 📍 Governorates Dropdown */}
            <div className="w-full md:w-56 relative flex items-center px-4">
              <MapPin className="text-sky-500 w-5 h-5 ml-2.5" />
              <select
                className="w-full bg-transparent border-none outline-none py-3 text-slate-800 font-bold text-base cursor-pointer appearance-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">كل المحافظات</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-8 bg-slate-200/80" />

            {/* 🛡️ Insurance Dropdown */}
            <div className="w-full md:w-56 relative flex items-center px-4">
              <ShieldCheck className="text-sky-500 w-5 h-5 ml-2.5" />
              <select
                className="w-full bg-transparent border-none outline-none py-3 text-slate-800 font-bold text-base cursor-pointer appearance-none"
                value={selectedInsurance}
                onChange={(e) => setSelectedInsurance(e.target.value)}
              >
                <option value="">كل شركات التأمين</option>
                {PALESTINIAN_INSURANCES.map((ins) => (
                  <option key={ins} value={ins}>{ins}</option>
                ))}
              </select>
            </div>

            {/* 🚀 Dark Blue Submit/Location Button */}
            <button 
              onClick={handleLocationSearch}
              className={`flex-shrink-0 w-12 h-12 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                userLoc 
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20" 
                : "bg-[#0f172a] hover:bg-[#1e293b] text-white"
              }`}
              title="ابحث بالقرب مني"
            >
              <Navigation className={`w-5 h-5 transform -rotate-45 ${userLoc ? "animate-pulse" : ""}`} />
            </button>
          </div>

          {/* 🦷 INTERACTIVE SELF-DIAGNOSIS ASSISTANT */}
          <div className="w-full max-w-4xl mt-12 bg-white/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/50 text-right" dir="rtl">
            <div className="flex items-center gap-2 mb-6 justify-start">
              <HeartPulse className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-black text-slate-900">مساعد التشخيص الفوري للأسنان</h3>
              <span className="text-xs font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-100">حدد أعراضك وسنرتب الأطباء المناسبين لك</span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DIAGNOSIS_OPTIONS.map((diag) => (
                <button
                  key={diag.id}
                  onClick={() => setActiveDiagnosis(activeDiagnosis === diag.id ? "" : diag.id)}
                  className={`p-4 rounded-2xl border text-right transition-all duration-300 ${
                    activeDiagnosis === diag.id
                    ? "bg-gradient-to-br from-primary to-blue-500 text-white border-transparent shadow-xl scale-105"
                    : "bg-white/80 hover:bg-white text-slate-800 border-slate-200/50 hover:shadow-md"
                  }`}
                >
                  <h4 className="font-bold text-[15px] mb-2 leading-tight">{diag.title}</h4>
                  <p className={`text-xs ${activeDiagnosis === diag.id ? "text-blue-100" : "text-slate-400"} leading-relaxed font-medium`}>
                    {diag.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Main App Content */}
      <section className="max-w-[1400px] mx-auto w-full px-4 lg:px-8 pb-24 relative z-20 -mt-16 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Smart Map */}
        <div className="w-full lg:w-[45%] order-1 lg:order-2 h-[500px] lg:h-[calc(100vh-140px)] sticky top-6">
          <div className="h-full w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent blur-3xl -z-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
            <DoctorMap doctors={filteredDoctors} userLocation={userLoc || undefined} />
            
            {userLoc && (
              <div className="absolute top-6 left-6 z-30 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-sm tracking-wide">رادار الموقع الذكي مفعل</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Listing & Ads */}
        <div className="w-full lg:w-[55%] order-2 lg:order-1 flex flex-col gap-8">
          
          {/* Quick Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSpecialty(selectedSpecialty === cat.label ? "" : cat.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 border ${
                  selectedSpecialty === cat.label 
                  ? "bg-white shadow-xl shadow-primary/10 border-primary scale-105" 
                  : "bg-white/60 shadow-sm border-transparent hover:bg-white hover:shadow-md"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-3`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-800 text-sm">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Monetization: Ad Slider */}
          <AdSlider ads={MOCK_ADS} />

          {/* Results Header */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900">
              {filteredDoctors.length > 0 ? "الأطباء المتاحين" : "لم نجد نتائج"}
            </h2>
            <span className="bg-slate-200/50 text-slate-600 font-bold px-4 py-1.5 rounded-full text-sm">
              {filteredDoctors.length} نتيجة
            </span>
          </div>

          {/* Doctors List */}
          <div className="flex flex-col gap-6">
            {filteredDoctors.map((doc, index) => (
              <div key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <Link href={`/doctors/${doc.id}`} className="block group">
                  <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_20px_40px_-10px_rgba(14,165,233,0.15)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row gap-6">
                    
                    {doc.is_featured && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-2xl rounded-full -translate-y-16 translate-x-16" />
                    )}

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
                        {doc.rating > 0 && (
                          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-xl font-bold text-sm">
                            <Star className="w-4 h-4 fill-current" /> {doc.rating}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {doc.specialty.map((spec, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200/50">
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-50">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {doc.city} — {doc.area}
                          </div>
                          {doc.distance !== undefined && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-black bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                              <Route className="w-4 h-4" />
                              يبعد {doc.distance.toFixed(1)} كم عنك
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-slate-900 group-hover:bg-primary text-white px-8 py-3 rounded-2xl text-sm font-black transition-all text-center shadow-lg group-hover:shadow-primary/30 flex items-center justify-center gap-2">
                          عرض واحجز <ArrowLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="bg-white/60 backdrop-blur-md p-16 rounded-[2.5rem] border border-white text-center flex flex-col items-center justify-center shadow-xl shadow-slate-200/20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">لا توجد نتائج مطابقة</h3>
                <p className="text-slate-500 font-medium text-lg">الرجاء إزالة بعض الفلاتر أو استخدام كلمات عامة.</p>
              </div>
            )}

            {/* B2B Call to Action */}
            <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-black mb-4">هل أنت طبيب أسنان؟</h3>
                <p className="text-slate-300 font-medium text-lg mb-8 max-w-xl mx-auto">
                  انضم لأكبر شبكة طبية، احصل على حجوزات أكثر، واعرض خدماتك أمام الآلاف من المرضى يومياً.
                </p>
                <button className="bg-white text-slate-900 hover:bg-primary hover:text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-primary/40">
                  سجّل عيادتك الآن
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sleek Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">أسناني<span className="text-primary">.</span>ps</h2>
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

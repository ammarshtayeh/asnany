"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, CheckCircle, Search, ArrowRight, Star, ShieldCheck, HeartPulse } from "lucide-react";
import { Doctor } from "@/lib/types";
import { doctorMapCoordinates } from "@/lib/map-links";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false });

export default function SetDoctorLocation() {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // Map Coordinates
  const [lat, setLat] = useState(31.898);
  const [lng, setLng] = useState(35.201);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const coordinatesAreValid = Number.isFinite(lat) && Number.isFinite(lng) && lat >= 31 && lat <= 33 && lng >= 34 && lng <= 36;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        setDoctorsList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setSuccess(false);
    const coords = doctorMapCoordinates(doc);
    setLat(coords.latitude);
    setLng(coords.longitude);
  };

  const handleSaveLocation = async () => {
    if (!selectedDoctor) return;
    if (!coordinatesAreValid) {
      alert("الإحداثيات خارج النطاق المتوقع لفلسطين. يرجى اختيار موقع صحيح على الخريطة.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/doctors/set-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          lat,
          lng,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedDoctor = { ...selectedDoctor, ...(data.doctor || {}), lat, lng };
        setSuccess(true);
        // Update local list item with new coordinates
        setSelectedDoctor(updatedDoctor);
        setDoctorsList(doctorsList.map(d => d.id === selectedDoctor.id ? { ...d, ...updatedDoctor } : d));
      } else {
        alert("فشل حفظ الموقع في الخريطة.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع.");
    } finally {
      setSaving(false);
    }
  };

  const filteredDoctors = searchQuery.trim() === ""
    ? []
    : doctorsList.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.city.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <main className="bg-slate-50 min-h-screen relative font-sans" dir="rtl">
      {/* Premium Header */}
      <div className="h-[250px] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900 to-secondary/80" />
        <div className="absolute top-8 right-8 z-50">
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="relative z-10 px-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <MapPin className="w-8 h-8 text-primary animate-bounce" /> بوابة تحديد موقع العيادة للأطباء
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            خطوات بسيطة لتثبيت موقع عيادتك على خرائط ملامح.ps وتسهيل إرشاد المريض إليك بخدمات الـ GPS المتقدمة.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100 space-y-8">
          
          {/* Step 1: Select Doctor */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</span>
              ابحث عن اسمك في دليل أطباء المنصة المعتمدين:
            </h2>

            <div className="relative max-w-md">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="اكتب اسمك الطبي لتحديد حسابك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-right font-medium text-sm"
              />
            </div>

            {/* Dropdown search results */}
            {searchQuery.trim() !== "" && filteredDoctors.length > 0 && (
              <div className="border border-slate-100 bg-white rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50 relative z-50">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      handleSelectDoctor(doc);
                      setSearchQuery("");
                    }}
                    className="w-full text-right px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {doc.image_url ? (
                          <img src={doc.image_url} alt={doc.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <HeartPulse className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <strong className="block text-slate-800 text-sm">د. {doc.name}</strong>
                        <span className="text-xs text-slate-400 font-medium">{doc.specialty.join("، ")} - {doc.city}</span>
                      </div>
                    </div>
                    {doc.lat !== null && doc.lat !== undefined && doc.lng !== null && doc.lng !== undefined ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">محدد مسبقاً 🗺️</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">غير محدد الموقع 📍</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim() !== "" && filteredDoctors.length === 0 && (
              <p className="text-xs font-medium text-slate-400">لم يتم العثور على أطباء بهذا الاسم حالياً.</p>
            )}
          </div>

          {/* Step 2: Show Selected Doctor Details */}
          {selectedDoctor && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 relative border border-slate-200">
                  {selectedDoctor.image_url ? (
                    <img src={selectedDoctor.image_url} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><HeartPulse className="w-8 h-8" /></div>
                  )}
                </div>

                <div className="pt-1">
                  <h3 className="text-xl font-black text-slate-900">د. {selectedDoctor.name}</h3>
                  <p className="text-slate-500 font-bold text-xs mt-1">{selectedDoctor.specialty.join("، ")} | {selectedDoctor.city}</p>
                </div>
              </div>

              {/* Map picking section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</span>
                  انقر على الخريطة لتحديد موقع عيادتك بالضبط، أو استخدم محدد الموقع التلقائي (GPS):
                </h4>

                <LocationPickerMap lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); setSuccess(false); }} />

                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 p-4 bg-white rounded-xl border border-slate-100 w-fit">
                  <span className="flex items-center gap-1"><span className="text-slate-400 font-normal">خط العرض:</span> {lat.toFixed(6)}</span>
                  <span className="flex items-center gap-1"><span className="text-slate-400 font-normal">خط الطول:</span> {lng.toFixed(6)}</span>
                </div>
              </div>

              {/* Save trigger */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-4">
                <div className="text-slate-500 text-xs font-medium flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>سيتم فحص الموقع وتحديثه حياً في الدليل الطبي للموقع.</span>
                </div>

                <button
                  onClick={handleSaveLocation}
                  disabled={saving || !coordinatesAreValid}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? "جاري التثبيت برمجياً..." : "💾 حفظ وتثبيت الموقع بالعيادة"}
                </button>
              </div>

              {/* Success Notification */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center flex flex-col items-center justify-center animate-bounce">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                  <strong className="text-emerald-800 text-base font-black">تهانينا د. {selectedDoctor.name}!</strong>
                  <p className="text-emerald-600 text-sm mt-1 font-bold">تم حفظ وتحديث إحداثيات موقع عيادتك في البوابة بنجاح. سيمكن الآن للمرضى الوصول إليك عبر تطبيقات الخرائط باللمسة الواحدة!</p>
                </div>
              )}
            </div>
          )}
          
          {!selectedDoctor && (
            <p className="p-8 text-center text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              📍 يرجى اختيار وتحديد اسم حسابك الطبي في الخطوة 1 أعلاه لتتمكن من اختيار موقع عيادتك الجغرافي.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

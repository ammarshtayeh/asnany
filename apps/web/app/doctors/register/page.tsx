"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin, CheckCircle, ArrowRight, ShieldCheck, Plus, Sparkles,
  Camera, Navigation, Save, X, Info
} from "lucide-react";
import AdminImageUpload from "@/components/AdminImageUpload";

const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false });

export default function DoctorRegister() {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("رام الله");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [clinicPhotos, setClinicPhotos] = useState<string[]>([""]);
  const [acceptsInsurance, setAcceptsInsurance] = useState(true);
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]);

  // Location state
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mapLat, setMapLat] = useState(31.898);
  const [mapLng, setMapLng] = useState(35.201);
  const [pendingLat, setPendingLat] = useState(31.898);
  const [pendingLng, setPendingLng] = useState(35.201);
  const [gpsSet, setGpsSet] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const insurancesList = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

  // When doctor clicks "تحديد موقع عيادتي" — get GPS first, then open map there
  const handleOpenMap = () => {
    setLocating(true);
    setFormError("");
    if (!navigator.geolocation) {
      setLocating(false);
      // Open map at default Palestine center
      setShowMap(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setMapLat(userLat);
        setMapLng(userLng);
        setPendingLat(userLat);
        setPendingLng(userLng);
        setLocating(false);
        setShowMap(true);
      },
      () => {
        // If permission denied, open map at default center
        setLocating(false);
        setShowMap(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Save the current map pin as clinic coordinates
  const handleSaveLocation = () => {
    setLat(pendingLat);
    setLng(pendingLng);
    setGpsSet(true);
    setShowMap(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !specialty || !city) {
      setFormError("يرجى ملء الحقول المطلوبة (الاسم الكامل، التخصص، المدينة)");
      return;
    }

    const uploadedPhotos = clinicPhotos.filter((p) => !!p.trim());
    if (uploadedPhotos.length === 0) {
      setFormError("يرجى رفع صورة واحدة على الأقل للعيادة — هذا الحقل إلزامي");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/doctors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          specialty,
          city,
          area,
          phone,
          whatsapp,
          bio,
          lat: gpsSet ? lat : null,
          lng: gpsSet ? lng : null,
          image_url: imageUrl,
          clinic_photos: uploadedPhotos,
          accepts_insurance: acceptsInsurance,
          insurance_list: selectedInsurances,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setFormError(data.error || "فشل إرسال طلب التسجيل.");
      }
    } catch (err) {
      console.error(err);
      setFormError("حدث خطأ غير متوقع. يرجى المحاولة مجدداً.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen relative font-sans" dir="rtl">
      {/* Premium Gradient Header */}
      <div className="h-[250px] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900 to-secondary/80" />
        <div className="absolute top-8 right-8 z-50">
          <Link
            href="/join"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Link>
        </div>

        <div className="relative z-10 px-4">
          <span className="bg-white/10 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> بوابة الانضمام إلى أسناني.ps
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            استمارة تسجيل العيادة
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            أرسل طلبك الآن وسيقوم مسؤول المنصة بمراجعته وتفعيل عيادتك في أقرب وقت.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100">

          {success ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">تم استلام طلب التسجيل بنجاح!</h2>
                <p className="text-slate-500 font-medium text-sm max-w-md mx-auto leading-relaxed">
                  شكراً د. <strong>{name}</strong> — تم حفظ بيانات عيادتك وإرسالها للإدارة. سيتم مراجعة الطلب وتفعيل حسابك على دليل أسناني.ps فور الموافقة.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-center gap-4">
                <Link
                  href="/"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl transition-all text-sm"
                >
                  الذهاب للرئيسية
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">

              {/* Section: Basic Info */}
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" /> تفاصيل الطبيب والعيادة
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">الاسم الكامل للطبيب *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: د. أحمد يوسف"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">التخصص الرئيسي *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="مثال: زراعة وتقويم الأسنان"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">المدينة *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right focus:border-primary/40"
                  >
                    <option value="رام الله">رام الله</option>
                    <option value="نابلس">نابلس</option>
                    <option value="الخليل">الخليل</option>
                    <option value="جنين">جنين</option>
                    <option value="بيت لحم">بيت لحم</option>
                    <option value="طولكرم">طولكرم</option>
                    <option value="قلقيلية">قلقيلية</option>
                    <option value="أريحا">أريحا</option>
                    <option value="غزة">غزة</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">العنوان بالتفصيل</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="مثال: شارع الإرسال - عمارة السلام"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم الهاتف (للاتصال)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 022987654"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left focus:border-primary/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم واتساب</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="مثال: +970599123456"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">نبذة شخصية وسيرة مهنية</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة عن خبراتك وأجهزة عيادتك ليعرفها المرضى..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right resize-none focus:border-primary/40"
                />
              </div>

              {/* Section: Doctor Photo */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <AdminImageUpload
                  label="صورة الطبيب الشخصية (اختياري)"
                  value={imageUrl}
                  folder="doctor-profiles"
                  onChange={setImageUrl}
                />
              </div>

              {/* Section: Clinic Photos — MANDATORY */}
              <div className="space-y-2 border-2 border-primary/20 p-4 rounded-2xl bg-primary/5">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-black text-slate-800 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    صور العيادة والأجهزة
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">إلزامي</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">{clinicPhotos.filter(p => !!p.trim()).length} / 5</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  يرجى رفع صورة واحدة على الأقل للعيادة أو الأجهزة لمراجعة الطلب. الحد الأقصى 5 صور.
                </p>

                {clinicPhotos.map((photo, index) => (
                  <div key={`clinic-photo-${index}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                    <AdminImageUpload
                      label={`صورة العيادة #${index + 1}`}
                      value={photo}
                      folder="clinic-photos"
                      onChange={(url) => {
                        const updated = [...clinicPhotos];
                        if (url) {
                          updated[index] = url;
                        } else {
                          updated.splice(index, 1);
                          if (updated.length === 0) updated.push("");
                        }
                        setClinicPhotos(updated);
                      }}
                    />
                  </div>
                ))}

                {clinicPhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setClinicPhotos([...clinicPhotos, ""])}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-white px-4 py-3 text-sm font-black text-primary hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-4 h-4" /> إضافة صورة عيادة أخرى
                  </button>
                )}
              </div>

              {/* Section: Insurance */}
              <div className="space-y-3 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="acceptsInsurance"
                    checked={acceptsInsurance}
                    onChange={(e) => setAcceptsInsurance(e.target.checked)}
                    className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="acceptsInsurance" className="text-sm font-bold text-slate-800 select-none">
                    أقبل شركات التأمين الطبي المعتمدة في فلسطين
                  </label>
                </div>

                {acceptsInsurance && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <label className="block text-xs font-black text-slate-500 mb-2">حدد شركات التأمين التي تتعامل معها عيادتك:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {insurancesList.map((ins) => {
                        const isChecked = selectedInsurances.includes(ins);
                        return (
                          <label
                            key={ins}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                              isChecked
                                ? "bg-sky-50/50 border-sky-200 text-sky-700"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedInsurances(selectedInsurances.filter((i) => i !== ins));
                                } else {
                                  setSelectedInsurances([...selectedInsurances, ins]);
                                }
                              }}
                              className="w-4 h-4 text-sky-500 border-slate-300 rounded focus:ring-sky-400"
                            />
                            {ins}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Location — OPTIONAL */}
              <div className="space-y-3 border border-slate-200 p-4 rounded-2xl bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> موقع العيادة الجغرافي
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">اختياري</span>
                  </h3>
                  {gpsSet && (
                    <button
                      type="button"
                      onClick={() => { setGpsSet(false); setLat(null); setLng(null); }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> إلغاء الموقع
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  يمكنك تحديد موقع عيادتك على الخريطة لمساعدة المرضى في إيجادك بسهولة. سنفتح الخريطة عند موقعك الحالي تلقائياً.
                </p>

                {gpsSet ? (
                  <div className="flex flex-wrap gap-3 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                    <span>✅ تم حفظ إحداثيات العيادة بنجاح!</span>
                    <span>خط العرض: {lat?.toFixed(6)}</span>
                    <span>خط الطول: {lng?.toFixed(6)}</span>
                  </div>
                ) : null}

                {!showMap ? (
                  <button
                    type="button"
                    disabled={locating}
                    onClick={handleOpenMap}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-bold px-4 py-3 text-sm transition-all disabled:opacity-60"
                  >
                    {locating ? (
                      <>
                        <Navigation className="w-4 h-4 animate-spin" />
                        جاري تحديد موقعك...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        {gpsSet ? "تعديل موقع العيادة على الخريطة" : "تحديد موقع عيادتي على الخريطة"}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <LocationPickerMap
                        lat={mapLat}
                        lng={mapLng}
                        onChange={(newLat, newLng) => {
                          setPendingLat(newLat);
                          setPendingLng(newLng);
                          setMapLat(newLat);
                          setMapLng(newLng);
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-medium text-center">
                      انقر على موقع عيادتك بدقة على الخريطة، ثم اضغط "حفظ إحداثيات عيادتي"
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveLocation}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-3 text-sm transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Save className="w-4 h-4" /> حفظ إحداثيات عيادتي
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 text-sm transition-all"
                      >
                        <X className="w-4 h-4" /> إغلاق
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-red-700">{formError}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black px-10 py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 text-sm flex justify-center items-center gap-2 hover:scale-[1.02]"
                >
                  {saving ? "جاري إرسال البيانات..." : "💾 إرسال طلب تسجيل العيادة"}
                </button>
              </div>

              <div className="text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>سيتم مراجعة بيانات عيادتك من قبل الإدارة قبل ظهورها للعموم.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

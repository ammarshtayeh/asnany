"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, CheckCircle, ArrowRight, ShieldCheck, Plus, Sparkles, XCircle } from "lucide-react";

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

  // Location Coordinates (Default center of Palestine/Ramallah)
  const [lat, setLat] = useState(31.898);
  const [lng, setLng] = useState(35.201);
  const [gpsSet, setGpsSet] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const insurancesList = ["التكافل", "ترست", "المشرق", "تمكين", "المجموعة الأهلية"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty || !city) {
      alert("يرجى ملء الحقول المطلوبة (الاسم الكامل، التخصص، المدينة)");
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
          clinic_photos: clinicPhotos.filter(url => !!url.trim()),
          accepts_insurance: acceptsInsurance,
          insurance_list: selectedInsurances,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "فشل إرسال طلب التسجيل.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ غير متوقع.");
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
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="relative z-10 px-4">
          <span className="bg-white/10 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> بوابة الانضمام إلى أسناني.ps
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
             استمارة تسجيل العيادة للأطباء الجدد
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            املأ بيانات عيادتك وحدد موقع الـ GPS الخاص بك لتسجيل عيادتك فوراً بانتظار تفعيل وموافقة الإدارة.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100">
          
          {success ? (
            <div className="text-center py-10 space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">تم استلام طلب تسجيل العيادة بنجاح!</h2>
                <p className="text-slate-500 font-medium text-sm max-w-md mx-auto leading-relaxed">
                  شكراً لك د. <strong>{name}</strong> لتسجيل عيادتك في بوابة <strong>أسناني.ps</strong>. 
                  لقد تم حفظ تفاصيل عيادتك وموقع الـ GPS الخاص بك. سيقوم مسؤول البوابة بمراجعة الطلب وتوثيق حسابك لتظهر للجمهور في الدليل العام فوراً!
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">المدينة *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم واتساب المبيعات/الحجز</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="مثال: +970599123456"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">رابط صورتك الشخصية (اختياري)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/doctor-profile.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left font-mono"
                />
              </div>

              <div className="space-y-2 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-black text-slate-800">صور العيادة والأجهزة (رابط URL - الحد الأقصى 5 صور)</label>
                  <span className="text-[10px] text-slate-400 font-bold">{clinicPhotos.length} / 5</span>
                </div>
                {clinicPhotos.map((photo, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={photo}
                      onChange={(e) => {
                        const newPhotos = [...clinicPhotos];
                        newPhotos[index] = e.target.value;
                        setClinicPhotos(newPhotos);
                      }}
                      placeholder={`رابط صورة العيادة #${index + 1} (https://...)`}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:bg-white outline-none text-xs transition-all text-left font-mono"
                    />
                    {clinicPhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setClinicPhotos(clinicPhotos.filter((_, idx) => idx !== index))}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-100 transition-colors"
                        title="حذف هذه الصورة"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {clinicPhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setClinicPhotos([...clinicPhotos, ""])}
                    className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 mt-1.5"
                  >
                    + إضافة صورة عيادة أخرى
                  </button>
                )}
              </div>

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
                    <label className="block text-xs font-black text-slate-500 mb-2">حدد شركات التأمين التي تتعاقد معها عيادتك:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {insurancesList.map((ins) => {
                        const isChecked = selectedInsurances.includes(ins);
                        return (
                          <label key={ins} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            isChecked 
                            ? "bg-sky-50/50 border-sky-200 text-sky-700" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedInsurances(selectedInsurances.filter(i => i !== ins));
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

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">نبذة شخصية وسيرة مهنية</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة عن خبرات الطبيب وأحدث الأجهزة المعتمدة في عيادته ليعرفها المرضى..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right resize-none"
                />
              </div>

              {/* Map coordinate picking */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> حدد موقع العيادة الجغرافي (GPS):
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  انقر على موقع عيادتك بدقة على الخريطة أو استخدم تحديد الموقع التلقائي (GPS) لتثبيت مكانك وتسهيل إرشاد المريض إليك.
                </p>

                <LocationPickerMap
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                    setGpsSet(true);
                  }}
                />

                {gpsSet && (
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 w-fit">
                    <span>📍 تم تحديد الإحداثيات الجغرافية بنجاح!</span>
                    <span>خط العرض: {lat.toFixed(6)}</span>
                    <span>خط الطول: {lng.toFixed(6)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black px-10 py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 text-sm flex justify-center items-center gap-2 hover:scale-[1.02]"
                >
                  {saving ? "جاري إرسال البيانات..." : "💾 إرسال طلب تسجيل العيادة وتثبيته"}
                </button>
              </div>

              <div className="text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>سيتم مراجعة بيانات عيادتك وإحداثياتها من قبل الإدارة فوراً.</span>
              </div>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}

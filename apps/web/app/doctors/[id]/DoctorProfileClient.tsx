"use client";

import { useState, useEffect, type HTMLAttributes } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Doctor } from "@/lib/types";
import { getDistance } from "@/lib/distance";
import { doctorMapCoordinates, openDoctorInExternalMaps } from "@/lib/map-links";
import { startAccuratePositionWatch, type UserMapLocation } from "@/lib/geolocation";
import { Star, MapPin, CheckCircle2, Clock, Calendar, Navigation, Route, Award, HeartPulse, Sparkles, Map, Heart, ArrowRight } from "lucide-react";
import { buildWhatsAppBookingMessage, hebronToday, ageFromBirthDate, isIdentityRequiredForAge, whatsappHref } from "@/lib/booking";
import { trackWhatsAppLead } from "@/lib/whatsapp-lead";

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), { ssr: false });

export default function DoctorProfileClient({ doctor, canBookOnWebsite }: { doctor: Doctor; canBookOnWebsite: boolean }) {
  const [userLoc, setUserLoc] = useState<UserMapLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingIdentity, setBookingIdentity] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingBirthDate, setBookingBirthDate] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingPeriod, setBookingPeriod] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [submittedRef, setSubmittedRef] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const [reviewsList, setReviewsList] = useState<Array<{ name: string; rating: number; date: string; text: string }>>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("malamih_saved_doctors") || "[]") as string[];
    setIsSaved(saved.includes(doctor.id));

    const stopWatch = startAccuratePositionWatch((location) => {
      setUserLoc(location);
      const doctorCoords = doctorMapCoordinates(doctor);
      setDistance(getDistance(location.lat, location.lng, doctorCoords.latitude, doctorCoords.longitude));
    });

    void fetch(`/api/reviews?doctorId=${doctor.id}`)
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data?.reviews) ? data.reviews : [];
        setReviewsList(
          rows.map((row: { patient_name: string; rating: number; comment?: string; created_at: string }) => ({
            name: row.patient_name,
            rating: row.rating,
            date: new Date(row.created_at).toLocaleDateString("ar-EG"),
            text: row.comment || "",
          })),
        );
      })
      .catch(() => undefined);

    return () => stopWatch();
  }, [doctor]);

  const doctorMapHref = `/doctors/${doctor.id}/map`;

  const toggleSaved = () => {
    const saved = JSON.parse(localStorage.getItem("malamih_saved_doctors") || "[]") as string[];
    const next = saved.includes(doctor.id) ? saved.filter((id) => id !== doctor.id) : [...saved, doctor.id];
    localStorage.setItem("malamih_saved_doctors", JSON.stringify(next));
    setIsSaved(next.includes(doctor.id));
  };

  const readyWhatsAppHref = whatsappHref(
    doctor.whatsapp,
    buildWhatsAppBookingMessage({
      doctorName: doctor.name,
      patientName: bookingName || undefined,
      phone: bookingPhone || undefined,
      date: bookingDate || undefined,
      time: bookingPeriod || undefined,
      notes: bookingNotes || undefined,
    })
  );

  const handleSmartBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBookOnWebsite) {
      alert("الحجز عبر الموقع متاح فقط للأطباء الذين لديهم حساب مفعّل على المنصة.");
      return;
    }
    if (!bookingName || !bookingPhone || !bookingAddress || !bookingBirthDate || !bookingDate || !bookingPeriod) {
      alert("يرجى تعبئة الاسم والهاتف والعنوان وتاريخ الميلاد والتاريخ والوقت");
      return;
    }

    const age = ageFromBirthDate(bookingBirthDate);
    if (age === null) {
      alert("تاريخ الميلاد غير صالح");
      return;
    }
    if (isIdentityRequiredForAge(age) && !bookingIdentity.trim()) {
      alert("رقم الهوية إلزامي لمن عمرهم 17 سنة فأكثر");
      return;
    }
    if (bookingIdentity.trim() && !/^\d{9}$/.test(bookingIdentity.trim())) {
      alert("رقم الهوية يجب أن يكون 9 أرقام");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bookingEmail.trim() && !emailRegex.test(bookingEmail)) {
      alert("يرجى إدخال بريد إلكتروني صحيح أو تركه فارغاً");
      return;
    }

    setIsSubmitting(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_full_name: bookingName,
        patient_email: bookingEmail.trim() || null,
        patient_phone: bookingPhone,
        patient_identity: bookingIdentity.trim() || null,
        patient_address: bookingAddress.trim(),
        patient_birth_date: bookingBirthDate,
        date: bookingDate,
        time: bookingPeriod,
        notes: bookingNotes,
        website: "",
      }),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (!res.ok) {
      alert(data.error || "تعذر إرسال الحجز");
      return;
    }
    setSubmittedPhone(bookingPhone);
    setSubmittedRef(String(data.booking_ref || data.appointment?.booking_ref || ""));
    setShowSuccessModal(true);
    setBookingName("");
    setBookingEmail("");
    setBookingPhone("");
    setBookingIdentity("");
    setBookingAddress("");
    setBookingBirthDate("");
    setBookingDate("");
    setBookingPeriod("");
    setBookingNotes("");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim()) {
      alert("يرجى إدخال اسمك");
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_name: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      }),
    });
    const data = await res.json();
    setReviewSubmitting(false);
    if (!res.ok) {
      alert(data.error || "تعذر إرسال التقييم");
      return;
    }
    setReviewMessage(data.message || "شكراً! سيُراجع تقييمك قبل النشر.");
    setReviewName("");
    setReviewComment("");
    setReviewRating(5);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-32 pb-32 lg:pb-24 z-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Info Column */}
        <div className="flex-1 space-y-8">
          
          {/* Main Card */}
          <div className="bento-card shine-border backdrop-blur-xl p-6 md:p-10">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              
              {/* Doctor Avatar */}
              <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-[2rem] p-2 bg-gradient-to-br from-slate-900 via-slate-700 to-amber-500 shadow-xl shadow-slate-950/20 group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-[1.6rem] overflow-hidden relative">
                  {doctor.image_url ? (
                    <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40 bg-slate-50">
                      <HeartPulse className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 w-full pt-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{doctor.name}</h1>
                      {doctor.verified && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                          title="راجعت الإدارة بيانات العيادة الأساسية قبل الظهور في الدليل"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          موثّق
                        </span>
                      )}
                      {doctor.accepts_discount_card ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          بطاقة الخصم
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(Array.isArray(doctor.specialty) ? doctor.specialty : (doctor.specialty ? [doctor.specialty] : [])).map((spec, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200/60 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={toggleSaved}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                          isSaved ? "bg-rose-50 text-rose-700" : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                        {isSaved ? "محفوظ في قائمتي" : "احفظ الطبيب"}
                      </button>
                      {doctor.is_available !== false ? (
                        <span className="inline-flex min-h-11 items-center rounded-xl bg-emerald-50 px-4 text-sm font-black text-emerald-700">
                          موجود في العيادة الآن
                        </span>
                      ) : (
                        <span className="inline-flex min-h-11 items-center rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-500">
                          غير متاح حالياً
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {doctor.rating > 0 && (
                    <div className="flex flex-col items-center bg-gradient-to-b from-yellow-50 to-amber-50/20 text-yellow-700 px-6 py-3 rounded-2xl border border-yellow-200/50 shadow-sm shadow-yellow-100">
                      <div className="flex items-center gap-1.5 font-black text-2xl">
                        <Star className="w-6 h-6 fill-current" />
                        {doctor.rating}
                      </div>
                      <span className="text-xs font-bold opacity-80 mt-1 uppercase tracking-wider">تقييم عام</span>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-slate-600 text-sm font-medium mt-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-slate-900 mb-0.5">{doctor.city}</strong>
                      <span className="text-slate-500 leading-relaxed block">{doctor.area}</span>
                      <Link
                        href={doctorMapHref}
                        className="mt-2 text-primary hover:text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        الخريطة داخل الموقع
                      </Link>
                      <button
                        type="button"
                        onClick={() => openDoctorInExternalMaps(doctor)}
                        className="mt-2 ml-2 text-slate-700 hover:text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        افتح في خرائط الجهاز
                      </button>
                    </div>
                  </div>
                  {doctor.accepts_insurance && (
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-secondary">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-slate-900 mb-1.5">التأمين الطبي المقبول</strong>
                        {(doctor.insurance_list || doctor.insuranceList) && (doctor.insurance_list || doctor.insuranceList || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(doctor.insurance_list || doctor.insuranceList || []).map((ins: string, i: number) => (
                              <span key={i} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-lg border border-amber-100 font-bold">
                                {ins}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">يقبل شركات التأمين المعتمدة</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About & Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bento-card shine-border p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-16 -translate-y-16" />
              <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" /> نبذة عن الطبيب
              </h2>
              <p className="text-slate-600 leading-loose text-[15px] relative z-10">{doctor.bio || "لا تتوفر نبذة شخصية حالياً."}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl shadow-slate-900/20 p-8 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Map className="w-48 h-48 translate-x-12 translate-y-12" />
              </div>
              <h2 className="text-lg font-bold text-slate-300 mb-2">المسافة إليك</h2>
              <div className="flex items-end gap-2 mb-4">
                {distance !== null ? (
                  <>
                    <span className="text-5xl font-black">{distance.toFixed(1)}</span>
                    <span className="text-xl text-primary font-bold mb-1">كم</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-slate-400">جاري التحديد...</span>
                )}
              </div>
              {distance !== null && (
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold bg-emerald-400/10 w-fit px-3 py-1.5 rounded-lg border border-emerald-400/20">
                  <Route className="w-4 h-4" />
                  <span>طريق متاح على الخريطة</span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Map Section */}
          <div className="bento-card shine-border p-3 relative h-[450px] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <DoctorMap doctors={[doctor]} userLocation={userLoc || undefined} />
            <div className="absolute bottom-6 right-6 z-30 flex gap-2">
              <Link
                href={doctorMapHref}
                className="bg-slate-900 hover:bg-primary text-white hover:scale-105 transition-all px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 cursor-pointer border-0"
              >
                <Navigation className="w-4 h-4 text-white animate-pulse" />
                الخريطة داخل الموقع
              </Link>
              <button
                type="button"
                onClick={() => openDoctorInExternalMaps(doctor)}
                className="bg-white/95 hover:bg-white text-slate-900 hover:scale-105 transition-all px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 cursor-pointer border-0"
              >
                <MapPin className="w-4 h-4" />
                خرائط الجهاز
              </button>
            </div>
          </div>

          {/* Clinic Photos Gallery */}
          {(doctor.clinic_photos || doctor.clinicPhotos) && (doctor.clinic_photos || doctor.clinicPhotos || []).length > 0 && (
            <div className="bento-card p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" /> جولة في العيادة
              </h2>
              
              <div className="flex flex-col gap-4">
                {/* Main Photo View */}
                <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden bg-slate-100">
                  <Image 
                    src={(doctor.clinic_photos || doctor.clinicPhotos || [])[activePhoto] || ""} 
                    alt="صورة العيادة" 
                    fill 
                    className="object-cover transition-all duration-700" 
                  />
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {(doctor.clinic_photos || doctor.clinicPhotos || []).map((photo: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setActivePhoto(idx)}
                      className={`relative w-24 h-20 md:w-32 md:h-24 rounded-xl overflow-hidden snap-center flex-shrink-0 border-2 transition-all ${activePhoto === idx ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <Image src={photo} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews — coming soon */}
          <div className="bento-card p-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-5">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" /> التقييمات والمراجعات
              </h2>
            </div>
            {reviewsList.length > 0 ? (
              <div className="space-y-6">
                {reviewsList.map((rev, index) => (
                  <div key={index} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/60">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{rev.name}</h4>
                        <span className="text-xs text-slate-400 font-bold">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rev.rating ? "fill-current" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{rev.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500 leading-7 mb-6">
                لا توجد تقييمات منشورة بعد. كن أول من يشارك تجربته بعد زيارة العيادة.
              </p>
            )}
            <form onSubmit={handleReviewSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              <p className="text-sm font-black text-slate-800">أضف تقييمك</p>
              <input
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="اسمك (يظهر للعامة بعد الموافقة)"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500">التقييم:</span>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewRating(value)}
                    className={`rounded-lg px-2 py-1 text-sm font-black ${reviewRating >= value ? "text-amber-500" : "text-slate-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="شاركنا تجربتك باختصار..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
              />
              {reviewMessage ? <p className="text-xs font-bold text-emerald-600">{reviewMessage}</p> : null}
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {reviewSubmitting ? "جاري الإرسال..." : "إرسال التقييم للمراجعة"}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Sticky */}
        <div className="w-full lg:w-[380px] space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bento-card shine-border p-6 sticky top-6">
            <h3 className="font-black text-slate-900 text-lg mb-6">تواصل وحجز مباشر</h3>
            
            {canBookOnWebsite ? (
              <a href="#booking" className="btn-malama mb-3 w-full py-4 text-sm">
                <Calendar className="h-5 w-5" />
                احجز موعد عبر الموقع
              </a>
            ) : null}
            {doctor.whatsapp ? (
              <a href={`https://wa.me/${doctor.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 py-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100">
                واتساب مباشر
              </a>
            ) : null}
            
            <div className="flex gap-3">
              <Link href={doctorMapHref} className="btn-malama-outline flex-1 py-3.5 text-sm">
                <MapPin className="w-5 h-5" />
                الخريطة
              </Link>
            </div>

            <div className="my-6 border-t border-slate-100" />

            {/* Working Hours */}
            {(doctor.working_hours || doctor.workingHours) && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" /> الدوام الرسمي
                </h3>
                <div className="space-y-3 px-1">
                  {(Object.entries(doctor.working_hours || doctor.workingHours || {}) as [string, string][]).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-600">{day}</span>
                      <span className={hours === "مغلق" || hours.includes("Closed") ? "text-red-500 bg-red-50 px-2 py-0.5 rounded" : "text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"}>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      <div className="section-shell mt-8 bento-card shine-border p-6 scroll-mt-28" id="booking">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-black text-primary">حجز موعد</span>
            <h2 className="mt-1 text-3xl font-black text-slate-950">أرسل طلب حجز للطبيب</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {canBookOnWebsite
                ? "طلب موعد للمراجعة. العنوان إلزامي. رقم الهوية إلزامي لمن عمرهم 17 سنة فأكثر."
                : "الحجز عبر الموقع غير مفعّل لهذا الطبيب حالياً. استخدم واتساب برسالة جاهزة لحين تفعيل الحساب."}
            </p>
          </div>
          <Calendar className="h-10 w-10 text-primary" />
        </div>

        {canBookOnWebsite ? (
          <form onSubmit={handleSmartBookingSubmit} className="grid gap-3 md:grid-cols-2">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <BookingInput label="الاسم الرباعي" value={bookingName} onChange={setBookingName} required />
          <BookingInput label="البريد الإلكتروني - اختياري" value={bookingEmail} onChange={setBookingEmail} type="email" />
          <BookingInput label="رقم الهاتف" value={bookingPhone} onChange={setBookingPhone} required inputMode="tel" />
          <BookingInput
            label="تاريخ الميلاد"
            value={bookingBirthDate}
            onChange={setBookingBirthDate}
            required
            type="date"
            max={hebronToday()}
          />
          <BookingInput
            label={
              bookingBirthDate && isIdentityRequiredForAge(ageFromBirthDate(bookingBirthDate))
                ? "رقم الهوية (إلزامي — 17 سنة فأكثر)"
                : "رقم الهوية (إلزامي لمن عمرهم 17 فأكثر)"
            }
            value={bookingIdentity}
            onChange={setBookingIdentity}
            required={Boolean(bookingBirthDate && isIdentityRequiredForAge(ageFromBirthDate(bookingBirthDate)))}
            inputMode="numeric"
          />
          <BookingInput label="عنوان السكن" value={bookingAddress} onChange={setBookingAddress} required />
          <BookingInput label="تاريخ الموعد" value={bookingDate} onChange={setBookingDate} required type="date" min={hebronToday()} />
          <BookingInput label="الوقت المفضل" value={bookingPeriod} onChange={setBookingPeriod} required type="time" />
          <label className="md:col-span-2">
              <span className="mb-1 block text-xs font-black text-slate-500">ملاحظات للحالة</span>
              <textarea
                value={bookingNotes}
                onChange={(event) => setBookingNotes(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-primary/40"
                placeholder="مثال: ألم شديد، حشوة، مراجعة تقويم..."
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-2 min-h-14 rounded-2xl bg-primary px-6 text-sm font-black text-white shadow-[0_12px_28px_-10px_rgba(12,94,71,0.45)] hover:bg-primary/90 disabled:opacity-60"
            >
            {isSubmitting ? "جاري إرسال الحجز..." : "إرسال طلب الحجز"}
          </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-right text-sm font-bold text-amber-800">
            <p className="mb-3">الطبيب ظاهر في الدليل، لكن الحجز عبر الموقع يحتاج حساب مفعّل. تواصل مباشرة عبر واتساب:</p>
            {readyWhatsAppHref ? (
              <a
                href={readyWhatsAppHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsAppLead({ doctorId: doctor.id, doctorName: doctor.name, source: "profile_disabled_booking" })}
                className="inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700"
              >
                واتساب برسالة جاهزة
              </a>
            ) : (
              <span>لا يوجد رقم واتساب مسجّل لهذه العيادة.</span>
            )}
          </div>
        )}
      </div>

      {/* Sticky booking CTA — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-16px_rgba(10,22,40,0.25)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <a
            href="#booking"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-black text-white"
          >
            <Calendar className="h-4 w-4" />
            {canBookOnWebsite ? "احجز الآن" : "طلب موعد"}
          </a>
            {readyWhatsAppHref ? (
              <a
                href={readyWhatsAppHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsAppLead({ doctorId: doctor.id, doctorName: doctor.name, source: "profile_sticky" })}
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-black text-emerald-700"
              >
                واتساب
              </a>
            ) : null}
        </div>
      </div>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h3 className="text-2xl font-black text-slate-950">تم إرسال طلب الحجز</h3>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
              احفظ رمز الحجز لمتابعة حالتك. سيظهر الطلب للطبيب لتأكيده.
            </p>
            {submittedRef ? (
              <p className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 font-black tracking-wider text-amber-300">
                {submittedRef}
              </p>
            ) : null}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href={`/appointments?phone=${encodeURIComponent(submittedPhone)}&ref=${encodeURIComponent(submittedRef)}`}
                className="btn-malama min-h-12 px-6 py-3 text-sm"
              >
                حجوزاتي
              </Link>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="btn-malama-outline min-h-12 px-6 text-sm"
              >
                تمام
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modern Contact Banner replacing booking form */}
      <div className="section-shell mt-8 bento-card shine-border p-8 md:p-12 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm inline-block mb-4">قنوات التواصل المباشرة</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">احجز موعدك مباشرة مع {doctor.name}</h2>
          <p className="text-slate-500 text-lg mb-8">تم تفعيل قنوات التواصل والاتصال المباشر لتسريع عملية الحجز وتأكيد المواعيد فورياً.</p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {canBookOnWebsite ? (
              <a href="#booking" className="btn-malama w-full sm:w-auto px-8 py-4 text-sm">
                <Calendar className="w-5 h-5" />
                نموذج الحجز داخل الموقع
              </a>
            ) : null}
            {doctor.whatsapp && (
              <a 
                href={`https://wa.me/${doctor.whatsapp.replace(/\+/g, "")}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
              >
                محادثة واتساب
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Back Button */}
      <div className="mt-12 flex justify-center pb-12">
        <Link
          href="/"
          className="btn-malama-outline inline-flex px-8 py-4 text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

function BookingInput({
  label,
  value,
  onChange,
  required,
  type = "text",
  inputMode,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: string;
  max?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        min={min}
        max={max}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-amber-300"
      />
    </label>
  );
}

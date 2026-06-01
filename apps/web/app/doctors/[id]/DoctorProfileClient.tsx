"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Doctor } from "@/lib/types";
import { getDistance } from "@/lib/distance";
import { buildAppleMapsUrl, buildDoctorMapUrl } from "@/lib/map-links";
import { Star, MapPin, CheckCircle2, Clock, Calendar, Navigation, Route, Award, HeartPulse, Sparkles, Map, Heart } from "lucide-react";

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), { ssr: false });

export default function DoctorProfileClient({ doctor }: { doctor: Doctor }) {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingIdentity, setBookingIdentity] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingPeriod, setBookingPeriod] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Reviews States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewsList, setReviewsList] = useState([
    { name: "سامر أبو فؤاد", rating: 5, date: "12 مايو 2026", text: "دكتور ممتاز ومحترف جداً، العيادة مجهزة بأحدث التقنيات والمعاملة رائعة." },
    { name: "نهى المصري", rating: 4, date: "3 مايو 2026", text: "الخدمة ممتازة ودقة في المواعيد، أنصح به بشدة لعلاج عصب الأسنان." }
  ]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText) {
      alert("يرجى كتابة الاسم والتعليق");
      return;
    }
    const newReview = {
      name: reviewName,
      rating: reviewRating,
      date: "اليوم",
      text: reviewText
    };
    setReviewsList([newReview, ...reviewsList]);
    setReviewName("");
    setReviewText("");
    setReviewRating(5);
    alert("شكراً لك! تم إضافة تقييمك بنجاح.");
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("asnany_saved_doctors") || "[]") as string[];
    setIsSaved(saved.includes(doctor.id));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLoc({ lat, lng });
          if (doctor.lat && doctor.lng) {
            setDistance(getDistance(lat, lng, doctor.lat, doctor.lng));
          }
        },
        () => {
          console.log("Geolocation permission denied or failed.");
        }
      );
    }
  }, [doctor]);

  const doctorMapHref = `/doctors/${doctor.id}/map`;
  const openDeviceMap = () => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent;
    const isApple = /iPad|iPhone|iPod|Macintosh/i.test(ua);
    window.open(isApple ? buildAppleMapsUrl(doctor) : buildDoctorMapUrl(doctor), "_blank", "noopener,noreferrer");
  };

  const toggleSaved = () => {
    const saved = JSON.parse(localStorage.getItem("asnany_saved_doctors") || "[]") as string[];
    const next = saved.includes(doctor.id) ? saved.filter((id) => id !== doctor.id) : [...saved, doctor.id];
    localStorage.setItem("asnany_saved_doctors", JSON.stringify(next));
    setIsSaved(next.includes(doctor.id));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingDate || !bookingPeriod) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call & WhatsApp Bot hook
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleSmartBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingIdentity || !bookingAddress || !bookingDate) {
      alert("يرجى تعبئة الاسم الرباعي، الهاتف، الهوية، العنوان، والتاريخ");
      return;
    }

    setIsSubmitting(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: doctor.id,
        patient_full_name: bookingName,
        patient_phone: bookingPhone,
        patient_identity: bookingIdentity,
        patient_address: bookingAddress,
        date: bookingDate,
        time: bookingPeriod,
        notes: bookingNotes,
      }),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (!res.ok) {
      alert(data.error || "تعذر إرسال الحجز");
      return;
    }
    setShowSuccessModal(true);
    setBookingName("");
    setBookingPhone("");
    setBookingIdentity("");
    setBookingAddress("");
    setBookingDate("");
    setBookingPeriod("");
    setBookingNotes("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-32 pb-24 z-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Info Column */}
        <div className="flex-1 space-y-8">
          
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-6 md:p-10">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              
              {/* Doctor Avatar */}
              <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-[2rem] p-2 bg-gradient-to-br from-primary via-blue-400 to-secondary shadow-xl shadow-primary/20 flex-shrink-0 group">
                <div className="w-full h-full bg-white rounded-[1.6rem] overflow-hidden relative">
                  {doctor.image_url ? (
                    <Image src={doctor.image_url} alt={doctor.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40 bg-slate-50">
                      <HeartPulse className="w-16 h-16" />
                    </div>
                  )}
                </div>
                {doctor.is_featured && (
                  <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 w-full pt-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{doctor.name}</h1>
                      {doctor.verified && (
                        <div className="bg-emerald-50 text-emerald-500 p-1 rounded-full" title="موثق">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                      {doctor.accepts_discount_card ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          بطاقة الخصم
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {doctor.specialty.map((spec, idx) => (
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
                        onClick={openDeviceMap}
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
                        {doctor.insurance_list && doctor.insurance_list.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {doctor.insurance_list.map((ins, i) => (
                              <span key={i} className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-lg border border-sky-100 font-bold">
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
            <div className="md:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-100 p-8 relative overflow-hidden">
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
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-100 p-3 relative h-[450px] overflow-hidden group">
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
                onClick={openDeviceMap}
                className="bg-white/95 hover:bg-white text-slate-900 hover:scale-105 transition-all px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 cursor-pointer border-0"
              >
                <MapPin className="w-4 h-4" />
                خرائط الجهاز
              </button>
            </div>
          </div>

          {/* Clinic Photos Gallery */}
          {doctor.clinic_photos && doctor.clinic_photos.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-100 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" /> جولة في العيادة
              </h2>
              
              <div className="flex flex-col gap-4">
                {/* Main Photo View */}
                <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden bg-slate-100">
                  <Image 
                    src={doctor.clinic_photos[activePhoto]} 
                    alt="صورة العيادة" 
                    fill 
                    className="object-cover transition-all duration-700" 
                  />
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                  {doctor.clinic_photos.map((photo, idx) => (
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

          {/* Reviews & Testimonials Section */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-100 p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-5">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-current" /> التقييمات والمراجعات
              </h2>
              <span className="text-sm font-bold text-slate-500">({reviewsList.length} تقييم)</span>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-6">
              {reviewsList.map((rev, index) => (
                <div key={index} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/60 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{rev.name}</h4>
                      <span className="text-xs text-slate-400 font-bold">{rev.date}</span>
                    </div>
                    {/* Stars */}
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

            {/* Write a Review Form */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-lg font-black text-slate-950 mb-4">أضف تجربتك مع الطبيب</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold text-slate-600">تقييمك بالنجوم:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-yellow-500 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-current" : "text-slate-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="اسمك الكامل"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                  />
                  <span className="text-xs font-medium text-slate-400 flex items-center">سيتم نشر التقييم فوراً بعد التحقق من الزيارة.</span>
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="اكتب تفاصيل تجربتك هنا بكل أمانة..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all resize-none"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-900/10 hover:shadow-primary/20"
                >
                  نشر التقييم الآن
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Sticky */}
        <div className="w-full lg:w-[380px] space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-6 sticky top-6">
            <h3 className="font-black text-slate-900 text-lg mb-6">تواصل وحجز مباشر</h3>
            
            {doctor.whatsapp ? (
              <a href={`https://wa.me/${doctor.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="w-full mb-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-3 hover:scale-[1.02]">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
                تواصل للحجز المباشر
              </a>
            ) : null}
            
            <div className="flex gap-3">
              {doctor.whatsapp && (
                <a href={`https://wa.me/${doctor.whatsapp.replace(/\+/g, "")}`} target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white font-bold py-3.5 rounded-2xl transition-all flex justify-center items-center gap-2 border border-[#25D366]/20">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
                  واتساب
                </a>
              )}
              
              <Link href={doctorMapHref} className="flex-1 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white font-bold py-3.5 rounded-2xl transition-all flex justify-center items-center gap-2 border border-slate-200">
                <MapPin className="w-5 h-5" />
                الخريطة
              </Link>
            </div>

            <div className="my-6 border-t border-slate-100" />

            {/* Working Hours */}
            {doctor.working_hours && (
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" /> الدوام الرسمي
                </h3>
                <div className="space-y-3 px-1">
                  {Object.entries(doctor.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-600">{day}</span>
                      <span className={hours === "مغلق" ? "text-red-500 bg-red-50 px-2 py-0.5 rounded" : "text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"}>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40" id="booking">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-sm font-black text-sky-600">حجز موعد</span>
            <h2 className="mt-1 text-3xl font-black text-slate-950">أرسل طلب حجز للطبيب</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">
              سيتم عرض بياناتك للطبيب داخل لوحة الطبيب لتأكيد الموعد أو تعديله.
            </p>
          </div>
          <Calendar className="h-10 w-10 text-sky-500" />
        </div>

        <form onSubmit={handleSmartBookingSubmit} className="grid gap-3 md:grid-cols-2">
          <BookingInput label="الاسم الرباعي" value={bookingName} onChange={setBookingName} required />
          <BookingInput label="رقم الهاتف" value={bookingPhone} onChange={setBookingPhone} required inputMode="tel" />
          <BookingInput label="رقم الهوية" value={bookingIdentity} onChange={setBookingIdentity} required />
          <BookingInput label="عنوان السكن" value={bookingAddress} onChange={setBookingAddress} required />
          <BookingInput label="تاريخ الموعد" value={bookingDate} onChange={setBookingDate} required type="date" />
          <BookingInput label="الوقت المفضل" value={bookingPeriod} onChange={setBookingPeriod} type="time" />
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-black text-slate-500">ملاحظات للحالة</span>
            <textarea
              value={bookingNotes}
              onChange={(event) => setBookingNotes(event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none focus:border-sky-300"
              placeholder="مثال: ألم شديد، حشوة، مراجعة تقويم..."
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 min-h-14 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white hover:bg-sky-600 disabled:opacity-60"
          >
            {isSubmitting ? "جاري إرسال الحجز..." : "إرسال طلب الحجز"}
          </button>
        </form>
      </div>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h3 className="text-2xl font-black text-slate-950">تم إرسال الحجز</h3>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
              سيظهر الطلب للطبيب داخل لوحة العيادة، وسيتم التواصل معك لتأكيد الموعد.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-5 min-h-12 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white"
            >
              تمام
            </button>
          </div>
        </div>
      ) : null}

      {/* Modern Contact Banner replacing booking form */}
      <div className="mt-12 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm inline-block mb-4">قنوات التواصل المباشرة</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">احجز موعدك مباشرة مع {doctor.name}</h2>
          <p className="text-slate-500 text-lg mb-8">تم تفعيل قنوات التواصل والاتصال المباشر لتسريع عملية الحجز وتأكيد المواعيد فورياً.</p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {doctor.whatsapp && (
              <a 
                href={`https://wa.me/${doctor.whatsapp.replace(/\+/g, "")}`} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba56] text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/30 hover:scale-105"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
                محادثة واتساب الفورية
              </a>
            )}
            <a
              href="#booking"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-105"
            >
              <Calendar className="w-6 h-6" />
              نموذج الحجز داخل الموقع
            </a>
          </div>
        </div>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-sky-300"
      />
    </label>
  );
}

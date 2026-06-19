"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Navigation, Route, ArrowRight } from "lucide-react";

import { Doctor } from "@/lib/types";
import { doctorMapLabel, doctorMapCoordinates, openDoctorInExternalMaps } from "@/lib/map-links";
import { getDistance } from "@/lib/distance";

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), { ssr: false });

export default function DoctorMapPage() {
  const params = useParams<{ id: string }>() as { id?: string } | null;
  const doctorId = params?.id || "";
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (cancelled) return;
      const doctors = Array.isArray(data) ? data : Array.isArray(data?.doctors) ? data.doctors : [];
      setDoctor(doctors.find((item: Doctor) => item.id === doctorId) || null);
    })();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const distance = (() => {
    if (!doctor || !userLoc) return null;
    const coords = doctorMapCoordinates(doctor);
    if (!coords || !coords.latitude || !coords.longitude) return null;
    return getDistance(userLoc.lat, userLoc.lng, coords.latitude, coords.longitude);
  })();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-sky-600">خريطة العيادة</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            {doctor?.name || "جاري التحميل..."}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {doctor ? doctorMapLabel(doctor) : "غير محدد"}
          </p>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-[1.6rem] border border-sky-100 bg-sky-50 p-4">
            
            {/* Live Location Alert Status */}
            {userLoc ? (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 animate-fade-in">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-sm font-black">موقعك الحالي نشط وموثق</p>
                  {distance !== null ? (
                    <p className="text-xs font-bold mt-0.5 text-emerald-700">
                      تبعد العيادة عنك مسافة <strong className="text-emerald-950 font-black">{distance.toFixed(1)} كم</strong>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : locating ? (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-800">
                <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-sm font-black">جاري الاتصال بالأقمار الاصطناعية لتحديد موقعك ورسم الاتجاهات...</p>
              </div>
            ) : null}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">الموقع على الخريطة</p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {doctor ? doctorMapLabel(doctor) : "جاري التحميل..."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => doctor && openDoctorInExternalMaps(doctor)}
                  disabled={!doctor}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white hover:bg-sky-600 transition ${
                    doctor ? "" : "pointer-events-none opacity-50"
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  افتح في خرائط الجهاز
                </button>
              </div>
            </div>

            <div className="h-[420px] overflow-hidden rounded-[1.75rem] bg-white">
              {doctor ? <DoctorMap doctors={[doctor]} userLocation={userLoc || undefined} /> : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black text-slate-500">العنوان والمنطقة</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {doctor?.address || doctor?.availability_note || "غير متاح"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black text-slate-500">رقم الهاتف والتواصل</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {doctor?.phone || doctor?.whatsapp || "غير متاح"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black text-slate-500">المسافة الحقيقية</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {distance !== null ? `${distance.toFixed(1)} كم تقريباً` : "بانتظار تفعيل موقعك"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/doctors/${doctorId}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-black text-white"
              >
                <ArrowRight className="h-4 w-4" />
                العودة للملف
              </Link>
              <Link
                href={`/booking?doctorId=${doctorId}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-slate-900 ring-1 ring-slate-200"
              >
                <Route className="h-4 w-4" />
                احجز الآن
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

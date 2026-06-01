"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Navigation, Route, ArrowLeft } from "lucide-react";

import { Doctor } from "@/lib/types";
import { buildDeviceMapUrl, doctorMapLabel } from "@/lib/map-links";

const DoctorMap = dynamic(() => import("@/components/DoctorMap"), { ssr: false });

export default function DoctorMapPage() {
  const params = useParams<{ id: string }>() as { id?: string } | null;
  const doctorId = params?.id || "";
  const [doctor, setDoctor] = useState<Doctor | null>(null);

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

  const deviceMapHref = doctor ? buildDeviceMapUrl(doctor, typeof window !== "undefined" ? window.navigator.userAgent : "") : "";

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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">الموقع على الخريطة</p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {doctor ? doctorMapLabel(doctor) : "جاري التحميل..."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={deviceMapHref || undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!doctor}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white ${
                    doctor ? "" : "pointer-events-none opacity-50"
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  افتح في خرائط الجهاز
                </a>
              </div>
            </div>

            <div className="h-[420px] overflow-hidden rounded-[1.75rem] bg-white">
              {doctor ? <DoctorMap doctors={[doctor]} /> : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black text-slate-500">العنوان</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {doctor?.address || doctor?.availability_note || "غير متاح"}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-black text-slate-500">التواصل</p>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {doctor?.whatsapp || "واتساب غير متاح"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/doctors/${doctorId}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-black text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة للملف
              </Link>
              <Link
                href="/booking"
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

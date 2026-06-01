"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Doctor = {
  id: string;
  name: string;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  availability_note?: string | null;
  whatsapp?: string | null;
};

const CITY_COORDS: Record<string, { x: number; y: number }> = {
  القدس: { x: 0.56, y: 0.36 },
  "رام الله": { x: 0.54, y: 0.32 },
  البيرة: { x: 0.55, y: 0.33 },
  نابلس: { x: 0.58, y: 0.22 },
  الخليل: { x: 0.55, y: 0.55 },
  "بيت لحم": { x: 0.54, y: 0.42 },
  جنين: { x: 0.59, y: 0.12 },
  طولكرم: { x: 0.57, y: 0.17 },
  قلقيلية: { x: 0.56, y: 0.19 },
  غزة: { x: 0.25, y: 0.78 },
};

export default function DoctorMapPage() {
  const params = useParams<{ id: string }>() as { id?: string } | null;
  const doctorId = params?.id || "";
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctor((data.doctors || []).find((item: Doctor) => item.id === doctorId) || null);
    })();
  }, [doctorId]);

  const marker = useMemo(() => {
    const city = doctor?.city || "";
    return CITY_COORDS[city] || { x: 0.5, y: 0.46 };
  }, [doctor]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-sky-600">خريطة العيادة</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{doctor?.name || "جاري التحميل..."}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {doctor?.city || "غير محدد"} {doctor?.area ? `- ${doctor.area}` : ""}
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative h-[360px] overflow-hidden rounded-3xl bg-sky-100">
            <div className="absolute inset-0">
              <div className="absolute left-[10%] top-[20%] h-0.5 w-[80%] bg-sky-300/80" />
              <div className="absolute left-[16%] top-[44%] h-0.5 w-[68%] bg-sky-300/80" />
              <div className="absolute left-[22%] top-[66%] h-0.5 w-[56%] bg-sky-300/80" />
              <div className="absolute left-[23%] top-[10%] h-[82%] w-0.5 bg-sky-300/80" />
              <div className="absolute left-[55%] top-[8%] h-[84%] w-0.5 bg-sky-300/80" />
            </div>
            <div className="absolute" style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%`, transform: "translate(-50%, -100%)" }}>
              <div className="h-5 w-5 rounded-full border-4 border-white bg-slate-950 shadow-xl" />
              <div className="mx-auto h-6 w-0.5 bg-slate-950" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">العنوان</p>
              <p className="mt-1 text-sm font-bold text-slate-700">{doctor?.address || doctor?.availability_note || "غير متاح"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">التواصل</p>
              <p className="mt-1 text-sm font-bold text-slate-700">{doctor?.whatsapp || "واتساب غير متاح"}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link href={`/doctors/${doctorId}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-black text-white">
              العودة للملف
            </Link>
            <Link href="/booking" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-black text-white">
              احجز الآن
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

import { Doctor } from "@/lib/types";
import { Star, MapPin, Award, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bento-card shine-border group flex flex-col gap-4 p-4 md:flex-row md:p-5">
      <div className="relative h-44 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 md:h-36 md:w-36">
        {doctor.image_url ? (
          <Image
            src={doctor.image_url}
            alt={doctor.name}
            fill
            sizes="(max-width: 768px) 100vw, 144px"
            className="object-cover transition-transform duration-500 ease-spring group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Award className="h-10 w-10" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-grow flex-col justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-lg font-black tracking-tight text-slate-900">{doctor.name}</h2>
            {doctor.verified ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
          </div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {doctor.specialty.map((spec, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary"
              >
                {spec}
              </span>
            ))}
          </div>

          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
            <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
            <span>
              {doctor.city} {doctor.area && `— ${doctor.area}`}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black text-slate-800">
              {doctor.rating && Number(doctor.rating) > 0 ? doctor.rating : "جديد"}
            </span>
          </div>

          <Link href={`/doctors/${doctor.id}`} className="btn-malama gap-1.5 px-5 py-2.5 text-xs">
            احجز الآن
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

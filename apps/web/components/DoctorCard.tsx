import { Doctor } from "@/lib/types";
import { Star, MapPin, Award, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col md:flex-row gap-4">
      {/* Featured Badge */}
      {doctor.is_featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10 shadow-sm">
          <Star className="w-3 h-3 fill-current" /> مميز
        </div>
      )}

      {/* Doctor Image */}
      <div className="relative w-full md:w-32 h-40 md:h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
        {doctor.image_url ? (
          <Image
            src={doctor.image_url}
            alt={doctor.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Award className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
            {doctor.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {doctor.specialty.map((spec, idx) => (
              <span
                key={idx}
                className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium"
              >
                {spec}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>
              {doctor.city} {doctor.area && `— ${doctor.area}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-bold text-slate-700">{doctor.rating}</span>
          </div>

          <Link
            href={`/doctors/${doctor.id}`}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
          >
            احجز الآن
          </Link>
        </div>
      </div>
    </div>
  );
}

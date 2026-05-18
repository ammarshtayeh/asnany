"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Advertisement } from "@/lib/types";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function AdSlider({ ads }: { ads: Advertisement[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(interval);
  }, [ads.length]);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 group bg-slate-900 border border-slate-100 mb-8">
      <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
        مساحة إعلانية
      </div>

      <div 
        className="flex transition-transform duration-700 ease-in-out h-[160px] md:h-[220px]"
        style={{ transform: `translateX(${currentIndex * 100}%)`, direction: "ltr" }}
      >
        {ads.map((ad, idx) => (
          <div key={ad.id} className="min-w-full h-full relative">
            <Link href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <Image
                src={ad.image_url}
                alt={ad.advertiser_name}
                fill
                className="object-cover"
                priority={idx === 0}
              />
              {/* Overlay Gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 right-6 text-white text-right z-10" dir="rtl">
                <h3 className="font-black text-xl md:text-2xl drop-shadow-lg">{ad.advertiser_name}</h3>
                <p className="text-sm font-medium text-slate-200 drop-shadow-md">اضغط لمعرفة المزيد</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Controls */}
      {ads.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1))}
            className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % ads.length)}
            className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-20 border border-white/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

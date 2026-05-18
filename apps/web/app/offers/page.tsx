"use client";

import { useState, useEffect } from "react";
import { Offer } from "@/lib/types";
import { Tag, Clock, Calendar, MapPin, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getOffers } from "@/lib/data";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers().then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-[120px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full filter blur-[120px] opacity-30 mix-blend-screen" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6 animate-fade-in-up">
            <Tag className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold">خصومات حصرية لفترة محدودة</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            عروض <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">أسناني</span> الخاصة
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            نوفر لك أفضل الأسعار والخصومات من أمهر أطباء ومراكز الأسنان المعتمدة في شبكتنا.
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => {
            const daysLeft = Math.ceil((new Date(offer.valid_until).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            
            return (
              <div key={offer.id} className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 group hover:shadow-primary/20 transition-all duration-500 flex flex-col">
                {/* Image Box */}
                <div className="h-56 relative overflow-hidden bg-slate-100">
                  <Image src={offer.image_url} alt={offer.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-2xl shadow-lg border-2 border-white transform rotate-3 origin-bottom-right shadow-red-500/30">
                    <span className="block text-2xl font-black leading-none">{offer.discount_percentage}%</span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-red-100">خصم</span>
                  </div>

                  {/* Timer Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    ينتهي بعد {daysLeft} يوم
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {offer.doctor_name}
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight">
                    {offer.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm font-medium mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {offer.description}
                  </p>

                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {offer.discount_percentage === 100 ? (
                        <span className="text-2xl font-black text-emerald-500">مجاناً</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-400 line-through decoration-red-400/50 decoration-2">
                            {offer.original_price} شيكل
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            {offer.discounted_price} <span className="text-sm text-slate-500 font-bold">شيكل</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/doctors/${offer.doctor_id}`} className="bg-slate-900 hover:bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg group-hover:shadow-primary/30">
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </main>
  );
}

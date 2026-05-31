"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgePercent, CalendarClock, Sparkles, Tag } from "lucide-react";
import { Offer } from "@/lib/types";
import { getOffers } from "@/lib/data";

const OFFER_IMAGES = [
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
];

function getOfferImage(index: number) {
  return OFFER_IMAGES[index % OFFER_IMAGES.length];
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers().then((data) => {
      setOffers(data);
      setLoading(false);
    });
  }, []);

  const featuredOffer = offers[0];
  const restOffers = offers.slice(1);

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-24" dir="rtl">
      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:px-8">
        <div className="flex flex-col justify-center text-right">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">
            <BadgePercent className="h-4 w-4" />
            عروض مختارة بعناية
          </span>
          <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-6xl">
            وفّر على علاج الأسنان بدون ما تتنازل عن الجودة.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
            عروض محدثة من أطباء وعيادات ضمن شبكة أسناني. قارن السعر، مدة العرض، والطبيب قبل الحجز.
          </p>
          <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">
            <Metric value={offers.length || 0} label="عرض نشط" />
            <Metric value="موثق" label="مصدر العرض" />
            <Metric value="سريع" label="تواصل وحجز" />
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-slate-900 shadow-xl">
          <Image
            src={getOfferImage(0)}
            alt={featuredOffer?.title || "عروض أسناني"}
            fill
            priority
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-right text-white md:p-8">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              العرض الأبرز
            </span>
            <h2 className="text-2xl font-black leading-9 md:text-3xl">{featuredOffer?.title || "عروض أسناني الخاصة"}</h2>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-7 text-slate-200">
              {featuredOffer?.description || "تابع أحدث الخصومات والعروض من العيادات المعتمدة."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-[1400px] px-4 lg:px-8">
        {loading ? (
          <LoadingGrid />
        ) : offers.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[featuredOffer, ...restOffers].filter(Boolean).map((offer, index) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(offer.valid_until).getTime() - Date.now()) / (1000 * 3600 * 24)));
              const discount = offer.discount_percentage ?? 0;

              return (
                <article key={offer.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <Image src={getOfferImage(index + 1)} alt={offer.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute right-4 top-4 rounded-xl bg-rose-600 px-4 py-3 text-center text-white shadow-lg">
                      <span className="block text-2xl font-black leading-none">{discount}%</span>
                      <span className="text-[11px] font-black">خصم</span>
                    </div>
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-950/70 px-3 py-2 text-xs font-black text-white backdrop-blur">
                      <CalendarClock className="h-4 w-4 text-amber-300" />
                      {daysLeft ? `${daysLeft} يوم متبقي` : "ينتهي اليوم"}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-2 flex items-center gap-2 text-sm font-black text-slate-500">
                      <Tag className="h-4 w-4 text-amber-500" />
                      {offer.doctor_name || "عرض طبي"}
                    </p>
                    <h3 className="line-clamp-2 text-xl font-black leading-8 text-slate-950">{offer.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm font-semibold leading-7 text-slate-500">{offer.description}</p>
                    <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-5">
                      <div>
                        {discount === 100 ? (
                          <span className="text-2xl font-black text-emerald-600">مجاناً</span>
                        ) : (
                          <>
                            {offer.original_price ? <span className="block text-sm font-bold text-slate-400 line-through">{offer.original_price} شيكل</span> : null}
                            <span className="text-2xl font-black text-slate-950">{offer.discounted_price || "خاص"} <span className="text-sm text-slate-500">شيكل</span></span>
                          </>
                        )}
                      </div>
                      {offer.doctor_id ? (
                        <Link href={`/doctors/${offer.doctor_id}`} className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-amber-500">
                          <ArrowLeft className="h-5 w-5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Empty title="لا توجد عروض نشطة حالياً" />
        )}
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function LoadingGrid() {
  return <div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-96 animate-pulse rounded-2xl bg-white" />)}</div>;
}

function Empty({ title }: { title: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xl font-black text-slate-800 shadow-sm">{title}</div>;
}

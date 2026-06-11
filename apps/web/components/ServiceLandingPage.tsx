import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, MapPin, MessageCircle, Phone, Star, Sparkles } from "lucide-react";
import { MedicalService } from "@/lib/types";

type ServiceLandingPageProps = {
  badge: string;
  title: string;
  description: string;
  features: string[];
  actions: Array<{ label: string; href: string }>;
  listings?: MedicalService[];
  emptyLabel?: string;
  topSlot?: ReactNode;
};

export default function ServiceLandingPage({
  badge,
  title,
  description,
  features,
  actions,
  listings = [],
  emptyLabel = "سيتم إضافة مزودي الخدمة قريباً.",
  topSlot,
}: ServiceLandingPageProps) {
  return (
    <main className="min-h-screen bg-transparent" dir="rtl">
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 px-4 pt-16 pb-28 text-white border-b border-slate-900 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-sky-500/5 blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300 transition-all hover:border-amber-500/30 hover:bg-white/10 hover:text-white"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              الرئيسية
            </Link>
          </div>

          {/* Service Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-300 backdrop-blur-md shadow-[0_0_15px_rgba(217,119,6,0.1)]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{badge}</span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-gradient-gold text-amber-400">
                  {title.split(" ").slice(-2).join(" ")}
                </span>
              </>
            ) : (
              title
            )}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-3xl text-slate-300 text-base md:text-lg leading-8 font-semibold">
            {description}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_4px_20px_rgba(217,119,6,0.15)] hover:scale-[1.02]"
              >
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area - Added relative z-10 to fix the stacking context bug */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 -mt-14 pb-24">
        {topSlot ? <div className="mb-8">{topSlot}</div> : null}

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-0.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-1" />
              <p className="text-slate-700 font-bold leading-7 text-sm sm:text-base">{feature}</p>
            </div>
          ))}
        </div>

        {/* Providers Section */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-950">مزودو الخدمة المعتمدون</h2>
              <p className="text-slate-500 mt-1 font-semibold text-sm sm:text-base">
                نتائج مختارة ومنظمة لمساعدتك على المقارنة والتواصل بثقة.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-slate-200/80 border border-slate-300/40 text-slate-700 px-4.5 py-1.5 text-xs font-black">
              {listings.length} نتيجة
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 backdrop-blur-md p-12 text-center shadow-sm">
              <p className="text-slate-500 font-bold text-base">{emptyLabel}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {listings.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-[2rem] border border-slate-200/70 shadow-[0_4px_30px_rgba(15,23,42,0.01)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.05)] overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  {item.image_url ? (
                    <div className="h-52 bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{item.name}</h3>
                        <p className="text-xs text-amber-600 font-black mt-1 bg-amber-500/5 border border-amber-500/10 rounded-full px-3 py-1 inline-block">
                          {item.category || "خدمة طبية"}
                        </p>
                      </div>
                      {item.is_featured ? (
                        <span className="inline-flex items-center gap-1 bg-slate-950 text-amber-400 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-black shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          مميز
                        </span>
                      ) : null}
                    </div>

                    <p className="text-slate-600 leading-7 mt-4 font-semibold text-sm line-clamp-3">
                      {item.description}
                    </p>

                    {item.services?.length ? (
                      <div className="flex flex-wrap gap-2 mt-4.5">
                        {item.services.map((service) => (
                          <span
                            key={service}
                            className="bg-slate-100 text-slate-600 rounded-lg px-2.5 py-1 text-xs font-black"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-4 text-xs sm:text-sm font-black text-slate-600">
                      {item.city ? (
                        <span className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <MapPin className="w-4 h-4 text-amber-500" />
                          {item.city}
                        </span>
                      ) : null}
                      {item.price_range ? (
                        <span className="inline-flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          {item.price_range}
                        </span>
                      ) : null}
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone}`}
                          className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-sky-600" />
                          اتصال
                        </a>
                      ) : null}
                      {item.whatsapp ? (
                        <a
                          href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                          className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          واتساب
                        </a>
                      ) : null}
                      {item.website ? (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          <Globe className="w-4 h-4 text-indigo-600" />
                          موقع
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl transition-all hover:scale-[1.02]"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}


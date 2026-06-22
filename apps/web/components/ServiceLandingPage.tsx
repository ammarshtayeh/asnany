import React, { ReactNode } from "react";
import EmptyStateCTA from "@/components/EmptyStateCTA";
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
  emptyCta?: {
    title: string;
    description: string;
    primaryHref?: string;
    primaryLabel?: string;
    secondaryHref?: string;
    secondaryLabel?: string;
    whatsappMessage?: string;
    tips?: string[];
  };
  topSlot?: ReactNode;
  /** Base path for service detail pages, e.g. "/beauty" → "/beauty/[id]" */
  detailsBasePath?: string;
};

export default function ServiceLandingPage({
  badge,
  title,
  description,
  features,
  actions,
  listings = [],
  emptyLabel = "سيتم إضافة مزودي الخدمة قريباً.",
  emptyCta,
  topSlot,
  detailsBasePath,
}: ServiceLandingPageProps) {
  return (
    <main className="min-h-screen bg-transparent" dir="rtl">
      <section className="page-hero-dark relative px-4 pb-32 pt-20 sm:px-6 sm:pb-36 sm:pt-24">
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300 backdrop-blur-sm transition-all hover:border-amber-500/30 hover:bg-white/10 hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            الرئيسية
          </Link>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-black text-[#f5d76e] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {badge}
          </span>

          <h1 className="mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl">
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="text-gradient-gold">{title.split(" ").slice(-2).join(" ")}</span>
              </>
            ) : (
              title
            )}
          </h1>

          <p className="mt-5 max-w-3xl text-base font-semibold leading-8 text-slate-300 md:text-lg">{description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className={i === 0 ? "btn-malama" : "btn-malama-ghost"}
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl -mt-16 px-4 pb-24 sm:-mt-20">
        {topSlot ? <div className="mb-8">{topSlot}</div> : null}

        {/* Feature Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="bento-card flex gap-4 p-5">
              <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-500" />
              <p className="text-sm font-bold leading-7 text-slate-700 sm:text-base">{feature}</p>
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
            emptyCta ? (
              <EmptyStateCTA {...emptyCta} />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 backdrop-blur-md p-12 text-center shadow-sm">
                <p className="text-slate-500 font-bold text-base">{emptyLabel}</p>
              </div>
            )
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {listings.map((item) => {
                const CardWrapper = detailsBasePath
                  ? ({ children }: { children: React.ReactNode }) => (
                      <Link href={`${detailsBasePath}/${item.id}`} className="block group">
                        {children}
                      </Link>
                    )
                  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

                return (
                  <CardWrapper key={item.id}>
                    <article className="bento-card shine-border flex h-full flex-col overflow-hidden">
                      {item.image_url ? (
                        <div className="h-52 bg-slate-100 overflow-hidden relative flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {detailsBasePath && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-white text-xs font-black bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                                عرض التفاصيل ←
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-black text-slate-950 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                            <p className="text-xs text-amber-600 font-black mt-1 bg-amber-500/5 border border-amber-500/10 rounded-full px-3 py-1 inline-block">
                              {item.category || "خدمة طبية"}
                            </p>
                          </div>
                          {item.is_featured ? (
                            <span className="inline-flex items-center gap-1 bg-slate-950 text-amber-400 border border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-black shadow-sm flex-shrink-0">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              مميز
                            </span>
                          ) : null}
                        </div>

                        <p className="text-slate-600 leading-7 mt-4 font-semibold text-sm line-clamp-3 flex-1">
                          {item.description}
                        </p>

                        {item.services?.length ? (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {item.services.slice(0, 4).map((service) => (
                              <span
                                key={service}
                                className="bg-slate-100 text-slate-600 rounded-lg px-2.5 py-1 text-xs font-black"
                              >
                                {service}
                              </span>
                            ))}
                            {item.services.length > 4 && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg px-2.5 py-1 text-xs font-black">
                                +{item.services.length - 4} خدمات
                              </span>
                            )}
                          </div>
                        ) : null}

                        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3 text-xs sm:text-sm font-black text-slate-600">
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
                          {!detailsBasePath && item.phone ? (
                            <a
                              href={`tel:${item.phone}`}
                              className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            >
                              <Phone className="w-4 h-4 text-sky-600" />
                              اتصال
                            </a>
                          ) : null}
                          {!detailsBasePath && item.whatsapp ? (
                            <a
                              href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-600" />
                              واتساب
                            </a>
                          ) : null}
                          {!detailsBasePath && item.website ? (
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
                          {detailsBasePath && (
                            <span className="ms-auto inline-flex items-center gap-1.5 bg-amber-500 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-sm hover:bg-amber-400 transition-colors">
                              عرض التفاصيل
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </CardWrapper>
                );
              })}
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


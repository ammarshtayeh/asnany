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
      <section className="section-shell pt-4">
        <div className="page-hero-light relative px-6 py-10 sm:px-10 sm:py-12">
          <Link href="/" className="btn-malama-outline mb-6 inline-flex text-xs">
            <ArrowRight className="h-3.5 w-3.5" />
            الرئيسية
          </Link>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#eef5f3] px-4 py-1.5 text-xs font-extrabold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {badge}
          </span>

          <h1 className="mt-2 max-w-3xl font-display text-3xl font-extrabold leading-[1.2] tracking-tight text-[#0a1628] sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600 md:text-lg">{description}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            {actions.map((action, i) => (
              <Link key={action.href} href={action.href} className={i === 0 ? "btn-malama" : "btn-malama-outline"}>
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell relative z-10 mt-6 pb-24">
        {topSlot ? <div className="mb-8">{topSlot}</div> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="bento-card flex gap-4 p-5">
              <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-sm font-bold leading-7 text-slate-700 sm:text-base">{feature}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-950 md:text-3xl">مزودو الخدمة المعتمدون</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500 sm:text-base">
                نتائج مختارة ومنظمة لمساعدتك على المقارنة والتواصل بثقة.
              </p>
            </div>
            <span className="self-start rounded-full border border-[#e8e4dc] bg-[#faf8f5] px-4 py-1.5 text-xs font-extrabold text-slate-600 sm:self-auto">
              {listings.length} نتيجة
            </span>
          </div>

          {listings.length === 0 ? (
            emptyCta ? (
              <EmptyStateCTA {...emptyCta} />
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-base font-bold text-slate-500">{emptyLabel}</p>
              </div>
            )
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {listings.map((item) => {
                const CardWrapper = detailsBasePath
                  ? ({ children }: { children: React.ReactNode }) => (
                      <Link href={`${detailsBasePath}/${item.id}`} className="group block">
                        {children}
                      </Link>
                    )
                  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

                return (
                  <CardWrapper key={item.id}>
                    <article className="bento-card flex h-full flex-col overflow-hidden">
                      {item.image_url ? (
                        <div className="relative h-52 flex-shrink-0 overflow-hidden bg-[#e8f0ef]">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-950 transition-colors group-hover:text-primary">{item.name}</h3>
                            <p className="mt-1 inline-block rounded-full bg-[#eef5f3] px-3 py-1 text-xs font-extrabold text-primary">
                              {item.category || "خدمة طبية"}
                            </p>
                          </div>
                          {item.is_featured ? (
                            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-extrabold text-white">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              مميز
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-4 flex-1 text-sm font-semibold leading-7 text-slate-600 line-clamp-3">
                          {item.description}
                        </p>

                        {item.services?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {item.services.slice(0, 4).map((service) => (
                              <span key={service} className="rounded-full bg-[#f3f0ea] px-2.5 py-1 text-xs font-extrabold text-slate-600">
                                {service}
                              </span>
                            ))}
                            {item.services.length > 4 ? (
                              <span className="rounded-full bg-[#eef5f3] px-2.5 py-1 text-xs font-extrabold text-primary">
                                +{item.services.length - 4} خدمات
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 text-xs font-extrabold text-slate-600 sm:text-sm">
                          {item.city ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#faf8f5] px-3 py-1.5">
                              <MapPin className="h-4 w-4 text-primary" />
                              {item.city}
                            </span>
                          ) : null}
                          {item.price_range ? (
                            <span className="inline-flex items-center rounded-full border border-slate-100 bg-[#faf8f5] px-3 py-1.5">
                              {item.price_range}
                            </span>
                          ) : null}
                          {!detailsBasePath && item.phone ? (
                            <a
                              href={`tel:${item.phone}`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#faf8f5] px-3 py-1.5 transition-colors hover:bg-[#eef5f3] hover:text-primary"
                            >
                              <Phone className="h-4 w-4 text-primary" />
                              اتصال
                            </a>
                          ) : null}
                          {!detailsBasePath && item.whatsapp ? (
                            <a
                              href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#faf8f5] px-3 py-1.5 transition-colors hover:bg-[#eef5f3] hover:text-primary"
                            >
                              <MessageCircle className="h-4 w-4 text-primary" />
                              واتساب
                            </a>
                          ) : null}
                          {!detailsBasePath && item.website ? (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#faf8f5] px-3 py-1.5 transition-colors hover:bg-[#eef5f3] hover:text-primary"
                            >
                              <Globe className="h-4 w-4 text-primary" />
                              موقع
                            </a>
                          ) : null}
                          {detailsBasePath ? (
                            <span className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-white">
                              عرض التفاصيل
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </CardWrapper>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/" className="btn-malama px-8 py-4">
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}

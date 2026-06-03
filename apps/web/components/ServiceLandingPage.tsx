import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { MedicalService } from "@/lib/types";

type ServiceLandingPageProps = {
  badge: string;
  title: string;
  description: string;
  features: string[];
  actions: Array<{ label: string; href: string }>;
  listings?: MedicalService[];
  emptyLabel?: string;
};

export default function ServiceLandingPage({
  badge,
  title,
  description,
  features,
  actions,
  listings = [],
  emptyLabel = "سيتم إضافة مزودي الخدمة قريباً.",
}: ServiceLandingPageProps) {
  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      <section className="bg-slate-950 text-white pt-20 pb-28 px-4 relative">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
            >
              <ArrowRight className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>
          <span className="inline-flex rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-black">
            {badge}
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight">{title}</h1>
          <p className="mt-5 max-w-3xl text-slate-300 text-lg md:text-xl leading-9 font-medium">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 bg-white text-slate-950 px-5 py-3 rounded-xl font-black hover:bg-sky-500 hover:text-white transition-colors"
              >
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 -mt-14 pb-24">
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-700 font-bold leading-7">{feature}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-950">مزودو الخدمة المعتمدون</h2>
              <p className="text-slate-500 mt-1 font-medium">نتائج مختارة ومنظمة لمساعدتك على المقارنة والتواصل بثقة.</p>
            </div>
            <span className="rounded-full bg-slate-200 text-slate-700 px-4 py-1.5 text-sm font-black">
              {listings.length} نتيجة
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-slate-500 font-bold">{emptyLabel}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {listings.map((item) => (
                <article key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  {item.image_url ? (
                    <div className="h-48 bg-slate-100">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{item.name}</h3>
                        <p className="text-sm text-sky-700 font-black mt-1">{item.category || "خدمة طبية"}</p>
                      </div>
                      {item.is_featured ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-3 py-1 text-xs font-black">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          مميز
                        </span>
                      ) : null}
                    </div>

                    <p className="text-slate-600 leading-7 mt-4 font-medium">{item.description}</p>

                    {item.services?.length ? (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.services.map((service) => (
                          <span key={service} className="bg-slate-100 text-slate-700 rounded-lg px-3 py-1 text-xs font-bold">
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                      {item.city ? <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{item.city}</span> : null}
                      {item.price_range ? <span>{item.price_range}</span> : null}
                      {item.phone ? <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1 hover:text-sky-700"><Phone className="w-4 h-4" />اتصال</a> : null}
                      {item.whatsapp ? <a href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`} className="inline-flex items-center gap-1 hover:text-emerald-700"><MessageCircle className="w-4 h-4" />واتساب</a> : null}
                      {item.website ? <a href={item.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-sky-700"><Globe className="w-4 h-4" />موقع</a> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

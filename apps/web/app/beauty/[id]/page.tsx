import { getMedicalServiceById, getMedicalServices } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Phone,
  MessageCircle,
  Globe,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export async function generateStaticParams() {
  const services = await getMedicalServices("beauty");
  return services.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getMedicalServiceById(id);
  return {
    title: service ? `${service.name} | مراكز التجميل | ملامح` : "مركز تجميل | ملامح",
    description: service?.description ?? "تفاصيل مركز التجميل على منصة ملامح.",
  };
}

export default async function BeautyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getMedicalServiceById(id);

  if (!service) notFound();

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background image */}
        {service.image_url && (
          <div className="absolute inset-0">
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
          </div>
        )}

        {/* Glow effects */}
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-pink-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 font-black">
            <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span>/</span>
            <Link href="/beauty" className="hover:text-white transition-colors">مراكز التجميل</Link>
            <span>/</span>
            <span className="text-slate-200 truncate max-w-[160px]">{service.name}</span>
          </div>

          {/* Back button */}
          <Link
            href="/beauty"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-300 transition-all hover:border-amber-500/30 hover:bg-white/10 hover:text-white mb-8"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            العودة إلى مراكز التجميل
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-1">
              {service.category && (
                <span className="inline-block mb-3 bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-black px-3 py-1 rounded-full">
                  {service.category}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                {service.name}
              </h1>
              {service.city && (
                <p className="mt-3 flex items-center gap-2 text-slate-300 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {service.city}
                  {service.area ? ` — ${service.area}` : ""}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              {service.is_featured && (
                <span className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black px-4 py-2 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  مركز مميز
                </span>
              )}
              {service.rating > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(service.rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                    />
                  ))}
                  <span className="text-slate-300 text-xs font-black ms-1">{service.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 pb-24 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {service.description && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <h2 className="text-lg font-black text-slate-950">نبذة عن المركز</h2>
                </div>
                <p className="text-slate-700 leading-8 font-semibold text-sm sm:text-base">
                  {service.description}
                </p>
              </div>
            )}

            {/* Services list */}
            {service.services && service.services.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-black text-slate-950">الخدمات المتاحة</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.services.map((s) => (
                    <div key={s} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />
                      <span className="text-slate-700 text-sm font-bold">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {service.gallery && service.gallery.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/70 p-7 shadow-sm">
                <h2 className="text-lg font-black text-slate-950 mb-5">معرض الصور</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {service.gallery.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
                      <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-950 mb-4">التواصل والزيارة</h3>
              <div className="space-y-3">
                {service.phone && (
                  <a
                    href={`tel:${service.phone}`}
                    className="flex items-center gap-3 bg-sky-50 border border-sky-100 hover:bg-sky-100 text-sky-700 rounded-2xl px-4 py-3 font-black text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {service.phone}
                  </a>
                )}
                {service.whatsapp && (
                  <a
                    href={`https://wa.me/${service.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 font-black text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    واتساب
                  </a>
                )}
                {service.website && (
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-2xl px-4 py-3 font-black text-sm transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="flex-1 truncate">الموقع الإلكتروني</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-950 mb-4">معلومات إضافية</h3>
              <div className="space-y-3 text-sm font-semibold text-slate-700">
                {service.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-slate-950 text-xs mb-0.5">الموقع</p>
                      <p>{service.city}{service.area ? ` — ${service.area}` : ""}</p>
                      {service.address && <p className="text-slate-500 text-xs mt-0.5">{service.address}</p>}
                    </div>
                  </div>
                )}
                {service.price_range && (
                  <div className="flex items-start gap-3">
                    <span className="text-amber-500 font-black text-base leading-none mt-0.5">₪</span>
                    <div>
                      <p className="font-black text-slate-950 text-xs mb-0.5">نطاق الأسعار</p>
                      <p>{service.price_range}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA to list */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl p-6 text-white">
              <p className="text-sm font-black mb-1">هل أنت صاحب المركز؟</p>
              <p className="text-slate-400 text-xs font-semibold mb-4 leading-6">سجّل مركزك وابدأ في الظهور أمام آلاف الزوار يومياً.</p>
              <Link
                href="/join"
                className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 rounded-xl px-4 py-2.5 text-sm font-black hover:bg-amber-300 transition-colors w-full justify-center"
              >
                سجّل الآن
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

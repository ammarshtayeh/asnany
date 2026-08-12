'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { Doctor } from '@pal-dental/shared';
import { ArrowRight, BadgeCheck, Calendar, MapPin, PhoneCall, Search, Star } from 'lucide-react';
import EmptyStateCTA from '@/components/EmptyStateCTA';
import { CITIES, SPECIALTIES } from '@/lib/constants';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    city: searchParams?.get('city') || '',
    specialty: searchParams?.get('specialty') || '',
    insurance: searchParams?.get('insurance') || 'any',
  });

  useEffect(() => {
    void fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialty) params.append('specialty', filters.specialty);

      const response = await fetch(`/api/doctors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      let data = await response.json();

      if (filters.insurance === 'yes') {
        data = data.filter((d: Doctor) => d.acceptsInsurance || d.accepts_insurance);
      } else if (filters.insurance === 'no') {
        data = data.filter((d: Doctor) => !(d.acceptsInsurance || d.accepts_insurance));
      }

      setDoctors(data);
    } catch {
      setError('تعذر تحميل نتائج البحث. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const needle = query.trim().toLowerCase();
  const visibleDoctors = needle
    ? doctors.filter((doctor) =>
        [doctor.name, doctor.city, doctor.area, ...(Array.isArray(doctor.specialty) ? doctor.specialty : [doctor.specialty, doctor.category])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    : doctors;

  return (
    <main className="min-h-screen animate-fade-in bg-transparent pb-24 pt-2 text-right" dir="rtl">
      <section className="relative isolate overflow-hidden">
        <div className="relative min-h-[420px] bg-[#060c18]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_10%,rgba(16,185,129,0.16),transparent_42%),linear-gradient(180deg,rgba(6,12,24,0.2)_0%,rgba(6,12,24,0.95)_100%)]" />
          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-[var(--page-gutter)] pb-24 pt-10">
            <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-black text-white transition hover:bg-white/10">
              <ArrowRight className="h-3.5 w-3.5" />
              الرئيسية
            </Link>
            <p className="text-sm font-black tracking-[0.18em] text-[#e8c86a]">ملامح</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
              ابحث عن الطبيب المناسب
              <span className="mt-2 block bg-gradient-to-l from-[#e8c86a] via-[#f5d76e] to-[#fff4c2] bg-clip-text text-transparent">
                حسب مدينتك وتخصصك
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-300 md:text-base">
              قارن الأطباء الموثّقين، تواصل مباشرة، واحجز موعدك بخطوات واضحة.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-white/12 bg-white/[0.06] p-4 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-5">
              <label className="mb-3 flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4">
                <Search className="h-5 w-5 text-[#e8c86a]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm font-bold text-white outline-none placeholder:text-slate-400"
                  placeholder="ابحث بالاسم أو المنطقة..."
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1526] px-4 py-3 text-sm font-black text-white outline-none focus:border-[#e8c86a]/40"
                >
                  <option value="">كل المدن</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <select
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1526] px-4 py-3 text-sm font-black text-white outline-none focus:border-[#e8c86a]/40"
                >
                  <option value="">كل التخصصات</option>
                  {SPECIALTIES.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.label}</option>
                  ))}
                </select>
                <select
                  value={filters.insurance}
                  onChange={(e) => handleFilterChange('insurance', e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1526] px-4 py-3 text-sm font-black text-white outline-none focus:border-[#e8c86a]/40"
                >
                  <option value="any">كل خيارات التأمين</option>
                  <option value="yes">يقبل التأمين</option>
                  <option value="no">دفع شخصي فقط</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell relative z-20 -mt-14 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-slate-200/70 bg-white p-16 text-center shadow-[0_16px_40px_-24px_rgba(10,22,40,0.18)]">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm font-bold text-slate-500">جاري البحث عن الأطباء المناسبين...</span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-[1.5rem] border border-rose-100 bg-white p-12 text-center shadow-sm">
            <p className="mb-4 font-black text-rose-600">{error}</p>
            <button type="button" onClick={() => void fetchDoctors()} className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-white">
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && visibleDoctors.length === 0 && (
          <EmptyStateCTA
            title="لا توجد نتائج مطابقة — لكن الدليل ينمو"
            description="جرّب مدينة أو تخصصاً آخر. هل أنت طبيب؟ كن من أوائل المنضمين واحصل على أولوية ظهور في الدليل."
            primaryHref="/join"
            primaryLabel="انضم كطبيب شريك"
            secondaryHref="/doctors/search"
            secondaryLabel="عرض كل الأطباء"
            whatsappMessage="مرحباً، أريد تسجيل عيادتي على ملامح.ps"
            tips={['رام الله', 'نابلس', 'الخليل', 'أسنان', 'عيون', 'جلدية']}
          />
        )}

        {!loading && !error && visibleDoctors.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                {visibleDoctors.length} نتيجة
              </span>
              <Link href="/trust" className="text-xs font-black text-primary hover:underline">
                كيف نختار الأطباء؟
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleDoctors.map((doctor: Doctor) => (
                <article
                  className="group flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white p-4 shadow-[0_12px_36px_-18px_rgba(10,22,40,0.12)] transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_22px_48px_-18px_rgba(10,22,40,0.16)]"
                  key={doctor.id}
                >
                  <div>
                    <div className="relative mb-4 h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                      <img
                        alt={doctor.name}
                        src={doctor.imageUrl || doctor.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=70&w=640&auto=format&fit=crop'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="mb-1 flex items-center gap-1.5">
                      <h3 className="text-lg font-black tracking-tight text-slate-900">{doctor.name}</h3>
                      {doctor.verified ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[10px] font-black text-primary"
                          title="راجعت الإدارة بيانات العيادة الأساسية"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                          موثّق
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(Array.isArray(doctor.specialty) ? doctor.specialty : [doctor.specialty || doctor.category]).filter(Boolean).map((s) => (
                        <span key={String(s)} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{doctor.city}{doctor.area ? ` • ${doctor.area}` : ''}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="mb-3 flex items-center justify-between text-xs font-black">
                      <span className="inline-flex items-center gap-1 text-slate-800">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        {(doctor.rating && Number(doctor.rating) > 0) ? doctor.rating : '—'}
                      </span>
                      <span className={`rounded-lg border px-2.5 py-1 ${(doctor.acceptsInsurance || doctor.accepts_insurance) ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                        {(doctor.acceptsInsurance || doctor.accepts_insurance) ? 'يقبل التأمين' : 'دفع شخصي'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-xs font-black text-white transition hover:bg-primary/90"
                        href={`/doctors/${doctor.id}#booking`}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        احجز
                      </Link>
                      <Link
                        className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-black text-slate-800 transition hover:bg-white"
                        href={`/doctors/${doctor.id}`}
                      >
                        الملف
                      </Link>
                      {doctor.whatsapp ? (
                        <a
                          className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-emerald-700 transition hover:bg-emerald-100"
                          href={`https://wa.me/${String(doctor.whatsapp).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="واتساب"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm font-bold text-slate-500">جاري التحميل...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}

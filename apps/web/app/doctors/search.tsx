'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Doctor } from '@pal-dental/shared';
import { ArrowRight, BadgeCheck, PhoneCall, Search, Star, Sparkles, MapPin, ShieldCheck, HeartPulse } from 'lucide-react';
import { CITIES, SPECIALTIES } from '@/lib/constants';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams?.get('city') || '',
    specialty: searchParams?.get('specialty') || '',
    insurance: searchParams?.get('insurance') || 'any'
  });

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.specialty) params.append('specialty', filters.specialty);

      const response = await fetch(`/api/doctors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      let data = await response.json();
      
      // Client-side filtering for insurance
      if (filters.insurance === 'yes') {
        data = data.filter((d: Doctor) => d.acceptsInsurance || d.accepts_insurance);
      } else if (filters.insurance === 'no') {
        data = data.filter((d: Doctor) => !(d.acceptsInsurance || d.accepts_insurance));
      }

      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-24 text-right" dir="rtl">
      {/* Header section with gradient */}
      <section className="bg-slate-950 pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600 rounded-full blur-[120px] opacity-15" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-15" />

        <div className="max-w-[1400px] mx-auto relative z-10 px-4">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-xs font-black transition-all hover:scale-105"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              الرئيسية
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-black">البحث المتقدم والأقسام</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
            ابحث عن <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">طبيبك أو عيادتك</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-semibold max-w-xl mb-10 leading-relaxed">
            ابحث وقارن بين نخبة أطباء وعيادات العيون، الجلدية، التجميل، والأسنان في فلسطين، واحجز موعدك بضغطة زر.
          </p>

          {/* Filter Panel (Glassmorphic) */}
          <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-slate-300 text-xs font-black mb-2 mr-1">المدينة</label>
                <select 
                  value={filters.city} 
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white px-4 py-3 rounded-2xl outline-none focus:border-amber-400 transition-all font-bold text-sm"
                >
                  <option value="" className="bg-slate-950">كل المدن</option>
                  {CITIES.map(city => (
                    <option key={city} value={city} className="bg-slate-950">{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-black mb-2 mr-1">التخصص أو القسم</label>
                <select 
                  value={filters.specialty} 
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white px-4 py-3 rounded-2xl outline-none focus:border-amber-400 transition-all font-bold text-sm"
                >
                  <option value="" className="bg-slate-950">كل التخصصات</option>
                  {SPECIALTIES.map(spec => (
                    <option key={spec.id} value={spec.id} className="bg-slate-950">{spec.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-black mb-2 mr-1">شركات التأمين</label>
                <select 
                  value={filters.insurance} 
                  onChange={(e) => handleFilterChange('insurance', e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/10 text-white px-4 py-3 rounded-2xl outline-none focus:border-amber-400 transition-all font-bold text-sm"
                >
                  <option value="any" className="bg-slate-950">كل خيارات التأمين</option>
                  <option value="yes" className="bg-slate-950">يقبل التأمين</option>
                  <option value="no" className="bg-slate-950">دفع شخصي فقط</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 -mt-12 relative z-20">
        {loading && (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/60 shadow-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
            <span className="text-sm font-bold text-slate-500">جاري البحث عن الأطباء المناسبين...</span>
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/60 shadow-lg">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-slate-500 font-bold text-sm">جرب تعديل خيارات التصفية أو البحث بمدينة أخرى.</p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <>
            <div className="mb-6 flex justify-between items-center mr-2">
              <span className="text-xs font-black text-slate-400 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                تم العثور على <strong>{doctors.length}</strong> أطباء ومراكز
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {doctors.map((doctor: Doctor) => (
                <article 
                  className={`bg-white rounded-3xl overflow-hidden border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                    doctor.isFeatured || doctor.is_featured 
                      ? 'border-amber-300 ring-2 ring-amber-100' 
                      : 'border-slate-200/70 hover:border-slate-300'
                  }`}
                  key={doctor.id}
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-55">
                      <img 
                        alt={doctor.name} 
                        src={doctor.imageUrl || doctor.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'} 
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                      {(doctor.isFeatured || doctor.is_featured) && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md border border-white/20">
                          ⭐️ مقترح ملامح
                        </div>
                      )}
                    </div>

                    {/* Title & Specialties */}
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 justify-start flex-row-reverse mb-1.5">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{doctor.name}</h3>
                        {doctor.verified && (
                          <BadgeCheck className="w-5 h-5 text-sky-500 fill-sky-50" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 justify-start mt-2">
                        {Array.isArray(doctor.specialty) ? (
                          doctor.specialty.map(s => (
                            <span key={s} className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200/30">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200/30">
                            {doctor.specialty || doctor.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-4 justify-start">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{doctor.city} {doctor.area ? `• ${doctor.area}` : ''}</span>
                    </div>
                  </div>

                  <div>
                    {/* Meta Row */}
                    <div className="border-t border-slate-100 pt-4 mb-5 flex items-center justify-between text-xs font-black">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-slate-800">{doctor.rating || '5.0'}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg border ${
                        (doctor.acceptsInsurance || doctor.accepts_insurance) 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {(doctor.acceptsInsurance || doctor.accepts_insurance) ? '🏥 يقبل التأمين' : '💳 دفع شخصي'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link 
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-center py-3 rounded-2xl text-xs transition-all hover:scale-[1.01]" 
                        href={`/doctors/${doctor.id}`}
                      >
                        تفاصيل الملف
                      </Link>
                      {(doctor.whatsapp || doctor.whatsapp) && (
                        <a 
                          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 text-emerald-700 font-black px-4 py-3 rounded-2xl text-xs transition-all flex items-center justify-center hover:scale-[1.01]" 
                          href={`https://wa.me/${(doctor.whatsapp || doctor.whatsapp || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </a>
                      )}
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

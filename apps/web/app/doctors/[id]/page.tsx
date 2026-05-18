import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Doctor } from "@/lib/types";
import DoctorProfileClient from "./DoctorProfileClient";

// Mock Data fetching function
async function getDoctor(id: string): Promise<Doctor> {
  // Demo mock data
  return {
    id,
    name: "د. أحمد محمود",
    specialty: ["زراعة الأسنان", "تجميل الأسنان", "جراحة الفكين"],
    city: "رام الله",
    area: "الماصيون - عمارة النور الطابق 3",
    lat: 31.898,
    lng: 35.201,
    rating: 4.9,
    is_featured: true,
    accepts_insurance: true,
    verified: true,
    phone: "022987654",
    whatsapp: "+970599123456",
    bio: "طبيب أسنان استشاري متخصص في زراعة وتجميل الأسنان بخبرة تزيد عن 15 عاماً. حاصل على البورد الأمريكي في جراحة الفم والفكين، وعضو الجمعية العالمية لزراعة الأسنان. يمتلك العيادة أحدث أجهزة الليزر والتصوير ثلاثي الأبعاد لضمان دقة التشخيص وأفضل النتائج العلاجية والتجميلية.",
    working_hours: {
      "السبت": "09:00 ص - 05:00 م",
      "الأحد": "09:00 ص - 05:00 م",
      "الإثنين": "09:00 ص - 05:00 م",
      "الثلاثاء": "09:00 ص - 05:00 م",
      "الأربعاء": "09:00 ص - 05:00 م",
      "الخميس": "09:00 ص - 02:00 م",
      "الجمعة": "مغلق"
    },
    image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop",
    clinic_photos: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop"
    ],
    created_at: new Date().toISOString(),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const doctor = await getDoctor(resolvedParams.id);
  return {
    title: `د. ${doctor.name} — ${doctor.city} | أسناني`,
    description: `احجز موعد مع د. ${doctor.name}، طبيب ${doctor.specialty.join('، ')} في ${doctor.city}`,
    openGraph: { images: doctor.image_url ? [doctor.image_url] : [] }
  };
}

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const doctor = await getDoctor(resolvedParams.id);

  return (
    <main className="bg-slate-50 min-h-screen relative font-sans selection:bg-primary/20 selection:text-primary">
      {/* Decorative Header Background */}
      <div className="h-[300px] md:h-[400px] w-full bg-slate-900 relative overflow-hidden">
        {/* Abstract shapes & gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900 to-secondary/80" />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        
        {/* Back Button */}
        <div className="absolute top-8 right-4 md:right-8 z-50">
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>

      {/* Main Content Rendered Client-side for Map/Distance functionality */}
      <DoctorProfileClient doctor={doctor} />
    </main>
  );
}

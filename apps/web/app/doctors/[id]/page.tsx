import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Doctor } from "@/lib/types";
import DoctorProfileClient from "./DoctorProfileClient";
import { supabase, supabaseAdmin } from "@/lib/supabase";

async function getDoctor(id: string): Promise<Doctor | null> {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("id", id)
    .eq("verified", true)
    .single();

  if (error || !data) {
    return null;
  }
  return data as Doctor;
}

async function canBookOnline(doctorId: string) {
  const { data } = await supabaseAdmin
    .from("doctor_accounts")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("is_active", true)
    .maybeSingle();
  return Boolean(data);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const doctor = await getDoctor(resolvedParams.id);
  if (!doctor) {
    return { title: "طبيب غير موجود | ملامح" };
  }
  const doctorName = doctor.name.trim().startsWith("د.") ? doctor.name.trim() : `د. ${doctor.name}`;
  return {
    title: `${doctorName} — ${doctor.city} | ملامح`,
    description: `احجز موعد مع ${doctorName}، طبيب ${doctor.specialty.join('، ')} في ${doctor.city}`,
    openGraph: { images: doctor.image_url ? [doctor.image_url] : [] }
  };
}

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const doctor = await getDoctor(resolvedParams.id);
  if (!doctor) notFound();
  const canBookOnWebsite = await canBookOnline(resolvedParams.id);

  return (
    <main className="animate-fade-in bg-transparent min-h-screen relative font-sans selection:bg-primary/20 selection:text-primary pb-24">
      <div className="section-shell pt-4">
      <div className="page-hero-dark relative h-[280px] md:h-[340px] w-full overflow-hidden">
        {/* Abstract shapes & gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900 to-secondary/80" />
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        
        {/* Back Button */}
        <div className="absolute top-6 right-4 md:right-6 z-50">
          <Link href="/" className="btn-malama-ghost px-4 py-2 text-xs sm:text-sm">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
      </div>

      <DoctorProfileClient doctor={doctor} canBookOnWebsite={canBookOnWebsite} />
    </main>
  );
}

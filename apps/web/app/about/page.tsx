"use client";

import { Sparkles, ShieldCheck, Heart, Award, Users } from "lucide-react";
import Link from "next/link";
import PageShell, { ContentPanel, FeatureTile } from "@/components/ui/PageShell";

export default function AboutUs() {
  return (
    <PageShell
      badge="قصة ورؤية ملامح"
      badgeIcon={Sparkles}
      title="عن منصة ملامح.ps"
      description="أول دليل صحي تجميلي متكامل لصحة وجمال الوجه في دولة فلسطين."
      useBackButton
    >
      <ContentPanel>
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">رؤيتنا ورسالتنا الجوهرية</h2>
          <p className="text-sm font-medium leading-relaxed text-slate-500 md:text-base">
            تأسست منصة <strong>ملامح.ps</strong> لتكون المرجع الأول لصحة وجمال الوجه في فلسطين — سهولة، سرعة، وثقة مبنية على تقييمات حقيقية.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          <FeatureTile icon={ShieldCheck} title="دقة وموثوقية" tone="primary">
            جميع بيانات العيادات والأطباء يتم التحقق منها قبل التفعيل.
          </FeatureTile>
          <FeatureTile icon={Heart} title="سهولة للمريض" tone="emerald">
            خرائط واضحة وتوجيه جغرافي للوصول الفوري للعيادة.
          </FeatureTile>
          <FeatureTile icon={Award} title="محتوى موثوق" tone="amber">
            مجلة طبية، عروض، وحجوزات موثوقة لرفع الوعي الصحي.
          </FeatureTile>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            <h3 className="text-xl font-black text-slate-800">نهدف لخدمة قطاع الصحة والتجميل الفلسطيني</h3>
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-500">
            تضم منصة ملامح أطباء من شتى التخصصات في كافة المحافظات الفلسطينية — رام الله، نابلس، الخليل، جنين، بيت لحم، غزة، وغيرها.
          </p>
          <Link href="/trust" className="btn-malama inline-flex px-5 py-3 text-sm">
            كيف نختار الأطباء؟
          </Link>
        </div>
      </ContentPanel>
    </PageShell>
  );
}

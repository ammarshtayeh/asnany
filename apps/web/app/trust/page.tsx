"use client";

import Link from "next/link";
import { BadgeCheck, ClipboardCheck, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import PageShell, { ContentPanel, FeatureTile } from "@/components/ui/PageShell";

export default function TrustPage() {
  return (
    <PageShell
      badge="ثقة وشفافية"
      badgeIcon={ShieldCheck}
      title="كيف نختار الأطباء على ملامح؟"
      description="منهجية واضحة قبل ظهور أي عيادة في الدليل — عشان تاخد قرارك وأنت مطمئن."
      useBackButton
    >
      <ContentPanel>
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">موثوقية قبل الظهور</h2>
          <p className="text-sm font-medium leading-relaxed text-slate-500 md:text-base">
            ملامح مش مجرد قائمة أسماء. كل مزود خدمة يمر بخطوات تحقق قبل التفعيل العلني في الدليل.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureTile icon={ClipboardCheck} title="مراجعة البيانات" tone="primary">
            نراجع الاسم، التخصص، المدينة، العنوان، ووسائل التواصل قبل النشر.
          </FeatureTile>
          <FeatureTile icon={BadgeCheck} title="شارة التوثيق" tone="emerald">
            الأطباء الموثّقون يظهرون بشارة واضحة بعد اكتمال التحقق.
          </FeatureTile>
          <FeatureTile icon={MapPin} title="موقع واضح" tone="indigo">
            نخلي العنوان والخريطة متاحة عشان توصل بسهولة للعيادة.
          </FeatureTile>
          <FeatureTile icon={Users} title="تجربة المريض أولاً" tone="primary">
            الحجز والتواصل مصممين ليكونوا بسيطين وبدون تعقيد.
          </FeatureTile>
          <FeatureTile icon={ShieldCheck} title="خصوصية" tone="emerald">
            بياناتك للحجز تُستخدم لتأكيد الموعد مع العيادة وفق سياسة الخصوصية.
          </FeatureTile>
          <FeatureTile icon={Sparkles} title="تحديث مستمر" tone="indigo">
            نحدّث العروض والمعلومات باستمرار لتحسين جودة الدليل.
          </FeatureTile>
        </div>

        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-8">
          <Link href="/doctors/search" className="btn-malama px-6 py-3 text-sm">
            ابحث عن طبيب
          </Link>
          <Link href="/privacy" className="btn-malama-outline px-6 py-3 text-sm">
            سياسة الخصوصية
          </Link>
          <Link href="/join" className="btn-malama-outline px-6 py-3 text-sm">
            انضم كطبيب
          </Link>
        </div>
      </ContentPanel>
    </PageShell>
  );
}

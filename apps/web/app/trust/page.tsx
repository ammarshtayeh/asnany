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
      description="نشرح بصراحة ماذا يعني التوثيق اليوم — وما الذي ما زلنا نبنيه لتقوية الثقة."
      useBackButton
    >
      <ContentPanel>
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">موثوقية عملية… بصراحة</h2>
          <p className="text-sm font-medium leading-relaxed text-slate-500 md:text-base">
            شارة «موثّق» تعني أن الإدارة راجعت بيانات العيادة الأساسية وفعّلت ظهورها في الدليل.
            لا تعني حالياً تحققاً حكومياً آلياً من الرخصة أو النقابة — ونعمل على تقوية هذه الطبقة تدريجياً.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureTile icon={ClipboardCheck} title="مراجعة البيانات" tone="primary">
            نراجع الاسم، التخصص، المدينة، العنوان، ووسائل التواصل قبل النشر العلني.
          </FeatureTile>
          <FeatureTile icon={BadgeCheck} title="شارة التوثيق" tone="emerald">
            تظهر بعد موافقة الإدارة. التقييم يظهر فقط عند وجود مراجعات حقيقية معتمدة.
          </FeatureTile>
          <FeatureTile icon={MapPin} title="موقع واضح" tone="indigo">
            نخلي العنوان والخريطة متاحة عشان توصل بسهولة للعيادة.
          </FeatureTile>
          <FeatureTile icon={Users} title="طلب حجز للمراجعة" tone="primary">
            الحجز الإلكتروني طلب يراجعه الطبيب — مش تأكيد فوري إلا بعد رد العيادة.
          </FeatureTile>
          <FeatureTile icon={ShieldCheck} title="خصوصية أفضل" tone="emerald">
            متابعة الحجوزات تتم برقم الهاتف + رمز حجز، لتقليل اطلاع الغير على مواعيدك.
          </FeatureTile>
          <FeatureTile icon={Sparkles} title="تحسين مستمر" tone="indigo">
            نضيف لاحقاً تحقق أقوى للمستندات وOTP واتساب وجدول مواعيد أدق من العيادة.
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

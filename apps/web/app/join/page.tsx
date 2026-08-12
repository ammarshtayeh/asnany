"use client";

import Link from "next/link";
import { MessageSquare, FileText, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";
import PageShell, { PromoBanner } from "@/components/ui/PageShell";
import { SITE_SUPPORT_WHATSAPP } from "@/lib/site-contact";

export default function JoinAsDoctor() {
  const adminWhatsapp = SITE_SUPPORT_WHATSAPP;

  return (
    <PageShell
      badge="بوابة الأطباء الشركاء"
      badgeIcon={Sparkles}
      title="انضم كطبيب أو أخصائي شريك في منصة ملامح"
      description="سجّل عيادتك خلال دقائق: تخصص، مدينة، واتساب، وصور — ثم تراجع الإدارة وتفعّلك."
    >
      <PromoBanner eyebrow="عرض الأطباء الأوائل" title="سجّل الآن واحصل على أولوية ظهور + مزايا حصرية">
        <p className="mt-2 text-sm font-semibold text-slate-600">موعد واحد جديد يغطي اشتراكك السنوي — ابدأ من $100/سنة</p>
      </PromoBanner>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="bento-card shine-border flex flex-col justify-between p-8">
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">نموذج التسجيل الإلكتروني</h2>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              سجّل عيادتك بنفسك عبر الاستمارة الإلكترونية مع رفع صور العيادة وتحديد موقعها على الخريطة.
            </p>
            <ul className="space-y-2.5 pt-2 text-sm font-bold text-slate-600">
              {["رفع صور العيادة والأجهزة", "تحديد الموقع الجغرافي (GPS) اختياري", "مراجعة الإدارة والتفعيل السريع"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 pt-8">
            <Link href="/subscriptions" className="btn-malama-outline block w-full py-3 text-center text-emerald-700">
              عرض باقات الاشتراك والأسعار
            </Link>
            <Link href="/doctors/register" className="btn-malama block w-full justify-center py-3.5">
              تعبئة استمارة التسجيل الإلكترونية
            </Link>
          </div>
        </div>

        <div className="bento-card shine-border flex flex-col justify-between p-8">
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-500">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">تواصل مباشر عبر واتساب</h2>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              تحدث مع مسؤول البوابة وسنقوم بإنشاء وتفعيل حساب عيادتك فوراً.
            </p>
            <ul className="space-y-2.5 pt-2 text-sm font-bold text-slate-600">
              {["محادثة فورية مع الدعم", "مساعدة في تجهيز الصور والملفات", "إجابة استفسارات التسويق"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-8">
            <a
              href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent("مرحباً ملامح، أنا طبيب/أخصائي وأرغب في الانضمام وإعلان عيادتي على منصتكم.")}`}
              target="_blank"
              rel="noreferrer"
              className="btn-malama flex w-full justify-center py-3.5"
            >
              <MessageSquare className="h-5 w-5" />
              تواصل مع الإدارة عبر الواتساب
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm font-bold text-amber-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <span className="block text-amber-900">ملاحظة هامة للأطباء:</span>
          <span>بمجرد تقديم طلبك، يقوم مسؤول البوابة بمراجعة البيانات قبل تفعيل عيادتك على الدليل العام.</span>
        </div>
      </div>
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import { Sparkles, Scale, ShieldAlert, HeartHandshake } from "lucide-react";
import PageShell, { ContentPanel } from "@/components/ui/PageShell";

const CLAUSES = [
  {
    title: "1. طبيعة الخدمات ومسؤوليتنا",
    body: "ملامح.ps دليل إعلامي يربط المرضى بالعيادات. لا نقدم استشارات طبية ولا نتحمل مسؤولية العلاجات داخل العيادات.",
  },
  {
    title: "2. شروط تسجيل الأطباء",
    body: "يلتزم الطبيب بمعلومات حقيقية ومحدّثة. تحتفظ الإدارة بحق تعليق أي حساب يقدّم معلومات مضللة.",
  },
  {
    title: "3. سياسة التقييمات",
    body: "نراجع التقييمات لمنع الإساءة والمراجعات الكاذبة، مع حق إخفاء أي تعليق يخالف الآداب.",
  },
  {
    title: "4. الخصوصية وحماية البيانات",
    body: "نحافظ على سرية البيانات ولن نبيعها لأطراف خارجية.",
  },
];

export default function TermsAndConditions() {
  return (
    <PageShell
      badge="الضوابط والاتفاقية القانونية"
      badgeIcon={Sparkles}
      title="الشروط والأحكام"
      description="يرجى قراءة شروط استخدام ملامح.ps لضمان تجربة آمنة للجميع."
      useBackButton
    >
      <ContentPanel>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Scale className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-black text-slate-900">بنود الاستخدام العام</h2>
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-600">
          دخولك للموقع أو التطبيق يعني موافقتك على هذه الاتفاقية. راجع أيضاً{" "}
          <Link href="/privacy" className="font-bold text-primary hover:underline">
            سياسة الخصوصية
          </Link>
          .
        </p>

        <div className="space-y-5">
          {CLAUSES.map((clause) => (
            <div key={clause.title} className="bento-card p-5">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-800">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {clause.title}
              </h3>
              <p className="mt-2 pr-4 text-sm font-medium leading-relaxed text-slate-500">{clause.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-400 md:flex-row">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" /> آخر تحديث: مايو 2026
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4" /> ملامح.ps — معاً لصحة فلسطين
          </span>
        </div>
      </ContentPanel>
    </PageShell>
  );
}

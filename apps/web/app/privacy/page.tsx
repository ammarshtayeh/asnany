"use client";

import { ShieldCheck, Sparkles, Lock, UserCheck, Database, HeartHandshake } from "lucide-react";
import PageShell, { ContentPanel } from "@/components/ui/PageShell";

export default function PrivacyPolicyPage() {
  return (
    <PageShell
      badge="سياسة الخصوصية وحماية البيانات"
      badgeIcon={Sparkles}
      title="سياسة الخصوصية"
      description="نحافظ على بياناتك الطبية والشخصية ضمن تجربة واضحة وآمنة داخل الموقع والتطبيق."
    >
      <ContentPanel>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-black text-slate-900">Privacy Policy</h2>
        </div>

        <p className="text-sm font-medium leading-relaxed text-slate-600">
          منصة <strong>ملامح.ps</strong> هي مشروع <strong>عمار اشتية</strong>. تم إعداد المنصة لتسهيل الوصول لأطباء صحة وجمال الوجه في فلسطين مع الالتزام بحماية البيانات.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: Lock, color: "text-primary", title: "البيانات التي نجمعها", body: "الاسم، الهاتف، الهوية، العنوان، بيانات الحجز، ومعلومات الطبيب/الأدمن." },
            { icon: UserCheck, color: "text-emerald-600", title: "كيف نستخدمها", body: "لإرسال طلبات الحجز، إدارة جدول الطبيب، تحسين البحث، وتسهيل التواصل." },
            { icon: Database, color: "text-primary", title: "حفظ البيانات", body: "تُحفظ في قاعدة بيانات المنصة وفق صلاحيات المريض والطبيب والأدمن." },
            { icon: HeartHandshake, color: "text-rose-500", title: "مشاركة البيانات", body: "لا نبيع بيانات المستخدمين. تُستخدم ضمن نطاق الخدمة فقط." },
          ].map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="bento-card p-5">
              <div className="mb-2 flex items-center gap-2 font-black text-slate-900">
                <Icon className={`h-5 w-5 ${color}`} />
                {title}
              </div>
              <p className="text-sm leading-7 text-slate-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-2 text-lg font-black text-slate-900">ملاحظات مهمة</h3>
          <ul className="space-y-2 text-sm leading-7 text-slate-600">
            <li>• قد نحدّث السياسة عند إضافة خدمات جديدة.</li>
            <li>• استخدامك للموقع أو التطبيق يعني موافقتك على هذه السياسة.</li>
            <li>• بيانات المواعيد تظهر للطبيب لإدارة الحجز فقط.</li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-400 md:flex-row">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> آخر تحديث: يونيو 2026
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4" /> ملامح.ps — عمار اشتية
          </span>
        </div>
      </ContentPanel>
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Lock, UserCheck, Database, HeartHandshake } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-slate-50 min-h-screen relative font-sans" dir="rtl">
      <div className="h-[280px] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-700 via-slate-900 to-emerald-700" />
        <div className="absolute top-8 right-8 z-50">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="relative z-10 px-4">
          <span className="bg-white/10 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> سياسة الخصوصية وحماية البيانات
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            نحافظ على بياناتك الطبية والشخصية ضمن تجربة واضحة وآمنة داخل الموقع والتطبيق.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 space-y-8 text-right">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <ShieldCheck className="w-8 h-8 text-sky-600" />
            <h2 className="text-2xl font-black text-slate-900">سياسة الخصوصية</h2>
          </div>

          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            منصة <strong>أسناني.ps</strong> هي فكرة ومشروع <strong>عمار اشتية</strong>، وجميع الحقوق محفوظة له. تم إعداد هذه المنصة لتسهيل الوصول إلى أطباء الأسنان والخدمات الطبية في فلسطين عبر الموقع والتطبيق، مع الالتزام بحماية بيانات المستخدمين واحترام خصوصيتهم.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900 font-black mb-2">
                <Lock className="w-5 h-5 text-sky-600" />
                البيانات التي نجمعها
              </div>
              <p className="text-sm text-slate-600 leading-7">
                الاسم، رقم الهاتف، رقم الهوية، العنوان، بيانات الحجز، والمعلومات التي يضيفها الطبيب أو الأدمن لإتمام الخدمة وتحسين التجربة.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900 font-black mb-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                كيف نستخدمها
              </div>
              <p className="text-sm text-slate-600 leading-7">
                تُستخدم البيانات لإرسال طلبات الحجز، إدارة جدول الطبيب، تحسين نتائج البحث، وتسهيل التواصل المباشر داخل المنصة.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900 font-black mb-2">
                <Database className="w-5 h-5 text-violet-600" />
                حفظ البيانات
              </div>
              <p className="text-sm text-slate-600 leading-7">
                تُحفظ البيانات داخل قاعدة البيانات الخاصة بالمنصة وفق الصلاحيات المخصصة لكل من المريض والطبيب والأدمن.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900 font-black mb-2">
                <HeartHandshake className="w-5 h-5 text-rose-500" />
                مشاركة البيانات
              </div>
              <p className="text-sm text-slate-600 leading-7">
                لا نبيع بيانات المستخدمين لأطراف خارجية. تُعرض بيانات الطبيب للمستخدمين ضمن نطاق الخدمة فقط، وتبقى المعلومات الحساسة ضمن الاستخدام التشغيلي للمنصة.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-black text-slate-900 mb-2">ملاحظات مهمة</h3>
            <ul className="space-y-2 text-sm text-slate-600 leading-7">
              <li>• قد نحدّث السياسة عند إضافة خدمات جديدة أو تحسينات تشغيلية.</li>
              <li>• استخدامك للموقع أو التطبيق يعني موافقتك على هذه السياسة.</li>
              <li>• أي بيانات علاجية أو مواعيد تظهر للطبيب بهدف إدارة الحجز فقط.</li>
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-300" /> آخر تحديث: يونيو 2026
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-slate-300" /> أسناني.ps - مشروع عمار اشتية
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

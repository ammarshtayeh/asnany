"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Scale, ShieldAlert, HeartHandshake } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <main className="bg-slate-50 min-h-screen relative font-sans" dir="rtl">
      {/* Premium Header */}
      <div className="h-[280px] w-full bg-slate-900 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900 to-secondary/80" />
        <div className="absolute top-8 right-8 z-50">
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="relative z-10 px-4">
          <span className="bg-white/10 border border-white/20 text-white text-xs font-black px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current animate-pulse" /> الضوابط والاتفاقية القانونية
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            الشروط والأحكام وسياسة الاستخدام
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium max-w-xl mx-auto">
            يرجى قراءة شروط وأحكام استخدام بوابة أسناني.ps لضمان تجربة آمنة ومميزة لجميع الأعضاء والزوار.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 space-y-8 text-right">
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Scale className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-black text-slate-900">مقدمة وبنود الاستخدام العام</h2>
          </div>

          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            مرحباً بكم في <strong>أسناني.ps</strong>. يمثل دخولك وتصفحك للموقع أو التطبيق موافقة تامة وغير مشروطة على الالتزام بكافة البنود والشروط الواردة في هذه الاتفاقية. إذا كنت لا توافق على أي بند منها، يرجى التوقف عن استخدام الخدمات.
          </p>

          <div className="space-y-6 pt-4">
            
            {/* Clause 1 */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 1. طبيعة الخدمات ومسؤوليتنا
              </h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed pr-4">
                تعتبر منصة أسناني.ps بمثابة دليل جغرافي وإعلامي يسهل ربط المرضى بالعيادات والأطباء. نحن لا نقدم أي استشارات طبية ولا نتحمل أي مسؤولية قانونية أو مدنية ناتجة عن العلاجات الطبية أو القرارات المهنية المتخذة داخل العيادات المسجلة بالمنصة.
              </p>
            </div>

            {/* Clause 2 */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 2. شروط تسجيل وعضوية الأطباء
              </h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed pr-4">
                يلتزم كل طبيب يسجل عيادته في البوابة بتقديم معلومات حقيقية وصحيحة ومحدثة بالكامل (مثل الاسم، الإحداثيات، التخصص، ورقم الهاتف). تحتفظ الإدارة بالحق المطلق في تعليق أو حذف أي حساب طبي يتبين تقديمه لمعلومات مضللة أو غير مرخصة من نقابة أطباء الأسنان أو وزارة الصحة الفلسطينية.
              </p>
            </div>

            {/* Clause 3 */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 3. سياسة التقييمات والمراجعات
              </h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed pr-4">
                تتيح المنصة للمرضى إضافة تقييماتهم لخدمات العيادات. نلتزم بنشر المراجعات بشفافية تامة ومراجعتها لمنع أي إساءة، تجريح، أو مراجعات كاذبة تستهدف تشويه السمعة المهنية. تحتفظ الإدارة بحق إخفاء أي تعليق يخالف الآداب العامة.
              </p>
            </div>

            {/* Clause 4 */}
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> 4. الخصوصية وحماية البيانات
              </h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed pr-4">
                نحن نحترم خصوصية المرضى والأطباء ونتعهد بالحفاظ على سرية وتأمين كافة البيانات الشخصية والملفات الطبية والرسائل المستلمة، ولن نقوم بنشرها أو بيعها لأي جهات خارجية أو أطراف ثالثة لأي أغراض دعائية.
              </p>
            </div>

          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-slate-300" /> آخر تحديث للاتفاقية: مايو 2026</span>
            <span className="flex items-center gap-1.5"><HeartHandshake className="w-4 h-4 text-slate-300" /> أسناني.ps - معاً لابتسامة فلسطينية صحية وآمنة</span>
          </div>

        </div>
      </div>
    </main>
  );
}

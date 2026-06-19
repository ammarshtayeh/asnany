"use client";

import { Sparkles } from "lucide-react";

export default function TransformationsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-black mb-6">
          <Sparkles className="w-4 h-4" />
          قريباً
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">نتائج حقيقية من عياداتنا</h2>
        <p className="text-slate-500 font-semibold leading-8 max-w-2xl mx-auto">
          نعمل مع العيادات المعتمدة لنشر صور قبل/بعد حقيقية بموافقة المرضى. هذا القسم سيُفعّل تدريجياً بعد
          مراجعة المحتوى من الإدارة.
        </p>
      </div>
    </section>
  );
}

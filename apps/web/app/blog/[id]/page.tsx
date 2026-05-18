"use client";

import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import { Calendar, Clock, UserCircle2, ArrowLeft, HeartPulse, Sparkles, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getArticleById } from "@/lib/data";

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getArticleById(id).then((data) => {
        setArticle(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-center">
        <h3 className="text-2xl font-black text-slate-800 mb-2">المقال غير موجود</h3>
        <p className="text-slate-500 mb-6 font-medium">عذراً، لم نتمكن من العثور على المقال المطلوب.</p>
        <Link href="/blog" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-full transition-all">
          العودة للمدونة
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans pb-24">
      {/* Header Image */}
      <div className="relative h-[40vh] md:h-[60vh] w-full mt-20">
        <Image src={article.image_url} alt={article.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 right-4 md:right-8 z-20">
          <Link href="/blog" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg">
            <ChevronRight className="w-4 h-4" />
            العودة للمدونة
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 max-w-4xl mx-auto right-0">
          <div className="inline-block bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            {article.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-bold">
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-emerald-400" />
              بواسطة: {article.doctor_name}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              {article.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              {article.read_time}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1">
          <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose">
            <p className="text-xl font-medium text-slate-500 mb-8 leading-relaxed">
              {article.excerpt}
            </p>
            {article.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Sidebar / Embedded CTA */}
        <div className="w-full md:w-[350px]">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 sticky top-28">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 text-primary">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">هل تعاني من هذه المشكلة؟</h3>
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
              احجز موعداً للفحص المباشر مع {article.doctor_name} كاتب هذا المقال.
            </p>
            <Link 
              href={`/doctors/${article.doctor_id}`}
              className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-primary text-white py-4 rounded-xl font-black transition-all shadow-lg hover:shadow-primary/30"
            >
              <Calendar className="w-5 h-5" />
              احجز موعدك الآن
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

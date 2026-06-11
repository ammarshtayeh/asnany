"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft, BookOpen, Calendar, Clock, UserCircle2 } from "lucide-react";
import { Article } from "@/lib/types";
import { getArticles } from "@/lib/data";

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles().then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-[#f7fafc] pb-24 pt-24" dir="rtl">
      <section className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 text-right md:flex-row md:items-end md:justify-between">
          <div>
            {/* Back button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 mb-5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              الرئيسية
            </Link>
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
              <BookOpen className="h-4 w-4" />
              مجلة ملامح
            </span>
            <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              محتوى طبي واضح، بلا تعقيد.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">
              مقالات قصيرة ومفيدة تساعد المرضى على فهم الخيارات قبل زيارة الطبيب.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-black text-slate-950">{articles.length || 0}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">مقال وخبر</p>
          </div>
        </div>

        {loading ? (
          <div className="h-[420px] animate-pulse rounded-2xl bg-white" />
        ) : lead ? (
          <Link href={`/blog/${lead.id}`} className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[320px] overflow-hidden bg-slate-100">
              <Image src={lead.image_url} alt={lead.title} fill priority className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute right-5 top-5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-black text-emerald-700 backdrop-blur">
                {lead.category || "توعية"}
              </span>
            </div>
            <div className="flex flex-col justify-center p-7 text-right md:p-10">
              <div className="mb-4 flex flex-wrap gap-3 text-xs font-bold text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {lead.date || "اليوم"}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {lead.read_time || "قراءة سريعة"}</span>
              </div>
              <h2 className="text-3xl font-black leading-10 text-slate-950 group-hover:text-emerald-600">{lead.title}</h2>
              <p className="mt-4 line-clamp-4 text-base font-semibold leading-8 text-slate-500">{lead.excerpt || lead.content}</p>
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="inline-flex items-center gap-2 text-sm font-black text-slate-700">
                  <UserCircle2 className="h-5 w-5 text-emerald-600" />
                  {lead.doctor_name || "ملامح"}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-emerald-600">
                  <ArrowLeft className="h-5 w-5" />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <Empty title="لا توجد مقالات حالياً" />
        )}
      </section>

      <section className="mx-auto mt-8 grid max-w-[1400px] gap-5 px-4 md:grid-cols-2 xl:grid-cols-3 lg:px-8">
        {rest.map((article) => (
          <Link key={article.id} href={`/blog/${article.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
            <div className="relative h-52 overflow-hidden bg-slate-100">
              <Image src={article.image_url} alt={article.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="p-5 text-right">
              <span className="mb-3 inline-flex rounded-lg bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{article.category || "توعية"}</span>
              <h3 className="line-clamp-2 text-xl font-black leading-8 text-slate-950 group-hover:text-emerald-600">{article.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm font-semibold leading-7 text-slate-500">{article.excerpt || article.content}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
                <span>{article.read_time || "قراءة سريعة"}</span>
                <span>{article.doctor_name || "ملامح"}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="mt-12 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl transition-all hover:scale-[1.02]"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}

function Empty({ title }: { title: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xl font-black text-slate-800 shadow-sm">{title}</div>;
}

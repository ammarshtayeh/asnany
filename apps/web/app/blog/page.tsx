"use client";

import { useState, useEffect } from "react";
import { Article } from "@/lib/types";
import { BookOpen, Calendar, Clock, UserCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/connected.png')] opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold">التوعية والصحة السنية</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            المدونة <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">الطبية</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            مقالات ونصائح طبية موثوقة مكتوبة حصرياً من نخبة أطباء منصة أسناني.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.id}`} className="group block">
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/40 border border-slate-100 transition-all duration-500 hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-2 h-full flex flex-col">
                {/* Image */}
                <div className="h-56 relative overflow-hidden bg-slate-100">
                  <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-white">
                    {article.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {article.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {article.read_time}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-3 leading-relaxed flex-1">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                      <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600">
                        <UserCircle2 className="w-4 h-4" />
                      </div>
                      {article.doctor_name}
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>
    </main>
  );
}

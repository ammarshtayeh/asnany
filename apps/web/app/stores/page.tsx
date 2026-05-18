"use client";

import { Store } from "@/lib/types";
import { Package, Globe, Phone, Building2, Search, ArrowLeft } from "lucide-react";
import Image from "next/image";

const MOCK_STORES: Store[] = [
  {
    id: "st1",
    name: "فلسطين للمعدات الطبية",
    category: "أجهزة ومعدات",
    city: "رام الله",
    description: "أكبر مورد لأجهزة الأسنان وكراسي العيادات ومعدات التعقيم في فلسطين. وكلاء حصريون لأكبر العلامات التجارية.",
    logo_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=200&auto=format&fit=crop",
    phone: "022987654",
    whatsapp: "+970599123456",
    website: "https://example.com"
  },
  {
    id: "st2",
    name: "دينتال سبلاي",
    category: "مواد استهلاكية",
    city: "نابلس",
    description: "متخصصون في توريد المواد الاستهلاكية اليومية لعيادات الأسنان (مواد حشو، تخدير، أدوات استعمال مرة واحدة).",
    logo_url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=200&auto=format&fit=crop",
    phone: "092345678",
    whatsapp: "+970599654321",
  }
];

export default function StoresPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
            <Package className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold">لأطباء الأسنان والعيادات (B2B)</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            دليل الموردين و <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">الشركات الطبية</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
            تواصل مباشرة مع كبرى شركات الأجهزة والمواد السنية في فلسطين.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 flex gap-2">
            <input 
              type="text" 
              placeholder="ابحث عن شركة، منتج، أو وكيل..." 
              className="flex-1 bg-white/10 border-none outline-none text-white placeholder:text-white/50 px-4 rounded-xl focus:bg-white/20 transition-colors"
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2">
              <Search className="w-5 h-5" />
              بحث
            </button>
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid md:grid-cols-2 gap-6">
          {MOCK_STORES.map((store) => (
            <div key={store.id} className="bg-white rounded-3xl p-6 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-6 group hover:border-blue-200 transition-colors">
              {/* Logo */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200">
                <Image src={store.logo_url} alt={store.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block border border-blue-100">
                      {store.category}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{store.name}</h3>
                  </div>
                </div>
                
                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                  {store.description}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <a href={`https://wa.me/${store.whatsapp.replace(/\+/g, "")}`} className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/></svg>
                    واتساب
                  </a>
                  
                  {store.website && (
                    <a href={store.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      <Globe className="w-4 h-4" />
                      الموقع الإلكتروني
                    </a>
                  )}

                  <div className="flex-1 flex justify-end">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 bg-slate-50 hover:bg-blue-50 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

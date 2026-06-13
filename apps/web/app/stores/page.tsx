"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store } from "@pal-dental/shared";
import { Package, Globe, Phone, Building2, Search, ArrowRight, Plus, X, CheckCircle, Sparkles } from "lucide-react";
import Image from "next/image";
import { getStores, createStore } from "@/lib/data";

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: "",
    specialization: "أجهزة ومستلزمات طبية",
    city: "رام الله",
    description: "",
    logoUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=200&auto=format&fit=crop",
    phone: "",
    whatsapp: "",
    website: "",
  });

  useEffect(() => {
    getStores().then((data) => {
      setStores(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredStores = stores.filter((store) => {
    const query = searchQuery.toLowerCase();
    const name = store.storeName || store.store_name || "";
    const description = store.description || "";
    const city = store.city || "";
    const specialization = store.specialization || "";

    return (
      name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query) ||
      specialization.toLowerCase().includes(query)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createStore(formData);
      setSubmitSuccess(true);
      
      // Refresh list
      const updatedStores = await getStores();
      setStores(updatedStores);

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({
          storeName: "",
          specialization: "أجهزة ومستلزمات طبية",
          city: "رام الله",
          description: "",
          logoUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=200&auto=format&fit=crop",
          phone: "",
          whatsapp: "",
          website: "",
        });
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-900 pt-28 pb-36 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Back button */}
          <div className="flex justify-start mb-6" dir="rtl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
            >
              <ArrowRight className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
            <Package className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold">للأطباء والعيادات والمراكز الطبية والتجميلية (B2B)</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            دليل الموردين و <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">الشركات الطبية</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            تواصل مباشرة مع كبرى شركات الأجهزة والمستلزمات الطبية، التجميلية، والبصريات في فلسطين، واحصل على أفضل عروض التوريد لعيادتك أو مركزك.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
            {/* Search Box */}
            <div className="w-full bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 flex gap-2">
              <input 
                type="text" 
                placeholder="ابحث عن شركة، منتج، أو مدينة..." 
                value={searchQuery}
                onChange={handleSearch}
                className="flex-1 bg-white/10 border-none outline-none text-white placeholder:text-white/50 px-4 py-3 rounded-xl focus:bg-white/20 transition-colors text-right"
              />
              <div className="bg-blue-500 text-white p-3 rounded-xl">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* B2B Register Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" />
              سجل شركتك الطبية
            </button>
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد شركات مطابقة للبحث</h3>
            <p className="text-slate-500">جرب البحث بكلمات أخرى أو تصفح الأقسام العامة.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredStores.map((store) => {
              const name = store.storeName || store.store_name || "";
              const logo = store.logoUrl || store.logo_url || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=200&auto=format&fit=crop";
              const whatsapp = store.whatsapp || "";
              const website = store.website || "";

              return (
                <div 
                  key={store.id} 
                  className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-6 group hover:border-blue-200 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Logo */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-100">
                    <Image 
                      src={logo} 
                      alt={name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between text-right">
                    <div>
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          {store.specialization}
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {store.city}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                        {name}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">
                        {store.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-end">
                      {/* Whatsapp Button */}
                      {whatsapp && (
                        <a 
                          href={`https://wa.me/${whatsapp.replace(/\+/g, "").replace(/\s/g, "")}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824z"/>
                          </svg>
                          واتساب المبيعات
                        </a>
                      )}
                      
                      {website && (
                        <a 
                          href={website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        >
                          <Globe className="w-4 h-4" />
                          الموقع الإلكتروني
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">تم تقديم طلبك بنجاح!</h3>
                <p className="text-slate-500 font-medium">سيتواصل معك فريق الدعم للتحقق وتفعيل الشركة في الدليل الطبي B2B.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-3 mb-2 justify-end">
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-slate-950">سجل شركتك الطبية</h3>
                    <p className="text-slate-500 text-sm font-medium">ابدأ بالإعلان وتسويق موادك ومعداتك للأطباء في فلسطين.</p>
                  </div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  {/* Company Name */}
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">اسم الشركة *</label>
                    <input 
                      type="text" 
                      name="storeName" 
                      required 
                      value={formData.storeName} 
                      onChange={handleInputChange}
                      placeholder="مثال: شركة القدس للمستلزمات الطبية" 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-right font-medium"
                    />
                  </div>

                  {/* Category & City */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">التصنيف *</label>
                      <select 
                        name="specialization" 
                        value={formData.specialization} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      >
                        <option value="أجهزة ومستلزمات طبية">أجهزة ومستلزمات طبية</option>
                        <option value="أجهزة ليزر وتجميل">أجهزة ليزر وتجميل</option>
                        <option value="أجهزة بصرية وعيون">أجهزة بصرية وعيون</option>
                        <option value="أدوات ومواد استهلاكية">أدوات ومواد استهلاكية</option>
                        <option value="أثاث عيادات ومراكز">أثاث عيادات ومراكز</option>
                        <option value="أنظمة وبرمجيات طبية">أنظمة وبرمجيات طبية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">المدينة *</label>
                      <select 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold"
                      >
                        <option value="رام الله">رام الله</option>
                        <option value="نابلس">نابلس</option>
                        <option value="الخليل">الخليل</option>
                        <option value="القدس">القدس</option>
                        <option value="بيت لحم">بيت لحم</option>
                        <option value="جنين">جنين</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone & Whatsapp */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">رقم الهاتف *</label>
                      <input 
                        type="text" 
                        name="phone" 
                        required 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        placeholder="022987654" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">رقم الواتساب *</label>
                      <input 
                        type="text" 
                        name="whatsapp" 
                        required 
                        value={formData.whatsapp} 
                        onChange={handleInputChange}
                        placeholder="+970599123456" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-left"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">الموقع الإلكتروني (اختياري)</label>
                    <input 
                      type="url" 
                      name="website" 
                      value={formData.website} 
                      onChange={handleInputChange}
                      placeholder="https://example.com" 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-left"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">وصف الشركة ونشاطها *</label>
                    <textarea 
                      name="description" 
                      required 
                      rows={3}
                      value={formData.description} 
                      onChange={handleInputChange}
                      placeholder="صف نشاط شركتك، الماركات التي تمثلها، والخدمات التي تقدمها للعيادات..." 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-right font-medium resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "تسجيل وإرسال الطلب"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

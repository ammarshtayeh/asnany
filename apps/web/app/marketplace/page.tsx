"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Briefcase, PlusCircle, Star, PhoneCall, AlertCircle, Search, BadgePercent, X, CheckCircle, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { MarketplaceAd } from "@/lib/types";
import { getMarketplaceAds, createMarketplaceAd } from "@/lib/data";

export default function MarketplacePage() {
  const [ads, setAds] = useState<MarketplaceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "equipment" | "job">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal States
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "equipment" as "equipment" | "job",
    category: "كراسي أسنان",
    price: "",
    salary: "",
    publisher: "",
    city: "رام الله",
    description: "",
    image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop",
    phone: "",
  });

  useEffect(() => {
    getMarketplaceAds().then((data) => {
      setAds(data);
      setLoading(false);
    });
  }, []);

  const filteredAds = ads.filter(ad => {
    const matchesTab = activeTab === "all" || ad.type === activeTab;
    const matchesSearch = 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ad.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ad.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        category: formData.category,
        publisher: formData.publisher,
        city: formData.city,
        description: formData.description,
        phone: formData.phone,
        image_url: formData.type === "equipment" ? formData.image_url : undefined,
        price: formData.type === "equipment" ? (formData.price ? `${formData.price} شيكل` : undefined) : undefined,
        salary: formData.type === "job" ? (formData.salary ? formData.salary : "حسب الاتفاق") : undefined,
      };

      await createMarketplaceAd(payload);
      setSubmitSuccess(true);

      // Refresh listings
      const updatedAds = await getMarketplaceAds();
      setAds(updatedAds);

      setTimeout(() => {
        setShowPublishForm(false);
        setSubmitSuccess(false);
        setFormData({
          title: "",
          type: "equipment",
          category: "كراسي أسنان",
          price: "",
          salary: "",
          publisher: "",
          city: "رام الله",
          description: "",
          image_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=400&auto=format&fit=crop",
          phone: "",
        });
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl text-right">
            <span className="bg-white/10 text-yellow-300 font-black px-4 py-1.5 rounded-full text-xs inline-block mb-4 border border-white/10">B2B سوق أطباء الأسنان</span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">سوق عيادات أسناني ومستلزماتها</h1>
            <p className="text-slate-200 text-base md:text-lg mb-8 leading-relaxed font-medium">
              الوجهة الفلسطينية الأولى لبيع وشراء أجهزة العيادات المستعملة والجديدة، وإعلانات الوظائف الطبية الشاغرة بلمسة واحدة.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowPublishForm(true)}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 hover:from-yellow-500 hover:to-amber-600 px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center gap-2 hover:scale-[1.02]"
              >
                <PlusCircle className="w-5 h-5 text-slate-950" /> أعلن عن جهازك أو وظيفتك فوراً
              </button>
              <button
                onClick={() => setShowPricingModal(true)}
                className="bg-white/10 text-white hover:bg-white/20 px-6 py-3.5 rounded-2xl font-black text-sm transition-all border border-white/20"
              >
                باقات التمويل والترويج ⭐️
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          {/* Custom Switch Tabs */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit self-start">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "all" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}
            >
              عرض الكل
            </button>
            <button
              onClick={() => setActiveTab("equipment")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "equipment" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}
            >
              <ShoppingCart className="w-4 h-4" /> معدات وأجهزة للبيع
            </button>
            <button
              onClick={() => setActiveTab("job")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "job" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Briefcase className="w-4 h-4" /> وظائف شاغرة
            </button>
          </div>

          {/* Search box */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو القسم..."
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm text-slate-800 text-right"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Ads Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className={`bg-white rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col p-6 shadow-sm ${
                  ad.is_featured 
                    ? "border-yellow-400 ring-2 ring-yellow-400/10 shadow-lg hover:shadow-xl shadow-yellow-100" 
                    : "border-slate-100 hover:border-primary/20 hover:shadow-md"
                }`}
              >
                {/* Featured Badge */}
                {ad.is_featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md border border-white/20 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current animate-pulse" /> إعلان ممول
                  </div>
                )}

                {/* Title & Category info */}
                <div className="mb-4">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg inline-block mb-2 ${
                    ad.type === "equipment" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {ad.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{ad.title}</h3>
                </div>

                {/* Image if equipment */}
                {ad.type === "equipment" && ad.image_url && (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-50">
                    <Image src={ad.image_url} alt={ad.title} fill className="object-cover" />
                  </div>
                )}

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                  {ad.description}
                </p>

                {/* Card Meta & Publisher info */}
                <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{ad.publisher}</h5>
                    <span className="text-xs text-slate-400 font-bold">{ad.city} • {ad.date || "الآن"}</span>
                  </div>
                  
                  {/* Financial highlight (price or salary) */}
                  <div className="text-left">
                    {ad.price ? (
                      <span className="text-primary font-black text-lg block">{ad.price}</span>
                    ) : (
                      <span className="text-emerald-600 font-black text-sm block">{ad.salary}</span>
                    )}
                  </div>
                </div>

                {/* CTA button to connect with seller/employer */}
                <a
                  href={`https://wa.me/${ad.phone.replace(/\+/g, "").replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 w-full bg-slate-900 hover:bg-primary text-white font-bold py-3.5 rounded-2xl transition-all flex justify-center items-center gap-2 hover:scale-[1.01]"
                >
                  <PhoneCall className="w-4.5 h-4.5" /> تواصل مع صاحب الإعلان
                </a>

              </div>
            ))}

            {filteredAds.length === 0 && (
              <div className="bg-white/60 p-16 rounded-[2.5rem] border border-white text-center flex flex-col items-center justify-center shadow-sm col-span-2">
                <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد إعلانات مطابقة</h3>
                <p className="text-slate-500 font-medium text-base">استخدم خيارات تصفية أخرى أو ابحث بكلمات مختلفة.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Dynamic Ad Publication Form Modal */}
      {showPublishForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPublishForm(false)}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">تم نشر إعلانك بنجاح!</h3>
                <p className="text-slate-500 font-medium">تمت إضافة إعلانك إلى سوق أسناني بنجاح وهو يظهر الآن للجميع.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">انشر إعلانك في سوق أسناني</h3>
                    <p className="text-slate-500 text-sm font-medium">أعلن عن أجهزتك الطبية أو ابحث عن كفاءات لعيادتك.</p>
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  {/* Title */}
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">عنوان الإعلان *</label>
                    <input 
                      type="text" 
                      name="title" 
                      required 
                      value={formData.title} 
                      onChange={handleInputChange}
                      placeholder="مثال: مطلوب جهاز أشعة بانوراما ديجيتال بحالة ممتازة" 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-right font-medium"
                    />
                  </div>

                  {/* Type and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">نوع الإعلان *</label>
                      <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-bold"
                      >
                        <option value="equipment">معدات وأجهزة للبيع</option>
                        <option value="job">وظائف شاغرة</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">القسم *</label>
                      {formData.type === "equipment" ? (
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-bold"
                        >
                          <option value="كراسي أسنان">كراسي أسنان</option>
                          <option value="أجهزة تعقيم">أجهزة تعقيم</option>
                          <option value="أشعة وتصوير">أشعة وتصوير</option>
                          <option value="أدوات يدوية">أدوات يدوية</option>
                        </select>
                      ) : (
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-bold"
                        >
                          <option value="أطباء أسنان">أطباء أسنان</option>
                          <option value="مساعدي أسنان">مساعدي أسنان</option>
                          <option value="إداريين وسكرتاريا">إداريين وسكرتاريا</option>
                          <option value="فنيي معمل">فنيي معمل</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Pricing or Salary */}
                  {formData.type === "equipment" ? (
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">السعر (شيكل) *</label>
                      <input 
                        type="text" 
                        name="price" 
                        required 
                        value={formData.price} 
                        onChange={handleInputChange}
                        placeholder="مثال: 12,000" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-medium text-left"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">الراتب المتوقع (اختياري)</label>
                      <input 
                        type="text" 
                        name="salary" 
                        value={formData.salary} 
                        onChange={handleInputChange}
                        placeholder="مثال: حسب الكفاءة والنسبة" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-medium text-right"
                      />
                    </div>
                  )}

                  {/* Publisher & City & Contact */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-slate-700 text-sm font-bold mb-2">الناشر *</label>
                      <input 
                        type="text" 
                        name="publisher" 
                        required 
                        value={formData.publisher} 
                        onChange={handleInputChange}
                        placeholder="العيادة أو اسمك الشخصي" 
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-right font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">المدينة *</label>
                      <select 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-bold"
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

                  {/* Contact Number */}
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">رقم التواصل (واتساب) *</label>
                    <input 
                      type="text" 
                      name="phone" 
                      required 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      placeholder="+970599123456" 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-medium text-left"
                    />
                  </div>

                  {/* Image link (Preset for Equipment) */}
                  {formData.type === "equipment" && (
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2">رابط صورة الجهاز *</label>
                      <input 
                        type="text" 
                        name="image_url" 
                        required 
                        value={formData.image_url} 
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-medium text-left text-xs"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">وصف تفصيلي للإعلان *</label>
                    <textarea 
                      name="description" 
                      required 
                      rows={3}
                      value={formData.description} 
                      onChange={handleInputChange}
                      placeholder="اذكر حالة الجهاز، الماركة، شروط العمل للوظيفة، ساعات العمل..." 
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-right font-medium resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "جاري النشر..." : "انشر إعلانك الآن مجاناً"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Promoted Placement Pricing Explainer Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-8 md:p-10 shadow-2xl relative overflow-hidden border border-slate-100 text-right animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-6 left-6 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl md:text-3xl font-black text-slate-950 mb-4 flex items-center gap-2 justify-start">
              <BadgePercent className="w-7 h-7 text-primary" /> أعلن معنا وحقق أهدافك
            </h3>
            <p className="text-slate-500 text-base leading-relaxed mb-6 font-medium">
              عيادات الأسنان والموردون الطبيون يبحثون عن هذه المستلزمات والوظائف يومياً. اختر الباقة المناسبة لإعلانك:
            </p>

            <div className="space-y-4 mb-8">
              {/* Basic Package */}
              <div className="border border-slate-200 p-5 rounded-2xl bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">إعلان عادي (Standard)</h4>
                  <p className="text-xs text-slate-400 font-bold mt-1">يظهر في القائمة مع الفلترة المعتادة لمدة 30 يوم.</p>
                </div>
                <span className="text-slate-900 font-black text-xl">50 شيكل</span>
              </div>

              {/* Promoted Package */}
              <div className="border-2 border-yellow-400 p-5 rounded-2xl bg-yellow-50/20 flex justify-between items-center relative">
                <span className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg">الأكثر مبيعاً</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">إعلان ممول مثبت (Featured) <Star className="w-4 h-4 text-yellow-500 fill-current" /></h4>
                  <p className="text-xs text-slate-400 font-bold mt-1">يظهر بأعلى النتائج بلون مميز وتاج ذهبي مع وصول مضاعف 5 مرات.</p>
                </div>
                <span className="text-slate-900 font-black text-xl">120 شيكل</span>
              </div>
            </div>

            <div className="bg-[#25D366]/5 border border-[#25D366]/20 p-5 rounded-2xl text-right mb-6" dir="rtl">
              <span className="text-[10px] font-black text-[#25D366] bg-[#25D366]/10 px-2.5 py-0.5 rounded-full inline-block mb-2">تواصل مباشر ومؤتمت</span>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                اضغط على زر التواصل بالأسفل لإرسال تفاصيل إعلانك (الصور، الوصف، المدينة) لفريق خدمة عملاء أسناني لنقوم بتفعيله لك خلال ساعة واحدة!
              </p>
            </div>

            <a
              href="https://wa.me/970599000000?text=أهلاً أسناني، أرغب في إضافة إعلان جديد على سوق أسناني الطبي"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-slate-900 hover:bg-primary text-white py-4 rounded-2xl font-black text-base transition-all text-center block shadow-lg"
            >
              تواصل معنا لتفعيل إعلانك الآن
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Link as LinkIcon, BarChart2, Eye, Calendar, Trash2, Power } from "lucide-react";
import { Advertisement } from "@pal-dental/shared";
import AdminImageUpload from "@/components/AdminImageUpload";

export default function AdminAds() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserType, setAdvertiserType] = useState<"doctor" | "store">("doctor");
  const [adType, setAdType] = useState<"featured" | "banner" | "sidebar">("banner");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/admin/ads/list");
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads);
      } else {
        const resPublic = await fetch("/api/advertisements");
        const dataPublic = await resPublic.json();
        setAds(dataPublic);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleToggleAdActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/ads/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      if (res.ok) {
        setAds(ads.map(ad => ad.id === id ? { ...ad, is_active: !currentStatus } : ad));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف إعلان المعلن "${name}" نهائياً؟`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/ads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAds(ads.filter(ad => ad.id !== id));
      } else {
        alert("فشل حذف الإعلان");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiserName || !imageUrl) {
      alert("يرجى ملء الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/ads/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_name: advertiserName,
          advertiser_type: advertiserType,
          ad_type: adType,
          image_url: imageUrl,
          link_url: linkUrl,
          end_date: endDate,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setAdvertiserName("");
        setImageUrl("");
        setLinkUrl("");
        setEndDate("");
        fetchAds();
      } else {
        const data = await res.json();
        alert(data.error || "فشل إضافة الإعلان");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" /> إدارة الإعلانات الممولة
          </h1>
          <p className="text-slate-500 mt-1">إطلاق وإدارة البانرات والشرائح الإعلانية للعيادات والمراكز</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> إعلان جديد
        </button>
      </div>

      {/* Ads Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400 font-medium">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-slate-300 animate-pulse" />
          <p className="text-lg font-bold text-slate-700 mb-2">لا توجد إعلانات ممولة حالياً</p>
          <p className="text-sm">اضغط على زر "إعلان جديد" بالأعلى لبدء ترويج العيادات والمراكز الطبية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => {
            const adName = ad.advertiser_name || ad.advertiserName || "إعلان مميز";
            const adImg = ad.image_url || ad.imageUrl || "";
            const adTypeVal = ad.ad_type || ad.adType || "banner";
            const adLink = ad.link_url || ad.linkUrl || "";
            const isActive = ad.is_active !== undefined ? ad.is_active : ad.isActive !== undefined ? ad.isActive : true;

            return (
              <div key={ad.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
                <div className="h-44 relative bg-slate-100">
                  {adImg && <img src={adImg} alt={adName} className="w-full h-full object-cover" />}
                  <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-bold">
                    {adTypeVal === "banner" ? "بانر رئيسي" : adTypeVal === "featured" ? "سلايدر مميز" : "إعلان جانبي"}
                  </span>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-2">{adName}</h3>
                    <div className="space-y-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        تاريخ الانتهاء: <strong className="text-slate-700">{ad.end_date || "مستمر"}</strong>
                      </span>
                      {adLink && (
                        <a href={adLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                          <LinkIcon className="w-4 h-4" />
                          رابط الوجهة المستهدفة
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAdActive(ad.id, isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {isActive ? "نشط" : "معطل"}
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id, adName)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded border border-red-100 transition-colors"
                        title="حذف الإعلان"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-slate-700 font-black">
                      <BarChart2 className="w-4 h-4 text-slate-400" />
                      <span>{ad.clicks || 0}</span>
                      <span className="text-xs text-slate-400 font-medium">نقرة</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Ad Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bento-card max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">إنشاء إعلان ممول جديد</h2>

            <form onSubmit={handleAddAd} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">اسم المعلن / الطبيب *</label>
                <input
                  type="text"
                  required
                  value={advertiserName}
                  onChange={(e) => setAdvertiserName(e.target.value)}
                  placeholder="مثال: مركز النخبة لتجميل الأسنان"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">نوع الجهة المعلنة</label>
                <select
                  value={advertiserType}
                  onChange={(e) => setAdvertiserType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                >
                  <option value="doctor">طبيب / عيادة</option>
                  <option value="store">شركة / متجر تجهيزات</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">نوع الإعلان</label>
                <select
                  value={adType}
                  onChange={(e) => setAdType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                >
                  <option value="banner">بانر رئيسي عريض (Banner)</option>
                  <option value="featured">سلايدر مميز (Featured)</option>
                  <option value="sidebar">إعلان جانبي (Sidebar)</option>
                </select>
              </div>

              <AdminImageUpload
                label="صورة الإعلان *"
                value={imageUrl}
                folder="ads"
                required
                onChange={setImageUrl}
              />

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">رابط توجيه النقرة (الوجهة)</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://wa.me/... أو صفحة الطبيب"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">تاريخ انتهاء الحملة الإعلانية</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "جاري النشر..." : "إطلاق الحملة الإعلانية"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

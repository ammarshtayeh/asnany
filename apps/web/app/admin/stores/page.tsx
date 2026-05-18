"use client";

import { useState, useEffect } from "react";
import { Store as StoreIcon, CheckCircle, XCircle, Search, MapPin, Phone, MessageSquare, Plus, Trash2, Globe } from "lucide-react";
import { Store as B2BStore } from "@pal-dental/shared";

export default function AdminStores() {
  const [stores, setStores] = useState<B2BStore[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("رام الله");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [specialization, setSpecialization] = useState("تجهيزات ومواد طبية");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStores = async () => {
    try {
      const res = await fetch("/api/admin/stores/list");
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores);
      } else {
        const resPublic = await fetch("/api/stores");
        const dataPublic = await resPublic.json();
        setStores(dataPublic);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleToggleStoreActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/stores/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      if (res.ok) {
        setStores(stores.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStore = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد تماماً من حذف المتجر "${name}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/stores/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setStores(stores.filter(s => s.id !== id));
      } else {
        alert("فشل حذف المتجر");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !city) {
      alert("اسم المتجر والمدينة مطلوبان");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/stores/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          description,
          city,
          phone,
          whatsapp,
          website,
          logo_url: logoUrl,
          specialization,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setStoreName("");
        setDescription("");
        setPhone("");
        setWhatsapp("");
        setWebsite("");
        setLogoUrl("");
        fetchStores();
      } else {
        const data = await res.json();
        alert(data.error || "فشل إضافة المتجر");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStores = stores.filter(st => {
    const name = st.store_name || st.storeName || "";
    const cityVal = st.city || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cityVal.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <StoreIcon className="w-8 h-8 text-primary" /> إدارة المتاجر والشركات (B2B)
          </h1>
          <p className="text-slate-500 mt-1">مراجعة وتفعيل وإضافة مستودعات التجهيزات الطبية في المنصة الطبية</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> إضافة شركة/متجر جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="البحث باسم الشركة أو المدينة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right font-medium text-sm"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filteredStores.length === 0 ? (
          <p className="p-12 text-center text-slate-400 font-medium">لم يتم العثور على شركات طبية مسجلة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">الشركة والمجال</th>
                  <th className="px-6 py-4">المدينة والعنوان</th>
                  <th className="px-6 py-4">رقم الاتصال والويب</th>
                  <th className="px-6 py-4">تفعيل الظهور</th>
                  <th className="px-6 py-4 text-left pl-10">إجراءات إدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStores.map((st) => {
                  const sName = st.store_name || st.storeName || "شركة طبية";
                  const sLogo = st.logo_url || st.logoUrl || "";
                  const sSpec = st.specialization || "تجهيزات ومواد طبية";
                  const sWhatsapp = st.whatsapp || "";
                  const sActive = st.is_active !== undefined ? st.is_active : st.isActive !== undefined ? st.isActive : true;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        {sLogo && (
                          <img src={sLogo} alt={sName} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        )}
                        <div>
                          <span className="block">{sName}</span>
                          <span className="text-xs text-slate-400 font-medium">{sSpec}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {st.city || "فلسطين"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex flex-col gap-1 text-xs">
                          {st.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {st.phone}</span>}
                          {st.website && <a href={st.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="w-3.5 h-3.5" /> الموقع الإلكتروني</a>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStoreActive(st.id, sActive)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                        >
                          {sActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> نشط بالدليل
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> معطل مخفي
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-left pl-10">
                        <button
                          onClick={() => handleDeleteStore(st.id, sName)}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                          title="حذف الشركة نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">إضافة شركة أو مستودع طبي جديد</h2>

            <form onSubmit={handleAddStore} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">اسم الشركة / المتجر *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="مثال: مستودع القدس للتجهيزات السنية"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">مجال التخصص</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  >
                    <option value="تجهيزات ومواد طبية">تجهيزات ومواد طبية</option>
                    <option value="أجهزة وعيادات أسنان">أجهزة وعيادات أسنان</option>
                    <option value="مواد تقويم وتجميل">مواد تقويم وتجميل</option>
                    <option value="مستلزمات عامة وكل شيء">مستلزمات عامة وكل شيء</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">المدينة *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  >
                    <option value="رام الله">رام الله</option>
                    <option value="نابلس">نابلس</option>
                    <option value="الخليل">الخليل</option>
                    <option value="جنين">جنين</option>
                    <option value="بيت لحم">بيت لحم</option>
                    <option value="طولكرم">طولكرم</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم الهاتف للاتصال</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+97022987654"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم واتساب المبيعات</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+970599123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">الموقع الإلكتروني (إن وجد)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">رابط صورة شعار الشركة (Logo)</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">وصف موجز عن خدمات الشركة</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل تفاصيل موجزة عن الأجهزة والمواد الطبية السنية المستوردة..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right resize-none"
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
                  {isSubmitting ? "جاري الإضافة..." : "حفظ الشركة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

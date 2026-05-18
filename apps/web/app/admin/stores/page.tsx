"use client";

import { useState, useEffect } from "react";
import { Store as StoreIcon, CheckCircle, XCircle, Search, MapPin, Phone, MessageSquare } from "lucide-react";
import { Store as B2BStore } from "@pal-dental/shared";

export default function AdminStores() {
  const [stores, setStores] = useState<B2BStore[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filteredStores = stores.filter(st => {
    const name = st.store_name || st.storeName || "";
    const city = st.city || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <StoreIcon className="w-8 h-8 text-primary" /> إدارة المتاجر والشركات
          </h1>
          <p className="text-slate-500 mt-1">مراجعة وتفعيل شركات ومستودعات التجهيزات الطبية في B2B</p>
        </div>
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
                  <th className="px-6 py-4">الشركة</th>
                  <th className="px-6 py-4">المدينة والعنوان</th>
                  <th className="px-6 py-4">قناة واتساب للمبيعات</th>
                  <th className="px-6 py-4">رقم الاتصال</th>
                  <th className="px-6 py-4">حالة التفعيل</th>
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
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {st.city || "فلسطين"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sWhatsapp ? (
                          <a 
                            href={`https://wa.me/${sWhatsapp.replace(/\+/g, "")}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs px-2.5 py-1 rounded-md font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            واتساب المبيعات
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">غير متوفر</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {st.phone || "غير متوفر"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStoreActive(st.id, sActive)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                        >
                          {sActive ? (
                            <>
                              <CheckCircle className="w-4 h-4" /> نشط (تغيير)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" /> معطل (تغيير)
                            </>
                          )}
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
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Users, Plus, CheckCircle, XCircle, Search, Sparkles, MapPin, Phone, Check } from "lucide-react";
import { Doctor } from "@/lib/types";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("رام الله");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [acceptsInsurance, setAcceptsInsurance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors"); // We have a doctors endpoint or we fetch via helper
      // Wait, we can fetch all doctors, let's write a generic api route or call getDoctors
      const response = await fetch("/api/admin/doctors/list");
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
      } else {
        // Fallback to calling public list if admin list is not configured
        const resPublic = await fetch("/api/doctors");
        const dataPublic = await resPublic.json();
        setDoctors(dataPublic);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/doctors/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, verified: !currentStatus }),
      });
      if (res.ok) {
        setDoctors(doctors.map(d => d.id === id ? { ...d, verified: !currentStatus } : d));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) {
      alert("يرجى ملء الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/doctors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          specialty,
          city,
          area,
          phone,
          whatsapp,
          bio,
          accepts_insurance: acceptsInsurance,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        // Reset fields
        setName("");
        setSpecialty("");
        setArea("");
        setPhone("");
        setWhatsapp("");
        setBio("");
        fetchDoctors(); // Refresh
      } else {
        const data = await res.json();
        alert(data.error || "فشل إضافة الطبيب");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> إدارة الأطباء
          </h1>
          <p className="text-slate-500 mt-1">عرض وتوثيق وإضافة أطباء جدد إلى الدليل الطبي</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> إضافة طبيب جديد
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="البحث باسم الطبيب أو المدينة..."
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
        ) : filteredDoctors.length === 0 ? (
          <p className="p-12 text-center text-slate-400 font-medium">لم يتم العثور على أطباء مطابخين لخيارات البحث.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">الاسم</th>
                  <th className="px-6 py-4">المدينة والمنطقة</th>
                  <th className="px-6 py-4">التخصص</th>
                  <th className="px-6 py-4">التواصل</th>
                  <th className="px-6 py-4">التوثيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">د. {doc.name}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {doc.city} - {doc.area || "وسط البلد"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                        {doc.specialty?.[0] || "طب أسنان عام"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex gap-2">
                        {doc.whatsapp && <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded font-medium border border-emerald-100">واتساب</span>}
                        {doc.phone && <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded font-medium border border-blue-100">اتصال</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVerify(doc.id, doc.verified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${doc.verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                      >
                        {doc.verified ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> موثق (تغيير)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" /> غير موثق (تغيير)
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">إضافة طبيب جديد للدليل</h2>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: أحمد مصطفى"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">التخصص الرئيسي *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="مثال: زراعة وتجميل الأسنان"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  />
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
                    <option value="قلقيلية">قلقيلية</option>
                    <option value="أريحا">أريحا</option>
                    <option value="غزة">غزة</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">العنوان بالتفصيل</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="مثال: شارع الإرسال - عمارة السلام"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم الهاتف (للاتصال)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="022987654"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم واتساب المبيعات/الحجز</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+970599123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">نبذة شخصية وسيرة مهنية</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة عن خبرات الطبيب وأحدث الأجهزة المعتمدة في عيادته..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={acceptsInsurance}
                  onChange={(e) => setAcceptsInsurance(e.target.checked)}
                  className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <label htmlFor="insurance" className="text-sm font-bold text-slate-700 select-none">الطبيب يقبل شركات التأمين الطبي المعتمدة</label>
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
                  {isSubmitting ? "جاري الإضافة..." : "حفظ الطبيب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

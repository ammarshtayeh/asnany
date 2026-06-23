"use client";

import { useState, useEffect } from "react";
import { Users, Plus, CheckCircle, XCircle, Search, MapPin, Phone, Edit3, Trash2 } from "lucide-react";
import { Doctor } from "@/lib/types";
import AdminImageUpload from "@/components/AdminImageUpload";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);

  // Form states (Add & Edit shared/distinct)
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("رام الله");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [acceptsInsurance, setAcceptsInsurance] = useState(true);
  const [category, setCategory] = useState("أسنان");
  const [imageUrl, setImageUrl] = useState("");
  const [clinicPhotos, setClinicPhotos] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/admin/doctors/list");
      if (response.ok) {
        const data = await response.json();
        setDoctors(Array.isArray(data?.doctors) ? data.doctors : Array.isArray(data) ? data : []);
      } else {
        const resPublic = await fetch("/api/doctors");
        const dataPublic = await resPublic.json();
        setDoctors(Array.isArray(dataPublic) ? dataPublic : Array.isArray(dataPublic?.doctors) ? dataPublic.doctors : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("add") === "true") {
        setShowAddModal(true);
      }
    }
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

  const handleDeleteDoctor = async (id: string, docName: string) => {
    if (!confirm(`هل أنت متأكد تماماً من حذف الطبيب "د. ${docName}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/doctors/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDoctors(doctors.filter(d => d.id !== id));
      } else {
        alert("فشل حذف الطبيب");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (doc: Doctor) => {
    setActiveDoctor(doc);
    setName(doc.name);
    setCategory(doc.category || "أسنان");
    setSpecialty(doc.specialty?.[0] || "");
    setCity(doc.city);
    setArea(doc.area || "");
    setPhone(doc.phone || "");
    setWhatsapp(doc.whatsapp || "");
    setBio(doc.bio || "");
    setAcceptsInsurance(!!doc.accepts_insurance);
    setImageUrl(doc.image_url || "");
    setClinicPhotos(doc.clinic_photos && doc.clinic_photos.length > 0 ? doc.clinic_photos : [""]);
    setShowEditModal(true);
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
          category,
          specialty,
          city,
          area,
          phone,
          whatsapp,
          bio,
          accepts_insurance: acceptsInsurance,
          image_url: imageUrl,
          clinic_photos: clinicPhotos.filter(url => !!url.trim()),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchDoctors();
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

  const handleEditDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor || !name) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/doctors/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeDoctor.id,
          name,
          category,
          specialty,
          city,
          area,
          phone,
          whatsapp,
          bio,
          accepts_insurance: acceptsInsurance,
          image_url: imageUrl,
          clinic_photos: clinicPhotos.filter(url => !!url.trim()),
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        resetForm();
        fetchDoctors();
      } else {
        const data = await res.json();
        alert(data.error || "فشل تحديث بيانات الطبيب");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("أسنان");
    setSpecialty("");
    setCity("رام الله");
    setArea("");
    setPhone("");
    setWhatsapp("");
    setBio("");
    setAcceptsInsurance(true);
    setImageUrl("");
    setClinicPhotos([""]);
    setActiveDoctor(null);
  };

  const sortedDoctors = [...doctors].sort((a, b) => {
    if (a.verified === b.verified) return 0;
    return a.verified ? 1 : -1; // Unverified first
  });

  const filteredDoctors = sortedDoctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> إدارة الأطباء والعيادات
          </h1>
          <p className="text-slate-500 mt-1">إضافة وتعديل وحذف أطباء وصناع الجمال والوجه والأسنان، وإدارة تفعيلهم وتفضيلهم حياً على البوابة</p>
        </div>

        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
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
                  <th className="px-6 py-4">الاسم والعيادة</th>
                  <th className="px-6 py-4">المدينة والمنطقة</th>
                  <th className="px-6 py-4">القسم الرئيسي</th>
                  <th className="px-6 py-4">التخصص الفرعي</th>
                  <th className="px-6 py-4">التوثيق بالمنصة</th>
                  <th className="px-6 py-4 text-left pl-10">إجراءات إدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => {
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                        {doc.image_url && (
                          <img src={doc.image_url} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span>د. {doc.name}</span>
                            {!doc.verified && (
                              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">
                                طلب جديد
                              </span>
                            )}
                          </div>
                          <span className="block text-xs text-slate-400 font-medium">{doc.phone || "بدون هاتف"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {doc.city} {doc.area && ` - ${doc.area}`}
                        </span>
                        {doc.lat !== null && doc.lat !== undefined && doc.lng !== null && doc.lng !== undefined && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                            📍 GPS: {doc.lat.toFixed(4)}, {doc.lng.toFixed(4)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {doc.category || "أسنان"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                          {doc.specialty?.[0] || "طب أسنان عام"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleVerify(doc.id, doc.verified)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${doc.verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
                        >
                          {doc.verified ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> موثق
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> معلق
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-left pl-10">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(doc)}
                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors border border-slate-200"
                            title="تعديل بيانات الطبيب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors border border-red-100"
                            title="حذف الطبيب نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bento-card max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black text-slate-900 mb-6">إضافة طبيب جديد للدليل</h2>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-bold text-slate-700">القسم الرئيسي *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  >
                    <option value="أسنان">أسنان</option>
                    <option value="عيون">عيون</option>
                    <option value="جلدية">جلدية</option>
                    <option value="تجميل">تجميل</option>
                    <option value="أنف وأذن وحنجرة">أنف وأذن وحنجرة</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">التخصص الفرعي *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="مثال: ليزك، زراعة، فيلر وبوتوكس"
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

              <AdminImageUpload
                label="الصورة الشخصية للطبيب"
                value={imageUrl}
                folder="doctors"
                onChange={setImageUrl}
              />

              <div className="space-y-2 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-black text-slate-800">صور العيادة (رابط URL - الحد الأقصى 5 صور)</label>
                  <span className="text-[10px] text-slate-400 font-bold">{clinicPhotos.length} / 5</span>
                </div>
                {clinicPhotos.map((photo, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                    <AdminImageUpload
                      label={`صورة العيادة #${index + 1}`}
                      value={photo}
                      folder="clinics"
                      onChange={(value) => {
                        const newPhotos = [...clinicPhotos];
                        newPhotos[index] = value;
                        setClinicPhotos(newPhotos);
                      }}
                    />
                    {clinicPhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setClinicPhotos(clinicPhotos.filter((_, idx) => idx !== index))}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-100 transition-colors"
                        title="حذف هذه الصورة"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {clinicPhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setClinicPhotos([...clinicPhotos, ""])}
                    className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 mt-1.5"
                  >
                    + إضافة صورة عيادة أخرى
                  </button>
                )}
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

      {/* Edit Doctor Modal */}
      {showEditModal && activeDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bento-card max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black text-slate-900 mb-6">تعديل بيانات الطبيب: د. {activeDoctor.name}</h2>

            <form onSubmit={handleEditDoctor} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">القسم الرئيسي *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right"
                  >
                    <option value="أسنان">أسنان</option>
                    <option value="عيون">عيون</option>
                    <option value="جلدية">جلدية</option>
                    <option value="تجميل">تجميل</option>
                    <option value="أنف وأذن وحنجرة">أنف وأذن وحنجرة</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">التخصص الفرعي *</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-slate-700">رقم واتساب الحجز</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-left"
                  />
                </div>
              </div>

              <AdminImageUpload
                label="الصورة الشخصية للطبيب"
                value={imageUrl}
                folder="doctors"
                onChange={setImageUrl}
              />

              <div className="space-y-2 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-black text-slate-800">صور العيادة (رابط URL - الحد الأقصى 5 صور)</label>
                  <span className="text-[10px] text-slate-400 font-bold">{clinicPhotos.length} / 5</span>
                </div>
                {clinicPhotos.map((photo, index) => (
                  <div key={index} className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                    <AdminImageUpload
                      label={`صورة العيادة #${index + 1}`}
                      value={photo}
                      folder="clinics"
                      onChange={(value) => {
                        const newPhotos = [...clinicPhotos];
                        newPhotos[index] = value;
                        setClinicPhotos(newPhotos);
                      }}
                    />
                    {clinicPhotos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setClinicPhotos(clinicPhotos.filter((_, idx) => idx !== index))}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-rose-100 transition-colors"
                        title="حذف هذه الصورة"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {clinicPhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setClinicPhotos([...clinicPhotos, ""])}
                    className="text-xs font-black text-primary hover:text-primary-dark flex items-center gap-1 mt-1.5"
                  >
                    + إضافة صورة عيادة أخرى
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700">نبذة شخصية وسيرة مهنية</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium text-sm transition-all text-right resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="edit-insurance"
                  checked={acceptsInsurance}
                  onChange={(e) => setAcceptsInsurance(e.target.checked)}
                  className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <label htmlFor="edit-insurance" className="text-sm font-bold text-slate-700 select-none">الطبيب يقبل شركات التأمين الطبي المعتمدة</label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit3, Eye, EyeOff, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { MedicalService, MedicalServiceType } from "@/lib/types";
import AdminImageUpload from "@/components/AdminImageUpload";

const serviceTypes: Array<{ value: MedicalServiceType; label: string }> = [
  { value: "beauty", label: "مراكز التجميل" },
  { value: "lab", label: "المختبرات الطبية" },
  { value: "consultation", label: "الاستشارات" },
  { value: "booking", label: "الحجز الإلكتروني" },
  { value: "media", label: "الميديا الطبية" },
  { value: "partner", label: "الشركات والمنتجات" },
];

const emptyForm = {
  id: "",
  service_type: "beauty" as MedicalServiceType,
  name: "",
  category: "",
  city: "",
  area: "",
  description: "",
  services: "",
  price_range: "",
  phone: "",
  whatsapp: "",
  website: "",
  image_url: "",
  gallery: "",
  address: "",
  lat: "",
  lng: "",
  rating: "0",
  is_featured: false,
  is_active: true,
  sort_order: "0",
};

function toForm(service: MedicalService) {
  return {
    id: service.id,
    service_type: service.service_type,
    name: service.name || "",
    category: service.category || "",
    city: service.city || "",
    area: service.area || "",
    description: service.description || "",
    services: service.services?.join(", ") || "",
    price_range: service.price_range || "",
    phone: service.phone || "",
    whatsapp: service.whatsapp || "",
    website: service.website || "",
    image_url: service.image_url || "",
    gallery: service.gallery?.join(", ") || "",
    address: service.address || "",
    lat: service.lat?.toString() || "",
    lng: service.lng?.toString() || "",
    rating: service.rating?.toString() || "0",
    is_featured: Boolean(service.is_featured),
    is_active: Boolean(service.is_active),
    sort_order: service.sort_order?.toString() || "0",
  };
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MedicalServiceType>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-listings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تحميل الخدمات");
      setServices(data.services || []);
    } catch (error: any) {
      alert(error.message || "تعذر تحميل الخدمات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = useMemo(() => {
    return services.filter((service) => {
      const matchesType = typeFilter === "all" || service.service_type === typeFilter;
      const haystack = `${service.name} ${service.city || ""} ${service.category || ""}`.toLowerCase();
      return matchesType && haystack.includes(query.toLowerCase());
    });
  }, [services, query, typeFilter]);

  const openAdd = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (service: MedicalService) => {
    setForm(toForm(service));
    setModalOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/service-listings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حفظ الخدمة");
      setModalOpen(false);
      await loadServices();
    } catch (error: any) {
      alert(error.message || "تعذر حفظ الخدمة");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (service: MedicalService) => {
    if (!confirm(`هل تريد حذف "${service.name}" نهائياً؟`)) return;
    try {
      const res = await fetch("/api/admin/service-listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: service.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حذف الخدمة");
      setServices((current) => current.filter((item) => item.id !== service.id));
    } catch (error: any) {
      alert(error.message || "تعذر حذف الخدمة");
    }
  };

  const quickToggle = async (service: MedicalService, field: "is_active" | "is_featured") => {
    const next = { ...toForm(service), [field]: !service[field] };
    try {
      const res = await fetch("/api/admin/service-listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر التحديث");
      setServices((current) => current.map((item) => (item.id === service.id ? data.service : item)));
    } catch (error: any) {
      alert(error.message || "تعذر التحديث");
    }
  };

  return (
    <div className="p-6 md:p-10 font-sans" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-sky-600" />
            إدارة خدمات المنصة
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            تحكم كامل CRUD بمراكز التجميل، المختبرات، الاستشارات، الحجز، الميديا، والشركات الداعمة.
          </p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 bg-slate-950 text-white px-5 py-3 rounded-xl font-black hover:bg-sky-600 transition-colors">
          <Plus className="w-5 h-5" />
          إضافة سجل جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 grid md:grid-cols-[1fr_240px] gap-3">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو المدينة أو التصنيف..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-bold"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | MedicalServiceType)}
          className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-bold"
        >
          <option value="all">كل الأقسام</option>
          {serviceTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold">لا توجد سجلات مطابقة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-5 py-4">السجل</th>
                  <th className="px-5 py-4">القسم</th>
                  <th className="px-5 py-4">المدينة</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {service.image_url ? <img src={service.image_url} alt={service.name} className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-sky-50" />}
                        <div>
                          <p className="font-black text-slate-900">{service.name}</p>
                          <p className="text-xs text-slate-500 font-bold">{service.category || "بدون تصنيف"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">{serviceTypes.find((type) => type.value === service.service_type)?.label}</td>
                    <td className="px-5 py-4 text-slate-600 font-bold">{service.city || "كل فلسطين"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => quickToggle(service, "is_active")} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black border ${service.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          {service.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {service.is_active ? "ظاهر" : "مخفي"}
                        </button>
                        <button onClick={() => quickToggle(service, "is_featured")} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black border ${service.is_featured ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {service.is_featured ? "مميز" : "عادي"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(service)} className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(service)} className="p-2 rounded-lg border border-red-100 text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bento-card max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">{form.id ? "تعديل سجل" : "إضافة سجل جديد"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
              <Field label="الاسم" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
              <label className="space-y-1">
                <span className="text-sm font-black text-slate-700">القسم</span>
                <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value as MedicalServiceType })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none">
                  {serviceTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </label>
              <Field label="التصنيف" value={form.category} onChange={(value) => setForm({ ...form, category: value })} placeholder="ليزر، مختبر أسنان، شركة أجهزة..." />
              <Field label="المدينة" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
              <Field label="المنطقة" value={form.area} onChange={(value) => setForm({ ...form, area: value })} />
              <Field label="السعر التقريبي" value={form.price_range} onChange={(value) => setForm({ ...form, price_range: value })} placeholder="من 100 إلى 300 شيكل" />
              <Field label="الهاتف" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              <Field label="واتساب" value={form.whatsapp} onChange={(value) => setForm({ ...form, whatsapp: value })} />
              <Field label="الموقع الإلكتروني" value={form.website} onChange={(value) => setForm({ ...form, website: value })} />
              <AdminImageUpload
                label="صورة رئيسية"
                value={form.image_url}
                folder="services"
                onChange={(value) => setForm({ ...form, image_url: value })}
              />
              <Field label="الخدمات (افصل بفواصل)" value={form.services} onChange={(value) => setForm({ ...form, services: value })} />
              <Field label="صور إضافية (روابط بفواصل)" value={form.gallery} onChange={(value) => setForm({ ...form, gallery: value })} />
              <Field label="العنوان" value={form.address} onChange={(value) => setForm({ ...form, address: value })} />
              <Field label="الترتيب" value={form.sort_order} onChange={(value) => setForm({ ...form, sort_order: value })} type="number" />
              <Field label="التقييم" value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} type="number" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude" value={form.lat} onChange={(value) => setForm({ ...form, lat: value })} />
                <Field label="Longitude" value={form.lng} onChange={(value) => setForm({ ...form, lng: value })} />
              </div>
              <label className="md:col-span-2 space-y-1">
                <span className="text-sm font-black text-slate-700">الوصف</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none resize-none" />
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 font-black text-slate-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                  ظاهر للزوار
                </label>
                <label className="inline-flex items-center gap-2 font-black text-slate-700">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  مميز
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 rounded-xl bg-slate-100 font-black text-slate-700">إلغاء</button>
                <button disabled={saving} className="px-5 py-3 rounded-xl bg-slate-950 text-white font-black hover:bg-sky-600 disabled:opacity-50">
                  {saving ? "جار الحفظ..." : "حفظ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  );
}

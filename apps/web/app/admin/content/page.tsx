"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  BookOpenText,
  BriefcaseBusiness,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminImageUpload from "@/components/AdminImageUpload";

type Resource = "offers" | "articles" | "marketplace_ads";

type ContentItem = Record<string, any> & { id: string };

const sections: Array<{
  value: Resource;
  label: string;
  hint: string;
  icon: any;
  color: string;
}> = [
  {
    value: "offers",
    label: "العروض",
    hint: "خصومات وأسعار وحملات محدودة",
    icon: BadgePercent,
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    value: "articles",
    label: "المقالات والأخبار",
    hint: "المدونة الطبية والدراسات والتوعية",
    icon: BookOpenText,
    color: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    value: "marketplace_ads",
    label: "سوق ملامح",
    hint: "معدات، وظائف، وإعلانات الموردين",
    icon: BriefcaseBusiness,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
];

const emptyForms = {
  offers: {
    id: "",
    title: "",
    description: "",
    doctor_id: "",
    doctor_name: "",
    discount_percentage: "0",
    original_price: "",
    discounted_price: "",
    image_url: "",
    valid_until: "",
  },
  articles: {
    id: "",
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    doctor_id: "",
    doctor_name: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    read_time: "",
  },
  marketplace_ads: {
    id: "",
    title: "",
    type: "equipment",
    category: "",
    price: "",
    salary: "",
    publisher: "",
    city: "",
    date: new Date().toISOString().split("T")[0],
    is_featured: false,
    is_active: true,
    image_url: "",
    description: "",
    phone: "",
  },
};

export default function AdminContentPage() {
  const [resource, setResource] = useState<Resource>("offers");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(emptyForms.offers);

  const activeSection = sections.find((section) => section.value === resource)!;

  async function load(target: Resource = resource) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/content?resource=${target}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تحميل المحتوى");
      setItems(data.items || []);
    } catch (error: any) {
      alert(error.message || "تعذر تحميل المحتوى");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(resource);
  }, [resource]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.title || ""} ${item.doctor_name || ""} ${item.publisher || ""} ${item.category || ""} ${item.city || ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  function changeResource(next: Resource) {
    setResource(next);
    setQuery("");
    setModalOpen(false);
    setForm(emptyForms[next]);
  }

  function openAdd() {
    setForm(emptyForms[resource]);
    setModalOpen(true);
  }

  function openEdit(item: ContentItem) {
    setForm({ ...emptyForms[resource], ...item });
    setModalOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const method = form.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/content", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, resource }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حفظ المحتوى");
      setModalOpen(false);
      await load(resource);
    } catch (error: any) {
      alert(error.message || "تعذر حفظ المحتوى");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: ContentItem) {
    if (!confirm(`هل تريد حذف "${item.title}" نهائياً؟`)) return;
    try {
      const res = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, id: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر حذف المحتوى");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error: any) {
      alert(error.message || "تعذر حذف المحتوى");
    }
  }

  return (
    <div className="p-4 md:p-10 font-sans" dir="rtl">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-black text-sky-600">مركز المحتوى</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950">
            إدارة العروض، الأخبار، وسوق ملامح
          </h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base font-medium leading-relaxed text-slate-500">
            من هذه الصفحة تستطيع إضافة وتعديل وحذف المحتوى الذي يظهر للزوار في الصفحات العامة بدون لمس الكود.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-sky-600"
        >
          <Plus className="h-5 w-5" />
          إضافة محتوى
        </button>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = section.value === resource;
          return (
            <button
              key={section.value}
              onClick={() => changeResource(section.value)}
              className={`rounded-2xl border p-4 text-right transition-all ${
                active ? section.color : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-lg font-black">{section.label}</span>
              </div>
              <p className="text-sm font-bold opacity-75">{section.hint}</p>
            </button>
          );
        })}
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`ابحث داخل ${activeSection.label}...`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center font-bold text-slate-500">
            لا توجد سجلات في هذا القسم حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4">العنوان</th>
                  <th className="px-5 py-4">التصنيف/الجهة</th>
                  <th className="px-5 py-4">التاريخ</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="h-12 w-12 rounded-xl object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-slate-100" />
                        )}
                        <div>
                          <p className="font-black text-slate-950">{item.title}</p>
                          <p className="line-clamp-1 text-xs font-bold text-slate-500">
                            {item.description || item.excerpt || item.content || "بدون وصف"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-600">
                      {item.category || item.doctor_name || item.publisher || "-"}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-500">
                      {item.valid_until || item.date || item.created_at?.slice(0, 10) || "-"}
                    </td>
                    <td className="px-5 py-4">
                      {resource === "marketplace_ads" ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-black ${
                            item.is_active
                              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          {item.is_active ? "ظاهر" : "مخفي"}
                        </span>
                      ) : (
                        <span className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700">
                          منشور
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(item)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-sky-50 hover:text-sky-700">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(item)} className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black text-slate-950">
                {form.id ? "تعديل محتوى" : "إضافة محتوى جديد"} - {activeSection.label}
              </h2>
              <button onClick={() => setModalOpen(false)} className="rounded-xl bg-slate-100 p-2 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
              {resource === "offers" ? <OfferFields form={form} setForm={setForm} /> : null}
              {resource === "articles" ? <ArticleFields form={form} setForm={setForm} /> : null}
              {resource === "marketplace_ads" ? <MarketplaceFields form={form} setForm={setForm} /> : null}

              <div className="md:col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl bg-slate-100 px-5 py-3 font-black text-slate-700">
                  إلغاء
                </button>
                <button disabled={saving} className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-sky-600 disabled:opacity-50">
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
  name,
  form,
  setForm,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  form: Record<string, any>;
  setForm: (form: Record<string, any>) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        required={required}
        value={form[name] ?? ""}
        onChange={(event) => setForm({ ...form, [name]: event.target.value })}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  form,
  setForm,
  required,
}: {
  label: string;
  name: string;
  form: Record<string, any>;
  setForm: (form: Record<string, any>) => void;
  required?: boolean;
}) {
  return (
    <label className="space-y-1 md:col-span-2">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <textarea
        required={required}
        rows={4}
        value={form[name] ?? ""}
        onChange={(event) => setForm({ ...form, [name]: event.target.value })}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  );
}

function OfferFields({ form, setForm }: { form: Record<string, any>; setForm: (form: Record<string, any>) => void }) {
  return (
    <>
      <Field label="عنوان العرض" name="title" form={form} setForm={setForm} required />
      <Field label="اسم الطبيب/المركز" name="doctor_name" form={form} setForm={setForm} required />
      <Field label="معرف الطبيب (اختياري)" name="doctor_id" form={form} setForm={setForm} />
      <Field label="نسبة الخصم" name="discount_percentage" form={form} setForm={setForm} type="number" />
      <Field label="السعر قبل الخصم" name="original_price" form={form} setForm={setForm} type="number" />
      <Field label="السعر بعد الخصم" name="discounted_price" form={form} setForm={setForm} type="number" />
      <AdminImageUpload
        label="صورة العرض"
        value={form.image_url}
        folder="offers"
        onChange={(value) => setForm({ ...form, image_url: value })}
      />
      <Field label="صالح حتى" name="valid_until" form={form} setForm={setForm} type="date" />
      <TextArea label="الوصف" name="description" form={form} setForm={setForm} />
    </>
  );
}

function ArticleFields({ form, setForm }: { form: Record<string, any>; setForm: (form: Record<string, any>) => void }) {
  return (
    <>
      <Field label="عنوان المقال/الخبر" name="title" form={form} setForm={setForm} required />
      <label className="space-y-1">
        <span className="text-sm font-black text-slate-700">التصنيف *</span>
        <select
          value={form.category || "بسمتك وصحة فمك"}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="بسمتك وصحة فمك">بسمتك وصحة فمك (الأسنان)</option>
          <option value="بشرتك ونضارتها">بشرتك ونضارتها (الجلدية والليزر)</option>
          <option value="لمسات الجمال">لمسات الجمال (التجميل، فيلر، بوتوكس)</option>
          <option value="رؤية واضحة">رؤية واضحة (العيون والبصريات)</option>
          <option value="تنفس سليم">تنفس سليم (أنف وأذن وحنجرة)</option>
        </select>
      </label>
      <Field label="اسم الكاتب/الطبيب" name="doctor_name" form={form} setForm={setForm} required />
      <Field label="معرف الطبيب (اختياري)" name="doctor_id" form={form} setForm={setForm} />
      <AdminImageUpload
        label="صورة المقال"
        value={form.image_url}
        folder="articles"
        onChange={(value) => setForm({ ...form, image_url: value })}
      />
      <Field label="تاريخ النشر" name="date" form={form} setForm={setForm} />
      <Field label="مدة القراءة" name="read_time" form={form} setForm={setForm} />
      <TextArea label="ملخص قصير" name="excerpt" form={form} setForm={setForm} />
      <TextArea label="المحتوى الكامل" name="content" form={form} setForm={setForm} required />
    </>
  );
}

function MarketplaceFields({ form, setForm }: { form: Record<string, any>; setForm: (form: Record<string, any>) => void }) {
  return (
    <>
      <Field label="عنوان الإعلان" name="title" form={form} setForm={setForm} required />
      <label className="space-y-1">
        <span className="text-sm font-black text-slate-700">نوع الإعلان</span>
        <select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="equipment">معدات للبيع</option>
          <option value="job">وظيفة شاغرة</option>
        </select>
      </label>
      <Field label="التصنيف" name="category" form={form} setForm={setForm} />
      <Field label="الناشر" name="publisher" form={form} setForm={setForm} required />
      <Field label="المدينة" name="city" form={form} setForm={setForm} />
      <Field label="رقم التواصل" name="phone" form={form} setForm={setForm} required />
      <Field label="السعر" name="price" form={form} setForm={setForm} />
      <Field label="الراتب" name="salary" form={form} setForm={setForm} />
      <AdminImageUpload
        label="صورة الإعلان"
        value={form.image_url}
        folder="marketplace"
        onChange={(value) => setForm({ ...form, image_url: value })}
      />
      <Field label="التاريخ" name="date" form={form} setForm={setForm} />
      <div className="md:col-span-2 flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 font-black text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form.is_active)}
            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
          />
          ظاهر للزوار
        </label>
        <label className="inline-flex items-center gap-2 font-black text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form.is_featured)}
            onChange={(event) => setForm({ ...form, is_featured: event.target.checked })}
          />
          إعلان مميز
        </label>
      </div>
      <TextArea label="الوصف" name="description" form={form} setForm={setForm} required />
    </>
  );
}

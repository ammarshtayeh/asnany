"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Megaphone } from "lucide-react";
import Image from "next/image";
import AdminImageUpload from "@/components/AdminImageUpload";
import type { NewsTickerItem } from "@pal-dental/shared";
import { getTickerPresentation } from "@pal-dental/shared";

export default function AdminTickerPage() {
  const [items, setItems] = useState<NewsTickerItem[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    background_color: "#0a1628",
    text_color: "#ffffff",
    sort_order: "0",
  });

  const load = async () => {
    const res = await fetch("/api/admin/ticker");
    const data = await res.json();
    setItems(Array.isArray(data?.items) ? data.items : []);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const active = items.filter((i) => i.is_active);
    if (previewIndex >= active.length) setPreviewIndex(0);
  }, [items, previewIndex]);

  const save = async () => {
    const res = await fetch("/api/admin/ticker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sort_order: Number(form.sort_order || 0) }),
    });
    if (res.ok) {
      setForm({ title: "", subtitle: "", image_url: "", link_url: "", background_color: "#0a1628", text_color: "#ffffff", sort_order: "0" });
      void load();
    }
  };

  const toggle = async (item: NewsTickerItem) => {
    await fetch("/api/admin/ticker", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
    });
    void load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/ticker?id=${id}`, { method: "DELETE" });
    void load();
  };

  const activeItems = items.filter((i) => i.is_active);
  const previewItem = form.title
    ? ({
        title: form.title,
        subtitle: form.subtitle,
        image_url: form.image_url,
        background_color: form.background_color,
        text_color: form.text_color,
      } as NewsTickerItem)
    : activeItems[previewIndex];
  const previewStyle = previewItem ? getTickerPresentation(previewItem, previewIndex) : null;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-slate-950">شريط الإعلانات</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">
          يظهر مباشرة تحت شريط التنقل في الموقع والتطبيق — نفس المحتوى من `/api/ticker`.
        </p>
      </div>

      {previewItem && previewStyle ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
          <div className="bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">معاينة حية — يتحرك تلقائياً كل 7 ثوانٍ</div>
          <div className="relative flex h-[68px] items-center gap-3 overflow-hidden px-4" style={{ color: previewStyle.textColor }}>
            {previewStyle.useImageBackdrop && previewItem.image_url ? (
              <>
                <Image src={previewItem.image_url} alt="" fill className="object-cover blur-[4px] brightness-75" unoptimized />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(270deg, ${previewStyle.backgroundColor}f2 0%, ${previewStyle.backgroundColor}cc 100%)`,
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: previewStyle.backgroundColor }} />
            )}
            <span
              className="relative z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black"
              style={{ backgroundColor: `${previewStyle.accentColor}33` }}
            >
              <Megaphone className="h-3 w-3" style={{ color: previewStyle.accentColor }} /> إعلان مميز
            </span>
            {previewItem.image_url ? (
              <div className="relative z-10 h-12 w-16 overflow-hidden rounded-xl border-2" style={{ borderColor: `${previewStyle.accentColor}55` }}>
                <Image src={previewItem.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : null}
            <div className="relative z-10 min-w-0 flex-1 text-right">
              <p className="truncate text-sm font-black">{previewItem.title}</p>
              {previewItem.subtitle ? <p className="truncate text-xs font-bold opacity-85">{previewItem.subtitle}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="bento-card p-6 space-y-3">
        <h2 className="text-lg font-black">إضافة إعلان للشريط</h2>
        <input className="w-full rounded-xl border px-4 py-3 font-bold text-right" placeholder="العنوان الرئيسي *" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
        <input className="w-full rounded-xl border px-4 py-3 font-bold text-right" placeholder="نص فرعي (اختياري)" value={form.subtitle} onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))} />
        <AdminImageUpload label="صورة الإعلان (مستحسنة 16:9)" value={form.image_url} onChange={(image_url) => setForm((c) => ({ ...c, image_url }))} />
        <input className="w-full rounded-xl border px-4 py-3 font-bold text-right" placeholder="رابط عند الضغط (/offers أو https://...)" value={form.link_url} onChange={(e) => setForm((c) => ({ ...c, link_url: e.target.value }))} />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-bold text-slate-600">
            لون الخلفية
            <input type="color" className="mt-1 h-10 w-full rounded-lg" value={form.background_color} onChange={(e) => setForm((c) => ({ ...c, background_color: e.target.value }))} />
          </label>
          <label className="text-sm font-bold text-slate-600">
            لون النص
            <input type="color" className="mt-1 h-10 w-full rounded-lg" value={form.text_color} onChange={(e) => setForm((c) => ({ ...c, text_color: e.target.value }))} />
          </label>
          <label className="text-sm font-bold text-slate-600">
            ترتيب العرض
            <input type="number" className="mt-1 w-full rounded-xl border px-4 py-2 font-bold" value={form.sort_order} onChange={(e) => setForm((c) => ({ ...c, sort_order: e.target.value }))} />
          </label>
        </div>
        <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 font-black text-white">
          <Plus className="h-4 w-4" /> إضافة للشريط
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border bg-white p-4">
            <div className="flex items-center gap-3">
              {item.image_url ? (
                <div className="relative h-12 w-16 overflow-hidden rounded-lg">
                  <Image src={item.image_url} alt="" fill className="object-cover" unoptimized />
                </div>
              ) : null}
              <div className="text-right">
                <p className="font-black text-slate-950">{item.title}</p>
                <p className="text-sm font-bold text-slate-500">{item.subtitle}</p>
                <p className="text-xs font-bold text-slate-400">ترتيب: {item.sort_order ?? 0}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggle(item)} className="rounded-xl border p-2" title={item.is_active ? "إخفاء" : "تفعيل"}>
                {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => remove(item.id)} className="rounded-xl border p-2 text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

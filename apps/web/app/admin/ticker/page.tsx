"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import AdminImageUpload from "@/components/AdminImageUpload";

type TickerItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
};

export default function AdminTickerPage() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    background_color: "#0f172a",
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

  const save = async () => {
    const res = await fetch("/api/admin/ticker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sort_order: Number(form.sort_order || 0) }),
    });
    if (res.ok) {
      setForm({ title: "", subtitle: "", image_url: "", link_url: "", background_color: "#0f172a", text_color: "#ffffff", sort_order: "0" });
      void load();
    }
  };

  const toggle = async (item: TickerItem) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">الشريط الإخباري</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">يظهر مباشرة تحت شريط التنقل في الموقع والتطبيق.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-lg font-black">إضافة عنصر جديد</h2>
        <input className="w-full rounded-xl border px-4 py-3 font-bold" placeholder="العنوان" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
        <input className="w-full rounded-xl border px-4 py-3 font-bold" placeholder="نص فرعي" value={form.subtitle} onChange={(e) => setForm((c) => ({ ...c, subtitle: e.target.value }))} />
        <AdminImageUpload label="صورة الشريط" value={form.image_url} onChange={(image_url) => setForm((c) => ({ ...c, image_url }))} />
        <input className="w-full rounded-xl border px-4 py-3 font-bold" placeholder="رابط عند الضغط" value={form.link_url} onChange={(e) => setForm((c) => ({ ...c, link_url: e.target.value }))} />
        <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-black text-white">
          <Plus className="h-4 w-4" /> إضافة للشريط
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
            <div className="text-right">
              <p className="font-black text-slate-950">{item.title}</p>
              <p className="text-sm font-bold text-slate-500">{item.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggle(item)} className="rounded-xl border p-2">
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

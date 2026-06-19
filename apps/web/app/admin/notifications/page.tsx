"use client";

import { useEffect, useState } from "react";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationRecord[]>([]);

  const load = async () => {
    const response = await fetch("/api/notifications?limit=40", { cache: "no-store", credentials: "include" });
    const data = await response.json().catch(() => ({}));
    setItems(Array.isArray(data?.notifications) ? data.notifications : []);
  };

  useEffect(() => {
    void load();
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    void load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-950">مركز إشعارات الإدارة</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">تنبيهات صوتية وفورية عند وصول حجوزات أو طلبات جديدة.</p>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => markRead(item.id)}
            className={`rounded-2xl border p-4 text-right transition ${item.read_at ? "border-slate-200 bg-slate-50" : "border-sky-200 bg-white shadow-sm"}`}
          >
            <p className="text-sm font-black text-slate-950">{item.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{item.body}</p>
          </button>
        ))}
        {!items.length ? <p className="text-sm font-bold text-slate-500">لا توجد إشعارات حالياً.</p> : null}
      </div>
    </div>
  );
}

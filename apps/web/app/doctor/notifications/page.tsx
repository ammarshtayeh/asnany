"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, CheckCheck, RefreshCw } from "lucide-react";

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at?: string;
  appointment_id?: string | null;
  data?: Record<string, unknown> | null;
};

export default function DoctorNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  const load = async () => {
    setError("");
    const res = await fetch("/api/notifications?limit=50");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || "تعذر جلب الإشعارات");
    }
    setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر جلب الإشعارات");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر جلب الإشعارات");
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "تعذر تحديث الإشعار");
      return;
    }
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item)));
  };

  return (
    <main className="portal-page" dir="rtl">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-sky-300">لوحة الطبيب</p>
              <h1 className="mt-1 text-3xl font-black">الإشعارات</h1>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                كل طلب حجز وتحديث حالة يوصل هنا بنفس الوقت على الموقع والموبايل.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                تحديث
              </button>
              <Link href="/doctor/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-400">
                <ArrowRight className="h-4 w-4" />
                العودة للوحة
              </Link>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black">
            <Bell className="h-4 w-4 text-sky-300" />
            {unreadCount} غير مقروء
          </div>
        </header>

        {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}

        <section className="bento-card p-5 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border p-4 transition ${item.read_at ? "border-slate-200 bg-white" : "border-sky-200 bg-sky-50/70"}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {!item.read_at ? <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> : null}
                        <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
                      </div>
                      <p className="text-sm font-semibold leading-6 text-slate-600">{item.body}</p>
                      <p className="text-xs font-bold text-slate-400">{formatDate(item.created_at)}</p>
                    </div>
                    {!item.read_at ? (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-sky-600"
                      >
                        <CheckCheck className="h-4 w-4" />
                        تعليم كمقروء
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                        <CheckCheck className="h-4 w-4" />
                        مقروء
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
      <Bell className="mx-auto h-10 w-10 text-slate-300" />
      <h2 className="mt-4 text-xl font-black text-slate-950">لا توجد إشعارات بعد</h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">
        أي حجز جديد أو تعديل على الموعد رح يظهر هنا فوراً من الموقع والتطبيق.
      </p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

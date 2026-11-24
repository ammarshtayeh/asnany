"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Save, Sparkles } from "lucide-react";

type Settings = {
  enabled: boolean;
  title: string;
  message: string;
  updatedAt?: string | null;
};

export default function AdminPrelaunchPage() {
  const [settings, setSettings] = useState<Settings>({
    enabled: false,
    title: "قريباً",
    message: "ترقّبوا إطلاق ملامح في فلسطين",
    updatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/prelaunch");
        if (!res.ok) throw new Error("تعذر تحميل الإعداد");
        const data = await res.json();
        setSettings({
          enabled: Boolean(data.enabled),
          title: String(data.title || "قريباً"),
          message: String(data.message || "ترقّبوا إطلاق ملامح في فلسطين"),
          updatedAt: data.updatedAt || null,
        });
      } catch (err: any) {
        setError(err.message || "تعذر التحميل");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/prelaunch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: settings.enabled,
          title: settings.title,
          message: settings.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر الحفظ");
      setSettings({
        enabled: Boolean(data.settings.enabled),
        title: String(data.settings.title),
        message: String(data.settings.message),
        updatedAt: data.settings.updatedAt || null,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-bold text-slate-500" dir="rtl">
        <Loader2 className="h-5 w-5 animate-spin" />
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 font-sans bg-slate-50 min-h-screen text-right" dir="rtl">
      <div className="mb-8">
        <p className="text-xs font-black tracking-[0.18em] text-[#d4af37]">PRELAUNCH</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">وضع ما قبل الإطلاق</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
          عند التفعيل، يظهر للزوار (والموقع + التطبيق + بوابة الطبيب) شاشة ضبابية مع رسالتك.
          لوحة الأدمن تبقى مفتوحة دائماً.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 transition ${
              settings.enabled
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <div className="text-right">
              <p className="text-sm font-black">{settings.enabled ? "الوضع مفعّل — الموقع مقفل للجمهور" : "الوضع متوقف — الموقع مفتوح"}</p>
              <p className="mt-1 text-xs font-semibold opacity-80">اضغط للتبديل، ثم احفظ</p>
            </div>
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${settings.enabled ? "bg-amber-500 text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
              {settings.enabled ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </span>
          </button>

          <label className="mt-6 block">
            <span className="mb-2 block text-xs font-black text-slate-500">العنوان</span>
            <input
              value={settings.title}
              onChange={(e) => setSettings((prev) => ({ ...prev, title: e.target.value }))}
              maxLength={80}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-primary"
              placeholder="قريباً"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-black text-slate-500">الرسالة</span>
            <textarea
              value={settings.message}
              onChange={(e) => setSettings((prev) => ({ ...prev, message: e.target.value }))}
              maxLength={280}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 text-slate-800 outline-none focus:border-primary"
              placeholder="ترقّبوا إطلاق ملامح في فلسطين"
            />
          </label>

          {error ? <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p> : null}
          {saved ? <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">تم الحفظ بنجاح</p> : null}

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#295f59] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#1f4a45] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الإعداد
          </button>

          {settings.updatedAt ? (
            <p className="mt-3 text-[11px] font-semibold text-slate-400">
              آخر تحديث: {new Date(settings.updatedAt).toLocaleString("ar-PS")}
            </p>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a1628] p-8 text-center text-white shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,55,0.18),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(41,95,89,0.35),transparent_45%)]" />
          <div className="relative z-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d4af37] text-[#0a1628]">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="text-[10px] font-black tracking-[0.28em] text-[#e8c86a]">معاينة</p>
            <h2 className="mt-3 font-display text-3xl font-bold">{settings.title || "قريباً"}</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-7 text-white/80">
              {settings.message || "ترقّبوا إطلاق ملامح في فلسطين"}
            </p>
            <p className="mt-8 text-[11px] font-bold text-white/45">
              هكذا ستظهر الرسالة تقريباً على الويب والتطبيق
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

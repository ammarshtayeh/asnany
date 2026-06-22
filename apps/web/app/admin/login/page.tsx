"use client";

import { useState } from "react";
import { Lock, Mail, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full bento-card shine-border p-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            لوحة إدارة ملامح
          </span>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-10 w-10" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-2">تسجيل دخول الإدارة</h1>
          <p className="text-slate-500 mb-6 font-semibold">يرجى إدخال بيانات الاعتماد للوصول للوحة التحكم</p>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm font-bold text-red-600">
              ⚠️ {error}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="form-field pr-12"
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="form-field pr-12"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-malama mt-4 w-full py-4 text-base disabled:opacity-55">
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

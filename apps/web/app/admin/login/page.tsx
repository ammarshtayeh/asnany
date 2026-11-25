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
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] p-4" dir="rtl">
      <div className="z-50 flex w-full items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-md rounded-[1.75rem] border border-[#e8e4dc] bg-white p-6 text-center shadow-soft sm:p-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#eef5f3] px-4 py-1.5 text-xs font-extrabold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            لوحة إدارة ملامح
          </span>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef5f3] text-primary sm:h-20 sm:w-20">
            <Lock className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>

          <h1 className="mb-2 font-display text-2xl font-extrabold text-slate-900">تسجيل دخول الإدارة</h1>
          <p className="mb-6 font-semibold text-slate-500">يرجى إدخال بيانات الاعتماد للوصول للوحة التحكم</p>

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

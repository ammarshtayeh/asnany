"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      {/* Hide the sidebar via CSS for this specific page if needed, but since it's a demo we'll just center it.
          We add absolute inset-0 to cover the layout if it has a sidebar */}
      <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-50">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2">تسجيل دخول الإدارة</h1>
          <p className="text-slate-500 mb-6">يرجى إدخال بيانات الاعتماد للوصول للوحة التحكم</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold mb-6 text-right">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-right"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-right"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all mt-4 disabled:opacity-55"
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail, Stethoscope } from "lucide-react";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/doctor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "تعذر تسجيل الدخول");
      return;
    }

    router.push("/doctor/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white" dir="rtl">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <section>
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/50 text-white shadow-lg shadow-sky-500/25">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
            بوابة الطبيب لإدارة العيادة والحجوزات.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-9 text-slate-300">
            حدث الدوام، أعلن أنك موجود في العيادة، تابع حجوزات المرضى، وشاهد بياناتهم الأساسية من لوحة منفصلة عن لوحة الأدمن.
          </p>
          <Link href="/" className="mt-8 inline-flex rounded-xl border border-white/15 px-5 py-3 text-sm font-black text-slate-200 hover:bg-white/10">
            العودة للموقع
          </Link>
        </section>

        <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
          <p className="text-sm font-black text-primary">دخول الطبيب</p>
          <h2 className="mt-1 text-3xl font-black">أدخل بيانات حسابك</h2>
          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="doctor@example.com"
                className="w-full bg-transparent py-4 text-left text-sm font-bold outline-none"
                dir="ltr"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white">
              <LockKeyhole className="h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-transparent py-4 text-sm font-bold outline-none"
              />
            </label>
          </div>
          {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-primary disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول لوحة الطبيب"}
          </button>
        </form>
      </div>
    </main>
  );
}

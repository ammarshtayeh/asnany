"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail, Stethoscope, ArrowRight } from "lucide-react";
import { MalamihLogoMark } from "@/components/MalamihLogoMark";

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

    try {
      const res = await fetch("/api/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "تعذر تسجيل الدخول");
        return;
      }

      router.push("/doctor/dashboard");
    } catch {
      setError("تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-4 py-8 font-sans text-slate-900 sm:py-12" dir="rtl">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <section className="order-2 text-right lg:order-1">
          <div className="mb-5 flex items-center gap-3">
            <MalamihLogoMark size={120} className="h-14 w-14" />
            <span className="font-brand text-lg font-bold tracking-[0.2em] text-primary">MALAMIH</span>
          </div>
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5f3] text-primary">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="max-w-xl font-display text-3xl font-extrabold leading-[1.25] tracking-tight text-[#0a1628] sm:text-4xl md:text-5xl">
            بوابة الطبيب لإدارة العيادة والحجوزات.
          </h1>
          <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
            حدث الدوام، أعلن أنك موجود في العيادة، تابع حجوزات المرضى، وشاهد بياناتهم الأساسية من لوحة منفصلة عن لوحة الأدمن.
          </p>
          <Link href="/" className="btn-malama-outline mt-8 inline-flex">
            <ArrowRight className="h-4 w-4" />
            العودة للموقع
          </Link>
        </section>

        <form
          onSubmit={submit}
          className="order-1 rounded-[1.75rem] border border-[#e8e4dc] bg-white p-6 shadow-soft sm:p-8 lg:order-2"
        >
          <p className="section-kicker">دخول الطبيب</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-950 sm:text-3xl">أدخل بيانات حسابك</h2>
          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#faf8f5] px-4 transition focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
              <Mail className="h-5 w-5 text-primary/70" />
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
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#faf8f5] px-4 transition focus-within:border-primary/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
              <LockKeyhole className="h-5 w-5 text-primary/70" />
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
          {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn-malama mt-6 w-full py-4 disabled:opacity-60">
            {loading ? "جاري الدخول..." : "دخول لوحة الطبيب"}
          </button>
        </form>
      </div>
    </main>
  );
}

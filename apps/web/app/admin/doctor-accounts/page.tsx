"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck } from "lucide-react";
import { Doctor } from "@/lib/types";

type Account = {
  id: string;
  doctor_id: string;
  email: string;
  is_active: boolean;
  doctors?: { name?: string; city?: string; phone?: string };
};

export default function DoctorAccountsAdminPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [doctorsRes, accountsRes] = await Promise.all([
      fetch("/api/admin/doctors/list"),
      fetch("/api/admin/doctor-accounts"),
    ]);
    const doctorsData = await doctorsRes.json();
    const accountsData = await accountsRes.json();
    setDoctors(doctorsData.doctors || []);
    setAccounts(accountsData.accounts || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/admin/doctor-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor_id: doctorId, email, password, is_active: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "تعذر إنشاء الحساب");
      return;
    }
    setDoctorId("");
    setEmail("");
    setPassword("");
    load();
  };

  const toggleActive = async (account: Account) => {
    const res = await fetch("/api/admin/doctor-accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: account.id, is_active: !account.is_active }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "تعذر تحديث الحساب");
      return;
    }
    setAccounts((current) => current.map((item) => (item.id === account.id ? { ...item, is_active: !item.is_active } : item)));
  };

  return (
    <div className="p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-black text-slate-950">
          <KeyRound className="h-8 w-8 text-sky-600" />
          حسابات دخول الأطباء
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500">
          هذه الحسابات منفصلة عن الأدمن، وتدخل فقط إلى لوحة الطبيب الخاصة بالحجوزات والدوام.
        </p>
      </header>

      <form onSubmit={createAccount} className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
          <Plus className="h-5 w-5 text-sky-600" />
          إنشاء أو تحديث حساب طبيب
        </h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select
            required
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none"
          >
            <option value="">اختر الطبيب</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.city}
              </option>
            ))}
          </select>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="doctor@example.com"
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-bold outline-none"
            dir="ltr"
          />
          <input
            type="text"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="كلمة مرور مؤقتة"
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none"
          />
          <button className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-sky-600">
            حفظ الحساب
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black text-slate-950">الحسابات الحالية</h2>
        </div>
        {loading ? (
          <div className="p-8">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-black text-slate-700">لا توجد حسابات أطباء بعد.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <article key={account.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-950">{account.doctors?.name || "طبيب"}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500" dir="ltr">{account.email}</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">{account.doctors?.city} {account.doctors?.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(account)}
                  className={`min-h-11 rounded-xl px-4 text-sm font-black ${
                    account.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {account.is_active ? "مفعل" : "معطل"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

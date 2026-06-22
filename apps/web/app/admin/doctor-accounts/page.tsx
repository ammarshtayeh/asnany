"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, ShieldCheck, Trash2, RefreshCw, Eye, EyeOff, Mail, User } from "lucide-react";
import { Doctor } from "@/lib/types";

type Account = {
  id: string;
  doctor_id: string;
  email: string;
  password?: string;
  is_active: boolean;
  doctors?: { name?: string; city?: string; phone?: string };
};

export default function DoctorAccountsAdminPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

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
    setSubmitting(true);
    const res = await fetch("/api/admin/doctor-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor_id: doctorId, email, password, is_active: true }),
    });
    const data = await res.json();
    setSubmitting(false);
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
    setAccounts((current) =>
      current.map((item) => (item.id === account.id ? { ...item, is_active: !item.is_active } : item))
    );
  };

  const deleteAccount = async (account: Account) => {
    if (!confirm(`هل أنت متأكد من حذف حساب ${account.doctors?.name || account.email}؟`)) return;
    const res = await fetch("/api/admin/doctor-accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: account.id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "تعذر حذف الحساب");
      return;
    }
    setAccounts((current) => current.filter((item) => item.id !== account.id));
  };

  const updatePassword = async (accountId: string) => {
    if (!editPassword || editPassword.length < 6) {
      alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    const res = await fetch("/api/admin/doctor-accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: accountId, password: editPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "تعذر تغيير كلمة المرور");
      return;
    }
    setEditingId(null);
    setEditPassword("");
    alert("تم تغيير كلمة المرور بنجاح");
  };

  const doctorsWithAccount = new Set(accounts.map((a) => a.doctor_id));

  return (
    <div className="p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-black text-slate-950">
          <KeyRound className="h-8 w-8 text-sky-600" />
          إدارة حسابات دخول الأطباء
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500">
          كل طبيب يمكنه الدخول بإيميله وكلمة مروره للوحته الخاصة لمتابعة حجوزاته.
        </p>
      </header>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-black text-slate-950">{accounts.length}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">حساب مُسجَّل</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{accounts.filter((a) => a.is_active).length}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">حساب مفعّل</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-black text-amber-600">{doctors.length - doctorsWithAccount.size}</p>
          <p className="mt-1 text-sm font-bold text-slate-500">طبيب بدون حساب</p>
        </div>
      </div>

      {/* Create Account Form */}
      <form onSubmit={createAccount} className="mb-8 bento-card p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-950">
          <Plus className="h-5 w-5 text-sky-600" />
          إنشاء حساب طبيب جديد
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-black text-slate-500">اختر الطبيب</label>
            <select
              required
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="w-full min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-sky-300"
            >
              <option value="">اختر الطبيب</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.city}
                  {doctorsWithAccount.has(doctor.id) ? " ✓" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-black text-slate-500">البريد الإلكتروني</label>
            <label className="flex items-center gap-2 min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="doctor@example.com"
                className="w-full bg-transparent text-sm font-bold outline-none"
                dir="ltr"
              />
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs font-black text-slate-500">كلمة المرور</label>
            <label className="flex items-center gap-2 min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-300 focus-within:bg-white">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="كلمة مرور مؤقتة"
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-700">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-sky-600 disabled:opacity-60 transition"
            >
              {submitting ? "جاري الحفظ..." : "إنشاء الحساب"}
            </button>
          </div>
        </div>
      </form>

      {/* Accounts List */}
      <section className="bento-card shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-950">الحسابات الحالية ({accounts.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-black text-slate-700">لا توجد حسابات أطباء بعد.</p>
            <p className="mt-1 text-sm font-semibold text-slate-400">أنشئ أول حساب من الفورم أعلاه.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <article key={account.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50">
                      <User className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">
                        د. {account.doctors?.name || "—"}
                      </h3>
                      <p className="mt-0.5 text-sm font-bold text-sky-600" dir="ltr">{account.email}</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-400">
                        {account.doctors?.city} {account.doctors?.phone ? `· ${account.doctors.phone}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => toggleActive(account)}
                      className={`min-h-10 rounded-xl px-4 text-sm font-black transition ${
                        account.is_active
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {account.is_active ? "مفعّل" : "معطّل"}
                    </button>

                    {/* Change Password */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(editingId === account.id ? null : account.id);
                        setEditPassword("");
                      }}
                      className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-sky-200 hover:text-sky-700 transition flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      كلمة المرور
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => deleteAccount(account)}
                      className="min-h-10 rounded-xl border border-rose-100 bg-rose-50 px-4 text-sm font-black text-rose-700 hover:bg-rose-100 transition flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                </div>

                {/* Password change panel */}
                {editingId === account.id ? (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-sky-300">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="كلمة المرور الجديدة (6 أحرف على الأقل)"
                        className="w-full bg-transparent py-3 text-sm font-bold outline-none"
                      />
                      <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="text-slate-400">
                        {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </label>
                    <button
                      type="button"
                      onClick={() => updatePassword(account.id)}
                      className="min-h-12 rounded-xl bg-sky-600 px-5 text-sm font-black text-white hover:bg-sky-700 transition"
                    >
                      حفظ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Doctors without accounts */}
      {doctors.filter((d) => !doctorsWithAccount.has(d.id)).length > 0 && (
        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="mb-3 text-base font-black text-amber-800">
            أطباء بدون حساب دخول ({doctors.filter((d) => !doctorsWithAccount.has(d.id)).length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {doctors
              .filter((d) => !doctorsWithAccount.has(d.id))
              .map((d) => (
                <span key={d.id} className="rounded-xl bg-white border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700">
                  د. {d.name} - {d.city}
                </span>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

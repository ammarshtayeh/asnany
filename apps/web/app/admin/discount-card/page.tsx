"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, PauseCircle, RefreshCw, Trash2, XCircle } from "lucide-react";

type MemberStatus = "pending" | "active" | "inactive" | "rejected" | "expired";

type Member = {
  id: string;
  full_name: string;
  phone: string;
  city?: string | null;
  status: MemberStatus;
  notes?: string | null;
  expires_at?: string | null;
  created_at?: string;
};

const STATUS_COPY: Record<MemberStatus, { label: string; style: string }> = {
  pending: { label: "بانتظار المتابعة", style: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "مشترك فعال", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "غير فعال", style: "bg-slate-100 text-slate-700 border-slate-200" },
  rejected: { label: "مرفوض", style: "bg-rose-50 text-rose-700 border-rose-200" },
  expired: { label: "منتهي", style: "bg-orange-50 text-orange-700 border-orange-200" },
};

export default function AdminDiscountCardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [storageReady, setStorageReady] = useState(true);

  const stats = useMemo(() => ({
    total: members.length,
    pending: members.filter((member) => member.status === "pending").length,
    active: members.filter((member) => member.status === "active").length,
  }), [members]);

  const loadMembers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discount-card-members");
    const data = await res.json();
    setMembers(Array.isArray(data.members) ? data.members : []);
    setStorageReady(data.storageReady !== false);
    setLoading(false);
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const updateMember = async (member: Member, status: MemberStatus) => {
    const expiresAt = status === "active"
      ? member.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : member.expires_at || null;

    const res = await fetch("/api/admin/discount-card-members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...member, status, expires_at: expiresAt }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "تعذر تحديث حالة البطاقة");
      return;
    }
    setMembers((current) => current.map((item) => (item.id === member.id ? data.member : item)));
    setMessage("تم تحديث حالة البطاقة");
  };

  const updateExpiry = async (member: Member, expires_at: string) => {
    const res = await fetch("/api/admin/discount-card-members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...member, expires_at }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "تعذر تعديل تاريخ الانتهاء");
      return;
    }
    setMembers((current) => current.map((item) => (item.id === member.id ? data.member : item)));
  };

  const removeMember = async (id: string) => {
    if (!confirm("حذف طلب البطاقة؟")) return;
    const res = await fetch("/api/admin/discount-card-members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "تعذر حذف الطلب");
      return;
    }
    setMembers((current) => current.filter((member) => member.id !== id));
  };

  return (
    <div className="portal-page" dir="rtl">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black text-blue-600">بطاقة الخصم</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">طلبات ومشتركي بطاقة الخصم</h1>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-7 text-slate-500">
            الطلب خفيف: المستخدم يرسل الاسم والهاتف والمدينة، والأدمن يفعّل البطاقة. حالة الاشتراك تظهر للطبيب والأدمن داخل المواعيد.
          </p>
        </div>
        <button
          onClick={loadMembers}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث
        </button>
      </header>

      {!storageReady ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          جدول طلبات بطاقة الخصم غير مفعّل بعد. شغّل migration الجديد حتى يتم حفظ الطلبات.
        </div>
      ) : null}

      {message ? <div className="mb-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">{message}</div> : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="كل الطلبات" value={stats.total} />
        <Stat label="بانتظار المتابعة" value={stats.pending} tone="amber" />
        <Stat label="مشترك فعال" value={stats.active} tone="emerald" />
      </div>

      <section className="bento-card overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-xl font-black text-slate-950">سجل بطاقة الخصم</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">جاري التحميل...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="font-black text-slate-700">لا توجد طلبات بطاقة حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const status = STATUS_COPY[member.status] || STATUS_COPY.pending;
              return (
                <article key={member.id} className="p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">{member.full_name}</h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${status.style}`}>{status.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-500">
                        <span dir="ltr">{member.phone}</span>
                        <span>{member.city || "مدينة غير محددة"}</span>
                        {member.created_at ? <span>{new Date(member.created_at).toLocaleDateString("ar")}</span> : null}
                      </div>
                      {member.notes ? <p className="mt-2 text-xs font-semibold text-slate-500">{member.notes}</p> : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
                        ينتهي
                        <input
                          type="date"
                          value={member.expires_at || ""}
                          onChange={(event) => updateExpiry(member, event.target.value)}
                          className="bg-transparent text-sm font-black text-slate-800 outline-none"
                        />
                      </label>
                      <button onClick={() => updateMember(member, "active")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        تفعيل
                      </button>
                      <button onClick={() => updateMember(member, "inactive")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700">
                        <PauseCircle className="h-4 w-4" />
                        إيقاف
                      </button>
                      <button onClick={() => updateMember(member, "rejected")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-700">
                        <XCircle className="h-4 w-4" />
                        رفض
                      </button>
                      <button onClick={() => removeMember(member.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "amber" | "emerald" }) {
  const toneClass = tone === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" : tone === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-950 border-slate-200";
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-sm font-bold opacity-80">{label}</p>
    </div>
  );
}

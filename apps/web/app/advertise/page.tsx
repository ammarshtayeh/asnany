"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, CheckCircle, Image as ImageIcon, Megaphone, MessageSquare, Send, Sparkles } from "lucide-react";
import AdminImageUpload from "@/components/AdminImageUpload";
import { SITE_SUPPORT_WHATSAPP, whatsappHref } from "@/lib/site-contact";

const whatsappNumber = SITE_SUPPORT_WHATSAPP;

export default function AdvertiseWithUs() {
  const [advertiserName, setAdvertiserName] = useState("");
  const [advertiserType, setAdvertiserType] = useState("عيادة أسنان");
  const [adNature, setAdNature] = useState("بنر على الصفحة الرئيسية");
  const [city, setCity] = useState("رام الله");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const whatsappHref = useMemo(() => {
    const text = [
      "مرحباً ملامح، أرغب بعمل إعلان.",
      advertiserName ? `اسم المعلن: ${advertiserName}` : "",
      `نوع المعلن: ${advertiserType}`,
      `طبيعة الإعلان: ${adNature}`,
      `المدينة: ${city}`,
      phone ? `رقم التواصل: ${phone}` : "",
      budget ? `الميزانية المتوقعة: ${budget}` : "",
      message ? `تفاصيل: ${message}` : "",
      imageUrl ? `صورة/بنر: ${imageUrl}` : "",
    ].filter(Boolean).join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [adNature, advertiserName, advertiserType, budget, city, imageUrl, message, phone]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#f7fafc] pb-24 pt-24" dir="rtl">
      {/* Back button */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
        >
          <ArrowRight className="w-4 h-4" />
          الرئيسية
        </Link>
      </div>
      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:px-8">
        <div className="flex flex-col justify-center text-right">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">
            <Megaphone className="h-4 w-4" />
            أعلن مع ملامح
          </span>
          <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-6xl">
            إعلان واضح، جمهور مهتم، وتواصل مباشر.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
            اختر طبيعة الإعلان: عيادة، عرض، منتج، وظيفة، أو بنر. املأ الاستمارة الإلكترونية أو تواصل مباشرة على واتساب.
          </p>
          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
            <Value icon={BadgePercent} title="عروض" />
            <Value icon={ImageIcon} title="بنرات" />
            <Value icon={MessageSquare} title="واتساب مباشر" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-xl md:p-7">
          <div className="mb-5">
            <p className="text-sm font-black text-sky-600">استمارة الإعلان</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">احكيلنا شو الإعلان وطبيعته</h2>
          </div>

          <div className="grid gap-4">
            <Field label="اسم المعلن / العيادة / الشركة">
              <input value={advertiserName} onChange={(e) => setAdvertiserName(e.target.value)} required className="form-field" placeholder="مثال: عيادة د. أحمد" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نوع المعلن">
                <select value={advertiserType} onChange={(e) => setAdvertiserType(e.target.value)} className="form-field">
                  <option>عيادة أسنان</option>
                  <option>عيادة تخصصية (عيون/أنف وأذن وحنجرة/جلدية...)</option>
                  <option>طبيب مستقل</option>
                  <option>مركز تجميل</option>
                  <option>مختبر أسنان</option>
                  <option>شركة/مورد</option>
                  <option>إعلان وظيفة</option>
                </select>
              </Field>
              <Field label="طبيعة الإعلان">
                <select value={adNature} onChange={(e) => setAdNature(e.target.value)} className="form-field">
                  <option>بنر على الصفحة الرئيسية</option>
                  <option>عرض وخصم</option>
                  <option>إعلان في سوق ملامح</option>
                  <option>ترويج طبيب/عيادة</option>
                  <option>إعلان وظيفة</option>
                  <option>حملة شهرية</option>
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="المدينة">
                <input value={city} onChange={(e) => setCity(e.target.value)} className="form-field" />
              </Field>
              <Field label="رقم التواصل">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="form-field text-left" placeholder="059..." />
              </Field>
              <Field label="ميزانية تقريبية">
                <input value={budget} onChange={(e) => setBudget(e.target.value)} className="form-field" placeholder="مثال: 300 شيكل" />
              </Field>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <AdminImageUpload label="رفع صورة الإعلان أو البانر" value={imageUrl} folder="advertisements" onChange={setImageUrl} />
            </div>

            <Field label="تفاصيل الإعلان">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="form-field resize-none"
                placeholder="اكتب هدف الإعلان، مدة الحملة، الفئة المستهدفة، وأي ملاحظات..."
              />
            </Field>
          </div>

          {submitted ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
              تم تجهيز الطلب وفتح واتساب لإرساله مباشرة.
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-black text-white hover:bg-sky-600">
              <Send className="h-4 w-4" />
              إرسال الاستمارة عبر واتساب
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-sm font-black text-white hover:bg-emerald-700"
            >
              <MessageSquare className="h-4 w-4" />
              تواصل مباشر: {whatsappNumber}
            </a>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-8 max-w-[1400px] px-4 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {["بنر الصفحة الرئيسية", "إعلان عرض طبي", "إعلان سوق أو وظيفة"].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm">
              <CheckCircle className="mb-3 h-6 w-6 text-emerald-500" />
              <h3 className="text-lg font-black text-slate-950">{item}</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">نجهز الإعلان بصيغة مناسبة للموقع والتطبيق مع توجيه واضح للتواصل.</p>
            </div>
          ))}
        </div>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-sky-600">
          <ArrowRight className="h-4 w-4" />
          العودة للرئيسية
        </Link>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Value({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <Icon className="mx-auto mb-2 h-6 w-6 text-sky-600" />
      <p className="text-sm font-black text-slate-800">{title}</p>
    </div>
  );
}

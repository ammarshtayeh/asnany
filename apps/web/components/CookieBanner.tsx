"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "malamih_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new Event("malamih-cookie-consent"));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl lg:bottom-6">
      <p className="text-sm font-semibold leading-7 text-slate-600">
        نستخدم ملفات تعريف الارتباط والتخزين المحلي لتحسين تجربتك وإدارة الجلسات والإشعارات.{" "}
        <Link href="/privacy" className="font-black text-primary underline-offset-2 hover:underline">
          سياسة الخصوصية
        </Link>
      </p>
      <button
        type="button"
        onClick={accept}
        className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-primary"
      >
        موافق
      </button>
    </div>
  );
}

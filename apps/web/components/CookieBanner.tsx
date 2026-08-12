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
    <div className="fixed bottom-20 left-4 right-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-[#0a1628]/92 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:bottom-6">
      <p className="text-sm font-semibold leading-7 text-white/80">
        نستخدم ملفات تعريف الارتباط والتخزين المحلي لتحسين تجربتك وإدارة الجلسات والإشعارات.{" "}
        <Link href="/privacy" className="font-black text-[#e8c86a] underline-offset-2 hover:underline">
          سياسة الخصوصية
        </Link>
      </p>
      <button
        type="button"
        onClick={accept}
        className="mt-3 rounded-xl bg-[#265F59] px-4 py-2 text-sm font-black text-white transition hover:bg-[#2f6f68]"
      >
        موافق
      </button>
    </div>
  );
}

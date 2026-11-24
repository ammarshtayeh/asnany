"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MalamihLogoMark } from "@/components/MalamihLogoMark";

type PrelaunchState = {
  enabled: boolean;
  title: string;
  message: string;
};

const FALLBACK: PrelaunchState = {
  enabled: false,
  title: "قريباً",
  message: "ترقّبوا إطلاق ملامح في فلسطين",
};

export default function ComingSoonGate() {
  const pathname = usePathname() || "";
  const [settings, setSettings] = useState<PrelaunchState>(FALLBACK);
  const [ready, setReady] = useState(false);

  // Admin area stays fully usable while the public site (and doctor portal) are gated.
  const bypass = pathname.startsWith("/admin");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/site/prelaunch", { cache: "no-store" });
        if (!response.ok) throw new Error("failed");
        const data = await response.json();
        if (cancelled) return;
        setSettings({
          enabled: Boolean(data.enabled),
          title: String(data.title || FALLBACK.title),
          message: String(data.message || FALLBACK.message),
        });
      } catch {
        if (!cancelled) setSettings(FALLBACK);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (bypass || !ready || !settings.enabled) return null;

  return (
    <div
      className="coming-soon-gate fixed inset-0 z-[200] flex items-center justify-center overflow-hidden px-6"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={settings.title}
    >
      <div className="coming-soon-blur absolute inset-0" />
      <div className="coming-soon-wash absolute inset-0" />
      <div className="coming-soon-orb coming-soon-orb-a" />
      <div className="coming-soon-orb coming-soon-orb-b" />

      <div className="coming-soon-card relative z-10 w-full max-w-lg text-center">
        <div className="coming-soon-logo mx-auto mb-6">
          <MalamihLogoMark size={96} className="h-24 w-24 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.45)]" priority />
        </div>
        <p className="coming-soon-eyebrow mb-3 text-[11px] font-black tracking-[0.28em] text-[#e8c86a]">MALAMIH.PS</p>
        <h1 className="coming-soon-title font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {settings.title}
        </h1>
        <p className="coming-soon-message mx-auto mt-4 max-w-md text-base font-semibold leading-8 text-white/85 sm:text-lg">
          {settings.message}
        </p>
        <div className="coming-soon-line mx-auto mt-8 h-px w-24 bg-gradient-to-l from-transparent via-[#d4af37] to-transparent" />
      </div>
    </div>
  );
}

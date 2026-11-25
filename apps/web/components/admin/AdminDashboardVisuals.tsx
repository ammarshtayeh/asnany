"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { AdminDashboardStats } from "@/lib/admin-dashboard";
import { AnimatedCounter } from "@/components/AnimatedCounter";

type Props = {
  stats: AdminDashboardStats;
};

function clampPct(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function Donut({ verified, pending }: { verified: number; pending: number }) {
  const total = Math.max(verified + pending, 1);
  const verifiedPct = (verified / total) * 100;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const verifiedLen = (verifiedPct / 100) * circumference;
  const pendingLen = circumference - verifiedLen;

  return (
    <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#eef2f0" strokeWidth="16" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#295f59"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${verifiedLen} ${circumference}`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${verifiedLen} ${circumference}` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#d4af37"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${pendingLen} ${circumference}`}
          strokeDashoffset={-verifiedLen}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${pendingLen} ${circumference}` }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] font-bold text-slate-500 sm:text-xs">نسبة التوثيق</p>
        <p className="font-display text-xl font-extrabold text-slate-950 sm:text-2xl">
          <AnimatedCounter target={Math.round(verifiedPct)} duration={1200} />%
        </p>
      </div>
    </div>
  );
}

function TrackingBars({ items }: { items: Array<{ label: string; value: number; color: string }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => {
        const width = clampPct((item.value / max) * 100);
        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-extrabold sm:text-xs">
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="shrink-0 text-slate-950">
                <AnimatedCounter target={item.value} duration={1000 + index * 120} />
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#eef2f0] sm:h-3">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.9, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const d = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 36 - (value / max) * 28;
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full sm:h-12" preserveAspectRatio="none">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.25 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function AdminDashboardVisuals({ stats }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bars = useMemo(
    () => [
      { label: "الأطباء", value: stats.totalDoctors, color: "#295f59" },
      { label: "الحجوزات", value: stats.totalAppointments, color: "#3d7a73" },
      { label: "حجوزات معلّقة", value: stats.pendingAppointments, color: "#d4af37" },
      { label: "الإعلانات النشطة", value: stats.activeAds, color: "#1a433e" },
      { label: "المتاجر", value: stats.activeStores, color: "#0a1628" },
      { label: "الخدمات", value: stats.totalServices, color: "#5a8f88" },
    ],
    [stats],
  );

  const sparkValues = useMemo(
    () => [
      Math.max(stats.pendingDoctors, 1),
      Math.max(stats.verifiedDoctors, 1),
      Math.max(stats.totalAppointments, 1),
      Math.max(stats.pendingAppointments, 1),
      Math.max(stats.activeAds + stats.activeStores, 1),
      Math.max(stats.totalServices, 1),
      Math.max(stats.totalDoctors, 1),
    ],
    [stats],
  );

  if (!mounted) {
    return (
      <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-5 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[1.5rem] bg-white sm:h-72" />
        <div className="h-64 animate-pulse rounded-[1.5rem] bg-white sm:h-72" />
      </div>
    );
  }

  return (
    <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <motion.section
        className="rounded-[1.5rem] border border-[#e8e4dc] bg-white p-4 shadow-soft sm:p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="section-kicker">تتبع التوثيق</p>
        <h2 className="mt-1 font-display text-lg font-extrabold text-slate-950 sm:text-xl">حالة الأطباء في الدليل</h2>
        <div className="mt-4">
          <Donut verified={stats.verifiedDoctors} pending={stats.pendingDoctors} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-2xl bg-[#eef5f3] px-3 py-3 sm:px-4">
            <p className="text-[10px] font-bold text-primary sm:text-[11px]">موثّقون</p>
            <p className="mt-1 font-display text-lg font-extrabold text-slate-950 sm:text-xl">
              <AnimatedCounter target={stats.verifiedDoctors} duration={1100} />
            </p>
          </div>
          <div className="rounded-2xl bg-[#f7f1e0] px-3 py-3 sm:px-4">
            <p className="text-[10px] font-bold text-[#8a7020] sm:text-[11px]">بانتظار التوثيق</p>
            <p className="mt-1 font-display text-lg font-extrabold text-slate-950 sm:text-xl">
              <AnimatedCounter target={stats.pendingDoctors} duration={1100} />
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="rounded-[1.5rem] border border-[#e8e4dc] bg-white p-4 shadow-soft sm:p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div className="min-w-0">
            <p className="section-kicker">تتبع النشاط</p>
            <h2 className="mt-1 font-display text-lg font-extrabold text-slate-950 sm:text-xl">مؤشرات المنصة الحالية</h2>
          </div>
          <div className="w-28 sm:w-36">
            <Sparkline values={sparkValues} color="#295f59" />
          </div>
        </div>
        <TrackingBars items={bars} />
      </motion.section>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TickerItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  background_color?: string | null;
  text_color?: string | null;
};

export default function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/ticker")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const active = useMemo(() => items[index] || null, [items, index]);
  if (!active) return null;

  const content = (
    <div
      className="relative flex h-12 items-center overflow-hidden border-b border-white/10"
      style={{ backgroundColor: active.background_color || "#0f172a", color: active.text_color || "#ffffff" }}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/20 to-transparent" />
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4" dir="rtl">
        <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black">آخر الأخبار</span>
        {active.image_url ? (
          <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15">
            <Image src={active.image_url} alt="" fill className="object-cover" sizes="48px" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="animate-[ticker_18s_linear_infinite] whitespace-nowrap text-sm font-black">
            <span>{active.title}</span>
            {active.subtitle ? <span className="mx-4 opacity-80">• {active.subtitle}</span> : null}
            <span className="mx-8">{active.title}</span>
            {active.subtitle ? <span className="opacity-80">• {active.subtitle}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (active.link_url) {
    return (
      <Link href={active.link_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

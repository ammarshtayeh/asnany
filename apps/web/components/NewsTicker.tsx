"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import type { NewsTickerItem } from "@pal-dental/shared";
import { filterActiveTickerItems } from "@pal-dental/shared";

const TICKER_HEIGHT_PX = 68;
const NAVBAR_HEIGHT_PX = 72;
const ROTATE_MS = 5000;

export default function NewsTicker() {
  const [items, setItems] = useState<NewsTickerItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ticker", { cache: "no-store" });
      const data = await res.json();
      const rows = Array.isArray(data?.items) ? (data.items as NewsTickerItem[]) : [];
      setItems(filterActiveTickerItems(rows));
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    const height = loaded && items.length > 0 ? `${TICKER_HEIGHT_PX}px` : "0px";
    document.documentElement.style.setProperty("--ticker-height", height);
    document.documentElement.style.setProperty("--navbar-height", `${NAVBAR_HEIGHT_PX}px`);
    return () => {
      document.documentElement.style.setProperty("--ticker-height", "0px");
    };
  }, [items.length, loaded]);

  const active = useMemo(() => items[index] || null, [items, index]);

  const go = (direction: 1 | -1) => {
    if (!items.length) return;
    setIndex((current) => (current + direction + items.length) % items.length);
  };

  if (!loaded || !active) return null;

  const textColor = active.text_color || "#ffffff";
  const bg = active.background_color || "#0a1628";

  const inner = (
    <div
      className="relative flex h-[68px] items-center overflow-hidden border-b border-white/10 shadow-[0_8px_24px_-12px_rgba(10,22,40,0.45)]"
      style={{ backgroundColor: bg, color: textColor }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/15 via-transparent to-black/10" />

      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-3 sm:px-4" dir="rtl">
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-black sm:inline-flex">
          <Megaphone className="h-3 w-3" />
          إعلان مميز
        </span>

        {active.image_url ? (
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-md">
            <Image src={active.image_url} alt="" fill className="object-cover" sizes="64px" unoptimized />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Megaphone className="h-5 w-5 opacity-90" />
          </div>
        )}

        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-black sm:text-[15px]">{active.title}</p>
          {active.subtitle ? (
            <p className="truncate text-[11px] font-bold opacity-85 sm:text-xs">{active.subtitle}</p>
          ) : null}
        </div>

        {items.length > 1 ? (
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                go(1);
              }}
              className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
              aria-label="السابق"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                go(-1);
              }}
              className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20"
              aria-label="التالي"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {items.length > 1 ? (
        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
          {items.map((item, i) => (
            <span
              key={item.id}
              className={`h-1 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/35"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="fixed left-0 right-0 z-40" style={{ top: NAVBAR_HEIGHT_PX }}>
      {active.link_url ? (
        <Link href={active.link_url} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

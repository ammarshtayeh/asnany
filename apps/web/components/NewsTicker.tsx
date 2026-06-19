"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import type { NewsTickerItem } from "@pal-dental/shared";
import { TICKER_ROTATE_MS, filterActiveTickerItems, getTickerPresentation } from "@pal-dental/shared";

const TICKER_HEIGHT_PX = 68;
const NAVBAR_HEIGHT_PX = 72;

export default function NewsTicker() {
  const pathname = usePathname() || "";
  const [items, setItems] = useState<NewsTickerItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [fading, setFading] = useState(false);

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
    const timer = setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setFading(false);
      }, 220);
    }, TICKER_ROTATE_MS);
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
  const style = useMemo(
    () => (active ? getTickerPresentation(active, index) : null),
    [active, index],
  );

  const go = (direction: 1 | -1) => {
    if (!items.length) return;
    setFading(true);
    window.setTimeout(() => {
      setIndex((current) => (current + direction + items.length) % items.length);
      setFading(false);
    }, 180);
  };

  if (pathname.startsWith("/admin") || pathname.startsWith("/doctor")) return null;
  if (!loaded || !active || !style) return null;

  const inner = (
    <div
      className="relative flex h-[68px] items-center overflow-hidden border-b border-white/10 shadow-[0_8px_24px_-12px_rgba(10,22,40,0.45)] transition-opacity duration-300"
      style={{ color: style.textColor, opacity: fading ? 0.15 : 1 }}
    >
      {style.useImageBackdrop && active.image_url ? (
        <>
          <Image
            src={active.image_url}
            alt=""
            fill
            className="object-cover scale-110 blur-[6px] brightness-75"
            sizes="100vw"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(270deg, ${style.backgroundColor}f2 0%, ${style.backgroundColor}cc 45%, ${style.backgroundColor}e8 100%)`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(270deg, ${style.backgroundColor} 0%, ${style.backgroundColor}ee 55%, ${style.accentColor}33 100%)`,
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-black/5" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center gap-3 px-3 sm:px-4" dir="rtl">
        <span
          className="hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black sm:inline-flex"
          style={{ backgroundColor: `${style.accentColor}33`, color: style.textColor }}
        >
          <Megaphone className="h-3 w-3" style={{ color: style.accentColor }} />
          إعلان مميز
        </span>

        {active.image_url ? (
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border-2 shadow-lg" style={{ borderColor: `${style.accentColor}55` }}>
            <Image src={active.image_url} alt="" fill className="object-cover" sizes="64px" unoptimized />
          </div>
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${style.accentColor}28` }}
          >
            <Megaphone className="h-5 w-5 opacity-90" style={{ color: style.accentColor }} />
          </div>
        )}

        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-black sm:text-[15px]">{active.title}</p>
          {active.subtitle ? (
            <p className="truncate text-[11px] font-bold opacity-90 sm:text-xs">{active.subtitle}</p>
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
        <div className="absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
          {items.map((item, i) => (
            <span
              key={item.id}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 16 : 6,
                backgroundColor: i === index ? style.accentColor : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="fixed left-0 right-0 z-40" style={{ top: "var(--navbar-height, 72px)" }}>
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

"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number | string;
  prefix?: string;
  suffix?: string;
  duration?: number; // ms
  className?: string;
}

function parseNum(value: number | string): { num: number; prefix: string; suffix: string } {
  if (typeof value === "number") return { num: value, prefix: "", suffix: "" };
  const match = value.match(/^([+\D]*)(\d[\d,.]*)(.*)$/);
  if (match) {
    return {
      prefix: match[1] || "",
      num: parseFloat(match[2].replace(/,/g, "")),
      suffix: match[3] || "",
    };
  }
  return { num: 0, prefix: "", suffix: value };
}

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2000,
  className = "",
}: AnimatedCounterProps) {
  const { num, prefix: parsedPrefix, suffix: parsedSuffix } = parseNum(target);
  const allPrefix = prefix || parsedPrefix;
  const allSuffix = suffix || parsedSuffix;

  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * num));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [num, duration]);

  return (
    <span ref={ref} className={className}>
      {allPrefix}
      {count.toLocaleString("ar-EG")}
      {allSuffix}
    </span>
  );
}

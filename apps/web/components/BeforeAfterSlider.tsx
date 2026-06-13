"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  altBefore?: string;
  altAfter?: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "قبل",
  afterLabel = "بعد",
  altBefore = "صورة قبل",
  altAfter = "صورة بعد",
  className = "",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // percent
  const isDragging = useRef(false);

  const updateSlider = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const onTouchStart = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging.current) updateSlider(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches[0]) updateSlider(e.touches[0].clientX);
    };
    const onUp = () => { isDragging.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateSlider]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl select-none cursor-ew-resize ${className}`}
      onMouseDown={(e) => updateSlider(e.clientX)}
    >
      {/* After image (full) */}
      <div className="relative w-full h-full">
        <Image src={afterSrc} alt={altAfter} fill className="object-cover" />
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div className="relative w-full h-full" style={{ minWidth: `${(100 / sliderPos) * 100}%` }}>
          <Image src={beforeSrc} alt={altBefore} fill className="object-cover" />
        </div>
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-20"
        style={{ left: `calc(${sliderPos}% - 2px)` }}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] border-2 border-amber-400 cursor-ew-resize z-30 transition-transform hover:scale-110"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <GripVertical className="h-5 w-5 text-amber-500" />
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-3 right-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-black text-white backdrop-blur-sm border border-white/10"
        style={{ opacity: sliderPos < 85 ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {afterLabel}
      </div>
      <div
        className="absolute top-3 left-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-black text-white backdrop-blur-sm border border-white/10"
        style={{ opacity: sliderPos > 15 ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {beforeLabel}
      </div>
    </div>
  );
}

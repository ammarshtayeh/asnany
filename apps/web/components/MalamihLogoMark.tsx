import Image from "next/image";

export const MALAMIH_LOGO_SRC = "/brand/logo-full.png";
export const MALAMIH_LOGO_MARK_SRC = "/brand/logo-mark.png";

type MalamihLogoMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Compact face mark for tight UI (tab-like). Default: full vertical lockup. */
  variant?: "full" | "mark";
};

export function MalamihLogoMark({
  size = 52,
  className = "",
  priority = false,
  variant = "full",
}: MalamihLogoMarkProps) {
  const isMark = variant === "mark";
  const src = isMark ? MALAMIH_LOGO_MARK_SRC : MALAMIH_LOGO_SRC;
  const width = size;
  const height = isMark ? size : Math.round(size * 1.55);

  return (
    <Image
      src={src}
      alt="ملامح — دليل طبي"
      width={width}
      height={height}
      priority={priority}
      className={`object-contain select-none ${isMark ? "rounded-2xl" : ""} ${className}`}
    />
  );
}

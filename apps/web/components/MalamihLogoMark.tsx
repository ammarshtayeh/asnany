import Image from "next/image";

export const MALAMIH_LOGO_SRC = "/brand/logo-full.png";
export const MALAMIH_LOGO_MARK_SRC = "/brand/logo-mark.png";

type MalamihLogoMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  variant?: "full" | "mark";
};

export function MalamihLogoMark({
  size = 56,
  className = "",
  priority = false,
  variant = "mark",
}: MalamihLogoMarkProps) {
  const src = variant === "full" ? MALAMIH_LOGO_SRC : MALAMIH_LOGO_MARK_SRC;

  return (
    <Image
      src={src}
      alt="ملامح"
      width={size}
      height={size}
      priority={priority}
      className={`rounded-full object-contain select-none ${className}`}
    />
  );
}

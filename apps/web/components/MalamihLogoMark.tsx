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
  size = 160,
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
      sizes="(max-width: 640px) 72px, 88px"
      quality={100}
      priority={priority}
      className={`rounded-full object-cover select-none ${className}`}
    />
  );
}

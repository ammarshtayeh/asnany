import Image from "next/image";

const LOGO_SRC = "/brand/logo-full.png";

type MalamihLogoMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function MalamihLogoMark({ size = 44, className = "", priority = false }: MalamihLogoMarkProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="ملامح"
      width={size}
      height={size}
      priority={priority}
      className={`rounded-full border border-slate-200/80 bg-white object-contain shadow-sm select-none ${className}`}
    />
  );
}

export { LOGO_SRC as MALAMIH_LOGO_SRC };

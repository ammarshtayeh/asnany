import Link from "next/link";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import BackButton from "@/components/BackButton";

const MAX_WIDTH: Record<string, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  full: "max-w-[1200px]",
};

type PageShellProps = {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: keyof typeof MAX_WIDTH;
  backHref?: string;
  backLabel?: string;
  useBackButton?: boolean;
  overlap?: boolean;
};

export default function PageShell({
  badge,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  description,
  children,
  maxWidth = "4xl",
  backHref = "/",
  backLabel = "العودة للرئيسية",
  useBackButton = false,
  overlap = false,
}: PageShellProps) {
  return (
    <main className="min-h-screen animate-fade-in bg-transparent pb-24 font-sans" dir="rtl">
      <div className="section-shell pb-2 pt-3 sm:pt-4">
        <section className="page-hero-light relative overflow-hidden px-6 py-10 text-right sm:px-10 sm:py-12 md:py-14">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#eef5f3] to-transparent" />

          <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
            {useBackButton ? (
              <BackButton fallbackHref={backHref} label={backLabel} />
            ) : (
              <Link href={backHref} className="btn-malama-outline px-4 py-2 text-xs sm:text-sm">
                <ArrowRight className="h-4 w-4" />
                {backLabel}
              </Link>
            )}
          </div>

          <div className="relative z-10 max-w-3xl pt-8 sm:pt-2">
            {badge ? (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#eef5f3] px-4 py-1.5 text-xs font-extrabold text-primary">
                <BadgeIcon className="h-3.5 w-3.5" />
                {badge}
              </span>
            ) : null}
            <h1 className="font-display text-3xl font-extrabold leading-[1.2] tracking-tight text-[#0a1628] sm:text-4xl md:text-[2.75rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-8 text-slate-600 sm:text-base">{description}</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className={`section-shell relative z-10 pb-24 ${overlap ? "-mt-8 sm:-mt-10" : "mt-6"}`}>
        <div className={`mx-auto ${MAX_WIDTH[maxWidth]} w-full`}>{children}</div>
      </div>
    </main>
  );
}

export function ContentPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bento-card space-y-8 p-8 text-right md:p-10 ${className}`}>{children}</div>
  );
}

export function FeatureTile({
  icon: Icon,
  title,
  children,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "primary" | "emerald" | "indigo" | "amber" | "sky";
}) {
  const tones = {
    primary: "bg-[#eef5f3] text-primary",
    emerald: "bg-[#e8f2ee] text-[#0c5e47]",
    indigo: "bg-[#f3f0ea] text-[#0a1628]",
    amber: "bg-[#f7f1e0] text-[#8a7020]",
    sky: "bg-[#eef6f3] text-[#1a7a64]",
  };

  return (
    <div className="bento-card p-6 text-center">
      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-extrabold text-slate-900">{title}</h3>
      <div className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">{children}</div>
    </div>
  );
}

export function PromoBanner({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 rounded-[1.5rem] border border-[#e5ebe8] bg-[#eef5f3] p-6 text-center md:p-8">
      {eyebrow ? <p className="text-xs font-extrabold text-primary">{eyebrow}</p> : null}
      <h2 className="mt-2 font-display text-2xl font-extrabold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

export function SplitPageIntro({
  badge,
  title,
  description,
  backHref = "/",
  children,
}: {
  badge?: string;
  title: string;
  description: string;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-shell animate-fade-in pb-8 pt-4">
      <Link href={backHref} className="btn-malama-outline mb-6 inline-flex text-xs">
        <ArrowRight className="h-4 w-4" />
        الرئيسية
      </Link>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,1fr)] lg:items-center">
        <div className="text-right">
          {badge ? (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#eef5f3] px-4 py-1.5 text-xs font-extrabold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {badge}
            </span>
          ) : null}
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

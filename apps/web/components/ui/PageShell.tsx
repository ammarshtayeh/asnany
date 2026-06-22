import Link from "next/link";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import BackButton from "@/components/BackButton";

const MAX_WIDTH: Record<string, string> = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  full: "max-w-[1400px]",
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
  overlap = true,
}: PageShellProps) {
  return (
    <main className="min-h-screen animate-fade-in bg-transparent pb-24 font-sans" dir="rtl">
      <div className="section-shell pb-2 pt-3 sm:pt-4">
        <section className="page-hero-dark relative overflow-hidden px-6 py-12 text-center text-white sm:px-10 sm:py-16 md:py-20">
          <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-amber-500/12 blur-[100px]" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1),transparent_55%)]" />

          <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
            {useBackButton ? (
              <BackButton fallbackHref={backHref} label={backLabel} />
            ) : (
              <Link href={backHref} className="btn-malama-ghost px-4 py-2 text-xs sm:text-sm">
                <ArrowRight className="h-4 w-4" />
                {backLabel}
              </Link>
            )}
          </div>

          <div className="relative z-10 mx-auto max-w-3xl px-2">
            {badge ? (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-black text-[#fde68a] backdrop-blur-sm">
                <BadgeIcon className="h-3.5 w-3.5" />
                {badge}
              </span>
            ) : null}
            <h1 className="text-3xl font-black leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
            {description ? (
              <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-8 text-slate-300 sm:text-base">{description}</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className={`section-shell relative z-10 pb-24 ${overlap ? "-mt-14 sm:-mt-16" : "mt-6"}`}>
        <div className={`mx-auto ${MAX_WIDTH[maxWidth]} w-full`}>{children}</div>
      </div>
    </main>
  );
}

export function ContentPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bento-card shine-border space-y-8 p-8 text-right md:p-12 ${className}`}>{children}</div>
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
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border border-amber-100",
    sky: "bg-sky-50 text-sky-600 border border-sky-100",
  };

  return (
    <div className="bento-card p-6 text-center">
      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-black text-slate-900">{title}</h3>
      <div className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">{children}</div>
    </div>
  );
}

export function PromoBanner({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="shine-border mb-8 rounded-3xl border border-amber-200/80 bg-gradient-to-l from-amber-50 via-white to-white p-6 text-center shadow-bento md:p-8">
      {eyebrow ? <p className="text-xs font-black text-amber-700">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {badge}
            </span>
          ) : null}
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

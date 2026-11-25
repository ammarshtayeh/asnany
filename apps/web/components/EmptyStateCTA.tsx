import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappHref } from "@/lib/site-contact";

type EmptyStateCTAProps = {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  whatsappMessage?: string;
  tips?: string[];
  /** When provided, tips render as buttons that apply the suggestion. */
  onTipClick?: (tip: string) => void;
};

export default function EmptyStateCTA({
  title,
  description,
  primaryHref = "/join",
  primaryLabel = "انضم كشريك",
  secondaryHref,
  secondaryLabel,
  whatsappMessage = "مرحباً، أريد الانضمام لمنصة ملامح.ps",
  tips,
  onTipClick,
}: EmptyStateCTAProps) {
  return (
    <div className="bento-card rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-7 text-slate-500">{description}</p>
      {tips?.length ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {tips.map((tip) =>
            onTipClick ? (
              <button
                key={tip}
                type="button"
                onClick={() => onTipClick(tip)}
                className="rounded-full border border-slate-200 bg-[#faf8f5] px-3.5 py-1.5 text-xs font-extrabold text-slate-700 transition hover:border-primary/30 hover:bg-white hover:text-primary"
              >
                {tip}
              </button>
            ) : (
              <span key={tip} className="rounded-full bg-[#f3f0ea] px-3 py-1 text-xs font-extrabold text-slate-600">
                {tip}
              </span>
            )
          )}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href={primaryHref} className="btn-malama inline-flex items-center gap-2 px-6 py-3.5 text-sm">
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="btn-malama-outline px-6 py-3.5 text-sm">
            {secondaryLabel}
          </Link>
        ) : null}
        <a
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#eef5f3] px-6 py-3.5 text-sm font-extrabold text-primary transition hover:bg-[#e0ece9]"
        >
          <MessageCircle className="h-4 w-4" />
          واتساب
        </a>
      </div>
    </div>
  );
}

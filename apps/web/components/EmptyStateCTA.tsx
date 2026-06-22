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
}: EmptyStateCTAProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm backdrop-blur-md">
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-7 text-slate-500">{description}</p>
      {tips?.length ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {tips.map((tip) => (
            <span key={tip} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {tip}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:scale-[1.02]"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 transition hover:border-primary/30"
          >
            {secondaryLabel}
          </Link>
        ) : null}
        <a
          href={whatsappHref(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <MessageCircle className="h-4 w-4" />
          واتساب
        </a>
      </div>
    </div>
  );
}

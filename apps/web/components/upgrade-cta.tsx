"use client";

import Link from "next/link";

interface UpgradeCTAProps {
  /** Material Symbols icon name (e.g. "lock", "analytics", "movie") */
  icon: string;
  /** Heading text (e.g. "Unlock Advanced Analytics") */
  title: string;
  /** Supporting copy explaining the upgrade benefit */
  description: string;
  /** Button label (e.g. "Upgrade Now") */
  ctaText: string;
  /** Where the button links to. Defaults to "/pricing" */
  ctaHref?: string;
  /** false = full-page centered layout, true = compact card layout */
  inline?: boolean;
}

export function UpgradeCTA({
  icon,
  title,
  description,
  ctaText,
  ctaHref = "/pricing",
  inline = false,
}: UpgradeCTAProps) {
  const content = (
    <div className="flex flex-col items-center text-center gap-4 p-6">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-primary">
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white">{title}</h3>

      {/* Description */}
      <p className="text-text-grey text-sm max-w-md">{description}</p>

      {/* CTA Button */}
      <Link
        href={ctaHref}
        className="bg-primary text-black font-medium px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  );

  if (inline) {
    return (
      <div className="bg-card-dark rounded-xl border border-white/5">{content}</div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-card-dark rounded-xl border border-white/5 shadow-2xl shadow-black/50">{content}</div>
    </div>
  );
}

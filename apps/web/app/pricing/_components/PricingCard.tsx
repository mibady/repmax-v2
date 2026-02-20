'use client';

import type { PricingPlan } from '../_data/pricing-plans';

type PricingCardProps = {
  plan: PricingPlan;
  isAnnual: boolean;
  loadingSlug: string | null;
  onCheckout: (slug: string) => void;
  onOneTimeCheckout: (slug: string) => void;
};

function formatPrice(price: number): string {
  if (price === 0) return '$0';
  if (Number.isInteger(price)) return `$${price}`;
  return `$${price.toFixed(2)}`;
}

function getAccentColorClass(accentColor?: string): string {
  switch (accentColor) {
    case 'primary':
      return 'text-primary';
    case 'accent-green':
      return 'text-accent-green';
    case 'accent-purple':
      return 'text-accent-purple';
    default:
      return 'text-white';
  }
}

function getCheckColorClass(accentColor?: string): string {
  switch (accentColor) {
    case 'primary':
      return 'text-primary';
    case 'accent-green':
      return 'text-accent-green';
    case 'accent-purple':
      return 'text-accent-purple';
    default:
      return 'text-gray-500';
  }
}

function getBorderHoverClass(accentColor?: string): string {
  switch (accentColor) {
    case 'accent-green':
      return 'hover:border-accent-green/50';
    case 'accent-purple':
      return 'hover:border-accent-purple/50';
    default:
      return '';
  }
}

export default function PricingCard({
  plan,
  isAnnual,
  loadingSlug,
  onCheckout,
  onOneTimeCheckout,
}: PricingCardProps) {
  const isHighlighted = plan.highlighted;
  const nameColorClass = getAccentColorClass(plan.accentColor);
  const checkColorClass = getCheckColorClass(plan.accentColor);
  const borderHoverClass = getBorderHoverClass(plan.accentColor);

  // Determine price display
  let displayPrice: string;
  let priceSuffix: string = '';
  let priceSubtitle: string = '';

  switch (plan.billingMode) {
    case 'free':
      displayPrice = '$0';
      priceSuffix = '/mo';
      break;
    case 'subscription':
      if (isAnnual && plan.annualPrice) {
        const monthlyEquivalent = plan.annualPrice / 12;
        displayPrice = formatPrice(Math.round(monthlyEquivalent * 100) / 100);
        priceSuffix = '/mo';
        priceSubtitle = 'billed annually';
      } else {
        displayPrice = formatPrice(plan.monthlyPrice);
        priceSuffix = plan.monthlyPrice >= 1000 ? '/yr' : '/mo';
      }
      break;
    case 'payment':
      displayPrice = formatPrice(plan.monthlyPrice);
      priceSubtitle = 'one-time';
      break;
    case 'contact':
      displayPrice = 'Contact';
      break;
  }

  // Determine which slug to use for checkout
  const checkoutSlug =
    plan.billingMode === 'subscription' && isAnnual && plan.annualSlug
      ? plan.annualSlug
      : plan.slug;

  const isLoading = loadingSlug === checkoutSlug;

  function handleClick() {
    if (plan.billingMode === 'contact' && plan.contactEmail) {
      window.location.href = `mailto:${plan.contactEmail}?subject=${encodeURIComponent(plan.name + ' Plan Inquiry')}`;
      return;
    }
    if (plan.billingMode === 'payment') {
      onOneTimeCheckout(plan.slug);
      return;
    }
    onCheckout(checkoutSlug);
  }

  // Feature text style: highlighted cards get white font-medium, others get gray-300
  const featureTextClass = isHighlighted
    ? 'text-sm text-white font-medium'
    : 'text-sm text-gray-300';

  return (
    <div
      className={`group relative flex flex-col rounded-3xl bg-card-dark p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300 ${
        isHighlighted
          ? 'border-2 border-primary shadow-glow z-10 transform md:scale-105'
          : `border border-white/10 ${borderHoverClass}`
      }`}
    >
      {/* Most Popular badge */}
      {isHighlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
          Most Popular
        </div>
      )}

      {/* Plan header */}
      <div className="mb-6 space-y-2">
        <h3 className={`text-lg font-bold tracking-wide ${nameColorClass}`}>
          {plan.name.toUpperCase()}
        </h3>
        <p className="text-text-muted text-xs font-normal">{plan.description}</p>
        <div className="pt-4 flex items-baseline gap-1">
          <span
            className={`font-bold font-mono text-white ${
              plan.billingMode === 'contact' ? 'text-3xl' : 'text-4xl'
            }`}
          >
            {displayPrice}
          </span>
          {priceSuffix && (
            <span className="text-gray-500 font-medium">{priceSuffix}</span>
          )}
        </div>
        {priceSubtitle && (
          <p className="text-text-muted text-xs">{priceSubtitle}</p>
        )}
      </div>

      {/* Features list */}
      <ul className="flex-1 space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className={`flex items-start gap-3 ${featureTextClass}`}>
            <span
              className={`material-symbols-outlined ${checkColorClass} text-[20px] feature-check`}
            >
              check
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-full text-sm font-bold transition-colors disabled:opacity-50 ${
          isHighlighted
            ? 'bg-primary hover:bg-primary-hover text-background-dark shadow-lg shadow-primary/20'
            : plan.accentColor === 'accent-green'
              ? 'bg-[#1F2937] hover:bg-[#374151] border border-accent-green/30 text-white'
              : plan.accentColor === 'accent-purple'
                ? 'bg-[#1F2937] hover:bg-[#374151] border border-accent-purple/30 text-white'
                : 'border border-white/20 hover:bg-white/5 text-white'
        }`}
      >
        {isLoading ? 'Loading...' : plan.ctaText}
      </button>
    </div>
  );
}

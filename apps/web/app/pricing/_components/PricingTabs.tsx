'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/hooks/use-user';
import { pricingCategories } from '../_data/pricing-plans';
import BillingToggle from './BillingToggle';
import PricingCard from './PricingCard';

type PricingTabsProps = {
  loadingSlug: string | null;
  onCheckout: (slug: string) => void;
  onOneTimeCheckout: (slug: string) => void;
};

function getDefaultTab(role?: string | null): string {
  switch (role) {
    case 'athlete':
      return 'athletes';
    case 'coach':
    case 'recruiter':
      return 'recruiters';
    case 'club':
      return 'events';
    default:
      return 'athletes';
  }
}

export default function PricingTabs({
  loadingSlug,
  onCheckout,
  onOneTimeCheckout,
}: PricingTabsProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('athletes');
  const [isAnnual, setIsAnnual] = useState(false);
  const [hasSetDefault, setHasSetDefault] = useState(false);

  // Set default tab based on user role on first load
  useEffect(() => {
    if (!hasSetDefault && user?.profile?.role) {
      setActiveTab(getDefaultTab(user.profile.role));
      setHasSetDefault(true);
    }
  }, [user, hasSetDefault]);

  const activeCategory = pricingCategories.find((c) => c.id === activeTab) ?? pricingCategories[0];

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    setIsAnnual(false);
  }

  // Determine grid columns based on plan count
  const planCount = activeCategory.plans.length;
  const gridCols =
    planCount <= 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Tab bar */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {pricingCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleTabChange(category.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === category.id
                ? 'bg-primary text-background-dark shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Billing toggle */}
      {activeCategory.hasToggle && (
        <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />
      )}

      {/* Plan cards grid */}
      <div className={`grid ${gridCols} gap-6 items-stretch`}>
        {activeCategory.plans.map((plan) => (
          <PricingCard
            key={plan.slug}
            plan={plan}
            isAnnual={isAnnual}
            loadingSlug={loadingSlug}
            onCheckout={onCheckout}
            onOneTimeCheckout={onOneTimeCheckout}
          />
        ))}
      </div>

      {/* Billing note */}
      {activeCategory.billingNote && (
        <div className="mt-12 text-center">
          <p className="text-text-muted text-sm font-light">{activeCategory.billingNote}</p>
        </div>
      )}
    </div>
  );
}

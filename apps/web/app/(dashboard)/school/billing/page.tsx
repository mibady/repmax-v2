'use client';

import { useState } from 'react';
import { useSchoolDashboard } from '@/lib/hooks';

const TIER_LABELS: Record<string, { label: string; description: string }> = {
  'school-small': {
    label: 'Small',
    description: 'Up to 50 athletes, basic features',
  },
  'school-medium': {
    label: 'Medium',
    description: 'Up to 200 athletes, 10% Dashr discount',
  },
  'school-large': {
    label: 'Large',
    description: 'Unlimited athletes, 20% Dashr discount, priority support',
  },
};

export default function SchoolBillingPage() {
  const { school, isLoading, error } = useSchoolDashboard();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to open billing portal');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Billing portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading billing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load billing</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const tierSlug = school?.tier_slug || null;
  const tierInfo = tierSlug ? TIER_LABELS[tierSlug] : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your school subscription and payments</p>
      </div>

      {/* Current Plan */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
        <h2 className="text-white font-bold mb-4">Current Plan</h2>
        {tierInfo ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-white text-xl font-bold">{tierInfo.label} Plan</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  Active
                </span>
              </div>
              <p className="text-gray-400 text-sm">{tierInfo.description}</p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1F22] text-white font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">credit_card</span>
              {portalLoading ? 'Opening...' : 'Manage Billing'}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-3">credit_card_off</span>
            <h3 className="text-white font-semibold mb-2">No Active Plan</h3>
            <p className="text-slate-400 text-sm mb-4">
              Upgrade to unlock premium features and team discounts on Dashr events.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Options */}
      {!tierSlug && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(TIER_LABELS).map(([slug, info]) => (
            <div key={slug} className="bg-[#141414] border border-white/5 rounded-xl p-5 flex flex-col">
              <h3 className="text-white font-bold text-lg mb-1">{info.label}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1">{info.description}</p>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ planSlug: slug }),
                    });
                    const data = await res.json();
                    if (data.sessionUrl) {
                      window.location.href = data.sessionUrl;
                    }
                  } catch (err) {
                    console.error('Checkout error:', err);
                  }
                }}
                className="w-full py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Upgrade to {info.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade CTA for existing subscribers */}
      {tierSlug && tierSlug !== 'school-large' && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-2xl">upgrade</span>
            <h3 className="text-white font-bold">Upgrade Available</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Get more features and bigger Dashr discounts by upgrading your plan.
          </p>
          <button
            onClick={handleManageBilling}
            className="px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import type { Offer } from '@/lib/hooks';

interface OffersOverviewProps {
  offers: Offer[];
}

const DIVISION_COLORS: Record<string, string> = {
  D1: 'text-green-400 bg-green-400/10',
  D2: 'text-blue-400 bg-blue-400/10',
  D3: 'text-purple-400 bg-purple-400/10',
  NAIA: 'text-yellow-400 bg-yellow-400/10',
  JUCO: 'text-slate-400 bg-slate-400/10',
};

const SCHOLARSHIP_LABELS: Record<string, string> = {
  full: 'Full Scholarship',
  partial: 'Partial',
  'walk-on': 'Walk-On',
  'preferred-walk-on': 'Preferred Walk-On',
};

export function OffersOverview({ offers }: OffersOverviewProps) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">emoji_events</span>
          Scholarship Offers
          {offers.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
              {offers.length}
            </span>
          )}
        </h3>
      </div>
      <div className="divide-y divide-white/5">
        {offers.length === 0 ? (
          <div className="p-6 text-center">
            <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">military_tech</span>
            <p className="text-sm text-slate-500">No offers yet</p>
          </div>
        ) : (
          offers.map((offer) => {
            const divColor = DIVISION_COLORS[offer.division] || DIVISION_COLORS.JUCO;
            const date = new Date(offer.offerDate + 'T00:00:00');
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={offer.id} className="p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{offer.schoolName}</span>
                    {offer.committed && (
                      <span className="material-symbols-outlined text-[16px] text-green-400">check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{dateStr}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${divColor}`}>
                  {offer.division}
                </span>
                <span className="text-xs text-slate-400">
                  {SCHOLARSHIP_LABELS[offer.scholarshipType] || offer.scholarshipType}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

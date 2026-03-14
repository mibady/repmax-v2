'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type Offer = {
  id: string;
  school_name: string;
  division: string;
  scholarship_type: string | null;
  offer_date: string;
  committed: boolean;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDivisionColor(division: string): string {
  switch (division) {
    case 'D1': return 'bg-primary/15 text-primary border-primary/30';
    case 'D2': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'D3': return 'bg-green-500/15 text-green-400 border-green-500/30';
    case 'NAIA': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'JUCO': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    default: return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

function formatScholarship(type: string | null): string {
  if (!type) return 'Pending';
  return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function AthleteOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/athlete/offers');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load offers');
        }
        const data = await res.json();
        setOffers(data.offers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offers');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const committedOffer = offers.find(o => o.committed);
  const activeOffers = offers.filter(o => !o.committed);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/athlete" className="text-text-muted hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </Link>
              <h1 className="text-3xl font-bold text-white">Offers</h1>
            </div>
            <p className="text-text-muted ml-8">Track your recruiting offers and commitments.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-dark border border-[#333] rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-[24px]">campaign</span>
            <div>
              <div className="text-2xl font-bold text-white">{offers.length}</div>
              <div className="text-xs text-text-muted">Total Offers</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Committed Banner */}
        {committedOffer && (
          <div className="bg-gradient-to-r from-green-500/10 to-green-900/5 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-green-400 text-[28px]">verified</span>
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Committed</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{committedOffer.school_name}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getDivisionColor(committedOffer.division)}`}>
                {committedOffer.division}
              </span>
              <span>{formatScholarship(committedOffer.scholarship_type)}</span>
              <span>Committed {formatDate(committedOffer.offer_date)}</span>
            </div>
          </div>
        )}

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="bg-surface-dark rounded-xl border border-[#333] p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-white/10 mb-4">campaign</span>
            <h3 className="text-lg font-bold text-white mb-2">No Offers Yet</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
              Keep your profile updated and film current. Offers will appear here as coaches extend them through RepMax.
            </p>
            <Link
              href="/athlete/card/edit"
              className="inline-flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Update Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-surface-dark rounded-xl border border-[#333] hover:border-[#444] transition-colors p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-[#2A2A2E] flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[24px]">school</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{offer.school_name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span>{formatScholarship(offer.scholarship_type)}</span>
                      <span>•</span>
                      <span>{formatDate(offer.offer_date)}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getDivisionColor(offer.division)}`}>
                  {offer.division}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

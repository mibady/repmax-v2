'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

type Offer = {
  id: string;
  school_name: string;
  division: string;
  scholarship_type: string | null;
  offer_date: string;
  committed: boolean;
};

import { getSchoolMeta } from '@/lib/data/school-data';

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

const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
const SCHOLARSHIP_TYPES = ['full-ride', 'partial', 'walk-on', 'preferred-walk-on', 'academic'];

// ─── Offer Modal (Add / Edit) ──────────────────────────────────
function OfferModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Omit<Offer, 'id'> & { id?: string }) => Promise<void>;
  initial?: Offer | null;
}) {
  const [schoolName, setSchoolName] = useState('');
  const [division, setDivision] = useState('D1');
  const [scholarshipType, setScholarshipType] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [committed, setCommitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSchoolName(initial?.school_name || '');
      setDivision(initial?.division || 'D1');
      setScholarshipType(initial?.scholarship_type || '');
      setOfferDate(initial?.offer_date || new Date().toISOString().split('T')[0]);
      setCommitted(initial?.committed || false);
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolName || !offerDate) return;
    setSaving(true);
    try {
      await onSave({
        ...(initial ? { id: initial.id } : {}),
        school_name: schoolName,
        division,
        scholarship_type: scholarshipType || null,
        offer_date: offerDate,
        committed,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{initial ? 'Edit Offer' : 'Add Offer'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">School Name *</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="e.g. University of Alabama"
                className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Division *</label>
              <div className="flex gap-2 flex-wrap">
                {DIVISIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDivision(d)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      division === d
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-[#333] text-gray-500 hover:border-[#444] hover:text-gray-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Scholarship Type</label>
              <select
                value={scholarshipType}
                onChange={e => setScholarshipType(e.target.value)}
                className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 [color-scheme:dark]"
              >
                <option value="">Pending</option>
                {SCHOLARSHIP_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Offer Date *</label>
              <input
                type="date"
                value={offerDate}
                onChange={e => setOfferDate(e.target.value)}
                className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 [color-scheme:dark]"
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCommitted(!committed)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  committed
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'border-[#333] text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Committed
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-[#333] text-gray-400 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !schoolName || !offerDate}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-symbols-outlined text-[18px]">{initial ? 'save' : 'add'}</span>}
                {initial ? 'Save Changes' : 'Add Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ offer, index, onEdit, onDelete }: { offer: Offer; index: number; onEdit: (o: Offer) => void; onDelete: (id: string) => void }) {
  const meta = getSchoolMeta(offer.school_name);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100 + index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  const card = (
    <div
      className={`relative rounded-2xl p-5 flex flex-col gap-4 group overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ background: 'linear-gradient(145deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%)' }}
    >
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/30 via-primary/5 to-transparent -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 rounded-2xl border border-primary/20 group-hover:border-primary/50 transition-colors duration-500" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-700" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors duration-700" />

      {/* Logo + Division badge */}
      <div className="flex items-start justify-between relative z-10">
        <div className="size-16 rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden shadow-lg shadow-primary/10 group-hover:shadow-primary/25 transition-shadow duration-500">
          {meta?.logo ? (
            <Image
              src={meta.logo}
              alt={`${offer.school_name} logo`}
              width={48}
              height={48}
              className="object-contain"
              unoptimized
            />
          ) : (
            <span className="material-symbols-outlined text-gray-800 text-[32px]">school</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getDivisionColor(offer.division)}`}>
            {offer.division}
          </span>
        </div>
      </div>

      {/* School name */}
      <div className="relative z-10">
        <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors duration-300">{offer.school_name}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          {meta?.conference && <span>{meta.conference}</span>}
          {meta?.conference && <span className="text-gray-600">·</span>}
          <span className="text-primary/80 font-semibold">{formatScholarship(offer.scholarship_type)}</span>
          <span className="text-gray-600">·</span>
          <span>{formatDate(offer.offer_date)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 relative z-10 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(offer); }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Edit
        </button>
        <span className="text-gray-700">·</span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(offer.id); }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">delete</span>
          Delete
        </button>
      </div>
    </div>
  );

  if (meta?.url) {
    return (
      <a href={meta.url} target="_blank" rel="noopener noreferrer" className="block">
        {card}
      </a>
    );
  }

  return card;
}

export default function AthleteOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const fetchOffers = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  async function handleSaveOffer(offer: Omit<Offer, 'id'> & { id?: string }) {
    if (offer.id) {
      // Update existing
      const res = await fetch('/api/athlete/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update offer');
      }
    } else {
      // Create new
      const res = await fetch('/api/athlete/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create offer');
      }
    }
    await fetchOffers();
  }

  async function handleDeleteOffer(id: string) {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    const res = await fetch(`/api/athlete/offers?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setOffers(prev => prev.filter(o => o.id !== id));
    }
  }

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
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/athlete" className="text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-bold text-white">Offers</h1>
              </div>
              <p className="text-gray-500 ml-8">Track your recruiting offers and commitments.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Add Offer button */}
              <button
                onClick={() => { setEditingOffer(null); setModalOpen(true); }}
                className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Offer
              </button>
              {/* Offer count badge */}
              <div className="relative">
                <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-xl animate-pulse" />
                <div className="relative flex items-center gap-3 bg-[#1a1a1a] border border-primary/30 rounded-2xl px-5 py-3">
                  <span className="material-symbols-outlined text-primary text-[28px]">campaign</span>
                  <div>
                    <div className="text-3xl font-black text-white">{offers.length}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Total Offers</div>
                  </div>
                </div>
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
            <div className="relative rounded-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent" />
              <div className="absolute inset-0 rounded-2xl border border-green-500/30" />
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="size-18 rounded-xl bg-white flex items-center justify-center p-2 overflow-hidden shadow-lg shadow-green-500/20">
                  {getSchoolMeta(committedOffer.school_name)?.logo ? (
                    <Image
                      src={getSchoolMeta(committedOffer.school_name)!.logo!}
                      alt={`${committedOffer.school_name} logo`}
                      width={56}
                      height={56}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gray-800 text-[36px]">school</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-green-400 text-[20px]">verified</span>
                    <span className="text-xs font-black text-green-400 uppercase tracking-widest">Committed</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{committedOffer.school_name}</h2>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-400">
                    <span className={`px-2 py-0.5 rounded border text-xs font-bold ${getDivisionColor(committedOffer.division)}`}>
                      {committedOffer.division}
                    </span>
                    <span>{formatScholarship(committedOffer.scholarship_type)}</span>
                    <span>Committed {formatDate(committedOffer.offer_date)}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingOffer(committedOffer); setModalOpen(true); }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
            </div>
          )}

          {/* Offers Grid */}
          {offers.length === 0 ? (
            <div className="relative rounded-2xl p-16 text-center overflow-hidden">
              <div className="absolute inset-0 border border-[#222] rounded-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <span className="material-symbols-outlined text-[64px] text-primary/20 mb-6 block">campaign</span>
                <h3 className="text-xl font-bold text-white mb-3">Your First Offer Awaits</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                  Keep your profile updated and film current. Add offers as they come in to track your recruiting journey.
                </p>
                <button
                  onClick={() => { setEditingOffer(null); setModalOpen(true); }}
                  className="inline-flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Your First Offer
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeOffers.map((offer, i) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  index={i}
                  onEdit={(o) => { setEditingOffer(o); setModalOpen(true); }}
                  onDelete={handleDeleteOffer}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <OfferModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingOffer(null); }}
        onSave={handleSaveOffer}
        initial={editingOffer}
      />
    </div>
  );
}

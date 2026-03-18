'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublicTournaments, type OffSeasonEventType, type ZoneCode } from '@/lib/hooks';
import { Loader2, Calendar, MapPin, Users, ChevronDown, X } from 'lucide-react';

const EVENT_TYPES: { value: OffSeasonEventType; label: string; icon: string }[] = [
  { value: 'tournament', label: 'Tournaments', icon: 'emoji_events' },
  { value: 'showcase', label: 'Showcases', icon: 'star' },
  { value: 'camp', label: 'Camps', icon: 'camping' },
  { value: 'combine', label: 'Combines', icon: 'speed' },
  { value: 'clinic', label: 'Clinics', icon: 'school' },
];

const ZONES: { value: ZoneCode; label: string }[] = [
  { value: 'south', label: 'South' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'midwest', label: 'Midwest' },
  { value: 'northeast', label: 'Northeast' },
  { value: 'west', label: 'West' },
  { value: 'northwest', label: 'Northwest' },
];

const TIER_COLORS: Record<string, string> = {
  elite: 'bg-primary text-black',
  premier: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  standard: 'bg-white/10 text-gray-300 border border-white/10',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  tournament: 'bg-primary/15 text-primary',
  showcase: 'bg-purple-500/15 text-purple-400',
  camp: 'bg-green-500/15 text-green-400',
  combine: 'bg-orange-500/15 text-orange-400',
  clinic: 'bg-cyan-500/15 text-cyan-400',
};

export default function PublicTournamentsPage() {
  const {
    tournaments,
    isLoading,
    filters,
    setDateFilter,
    setEventTypeFilter,
    setZoneFilter,
    clearFilters,
  } = usePublicTournaments();

  const [fromDate, setFromDate] = useState(filters.from || '');
  const [toDate, setToDate] = useState(filters.to || '');
  const [zoneOpen, setZoneOpen] = useState(false);

  function applyDateFilters() {
    setDateFilter(fromDate || null, toDate || null);
  }

  const hasActiveFilters = filters.eventType || filters.zone || filters.from || filters.to;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Off Season <span className="text-primary">Events</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover elite 7v7 tournaments, college showcases, camps, and combines. Compete against top-tier talent and get recruited.
          </p>
        </div>

        {/* Event Type Chips */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setEventTypeFilter(null)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              !filters.eventType
                ? 'bg-primary text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]'
                : 'bg-[#1F1F22] text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            All Events
          </button>
          {EVENT_TYPES.map((et) => (
            <button
              key={et.value}
              onClick={() => setEventTypeFilter(filters.eventType === et.value ? null : et.value)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                filters.eventType === et.value
                  ? 'bg-primary text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]'
                  : 'bg-[#1F1F22] text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{et.icon}</span>
              {et.label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 mb-6 flex flex-wrap items-end gap-6">
          {/* Zone Dropdown */}
          <div className="min-w-[200px] relative">
            <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Zone</label>
            <button
              onClick={() => setZoneOpen(!zoneOpen)}
              className="w-full flex items-center justify-between bg-[#1F1F22] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <span className="flex items-center gap-2">
                <MapPin className="size-4 text-gray-500" />
                {filters.zone ? ZONES.find((z) => z.value === filters.zone)?.label : 'All Zones'}
              </span>
              <ChevronDown className={`size-4 text-gray-500 transition-transform ${zoneOpen ? 'rotate-180' : ''}`} />
            </button>
            {zoneOpen && (
              <div className="absolute z-20 top-full mt-1 w-full bg-[#1F1F22] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => { setZoneFilter(null); setZoneOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                    !filters.zone ? 'text-primary font-bold' : 'text-gray-300'
                  }`}
                >
                  All Zones
                </button>
                {ZONES.map((z) => (
                  <button
                    key={z.value}
                    onClick={() => { setZoneFilter(z.value); setZoneOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                      filters.zone === z.value ? 'text-primary font-bold' : 'text-gray-300'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-[#1F1F22] text-white border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-[#1F1F22] text-white border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
          <button
            onClick={applyDateFilters}
            className="px-8 py-2.5 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]"
          >
            Search
          </button>
        </div>

        {/* Active Filter Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mr-2">Active:</span>
            {filters.eventType && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1F1F22] border border-white/10 rounded-lg text-sm text-gray-300">
                {EVENT_TYPES.find((et) => et.value === filters.eventType)?.label}
                <button onClick={() => setEventTypeFilter(null)} className="hover:text-white">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {filters.zone && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1F1F22] border border-white/10 rounded-lg text-sm text-gray-300">
                {ZONES.find((z) => z.value === filters.zone)?.label}
                <button onClick={() => setZoneFilter(null)} className="hover:text-white">
                  <X className="size-3" />
                </button>
              </span>
            )}
            {(filters.from || filters.to) && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1F1F22] border border-white/10 rounded-lg text-sm text-gray-300">
                {filters.from || '...'} → {filters.to || '...'}
                <button onClick={() => { setFromDate(''); setToDate(''); setDateFilter(null, null); }} className="hover:text-white">
                  <X className="size-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setFromDate(''); setToDate(''); clearFilters(); }}
              className="text-xs text-primary font-bold hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] border border-dashed border-white/10 rounded-3xl">
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">search_off</span>
            <h3 className="text-white text-xl font-bold mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or check back later.</p>
            <button
              onClick={() => { setFromDate(''); setToDate(''); clearFilters(); }}
              className="px-6 py-2.5 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((t) => {
              const entryFee = t.entry_fee_cents ? `$${(t.entry_fee_cents / 100).toFixed(0)}` : 'Free';
              const spotsLeft = t.teams_capacity - (t.registration_count || 0);
              const tierClass = TIER_COLORS[t.event_tier || 'standard'] || TIER_COLORS.standard;
              const typeClass = EVENT_TYPE_COLORS[t.event_type || 'tournament'] || EVENT_TYPE_COLORS.tournament;

              return (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.id}`}
                  className="group bg-[#141414] border border-white/5 rounded-3xl p-6 hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Trophy className="size-24 text-primary" />
                  </div>

                  <div className="relative z-10">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4">
                      {t.event_type && (
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${typeClass}`}>
                          {t.event_type}
                        </span>
                      )}
                      {t.zone && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-white/5 text-gray-400 border border-white/10">
                          {t.zone}
                        </span>
                      )}
                      {t.event_tier && (
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${tierClass}`}>
                          {t.event_tier}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors pr-4">
                        {t.name}
                      </h3>
                      <span className="shrink-0 px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                        {entryFee}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Calendar className="size-4 text-primary shrink-0" />
                        <span>{new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <MapPin className="size-4 text-primary shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Users className="size-4 text-primary shrink-0" />
                        <span className={spotsLeft <= 5 ? 'text-yellow-500 font-bold' : ''}>
                          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Event Full'}
                        </span>
                      </div>
                    </div>

                    {/* Prospect Preview */}
                    {t.prospects.length > 0 && (
                      <div className="mb-6 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                          Prospects Attending
                        </p>
                        <div className="space-y-1.5">
                          {t.prospects.slice(0, 3).map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-gray-300 truncate">{p.player_name}</span>
                              <span className="text-gray-500 text-xs shrink-0 ml-2">
                                {[p.position, p.class_year ? `'${String(p.class_year).slice(-2)}` : null].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          ))}
                          {t.prospects.length > 3 && (
                            <p className="text-xs text-primary font-bold">+{t.prospects.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-primary font-black text-xs uppercase tracking-widest">View Details</span>
                      <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

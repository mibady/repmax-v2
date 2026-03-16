'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublicTournaments } from '@/lib/hooks';
import type { EventType, ZoneCode } from '@/lib/hooks/use-public-tournaments';
import { Loader2, Search, Calendar, MapPin, Users, ChevronDown } from 'lucide-react';

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'tournament', label: 'Tournaments', icon: 'emoji_events' },
  { value: 'showcase', label: 'Showcases', icon: 'star' },
  { value: 'camp', label: 'Camps', icon: 'camping' },
  { value: 'combine', label: 'Combines', icon: 'speed' },
];

const ZONES: { value: ZoneCode; label: string }[] = [
  { value: 'MIDWEST', label: 'Midwest' },
  { value: 'NORTHEAST', label: 'Northeast' },
  { value: 'PLAINS', label: 'Plains' },
  { value: 'SOUTHEAST', label: 'Southeast' },
  { value: 'SOUTHWEST', label: 'Southwest' },
  { value: 'WEST', label: 'West' },
];

export default function PublicTournamentsPage() {
  const { tournaments, isLoading, filters, setDateFilter, setEventTypeFilter, setZoneFilter } = usePublicTournaments();
  const [fromDate, setFromDate] = useState(filters.from || '');
  const [toDate, setToDate] = useState(filters.to || '');

  function applyDateFilters() {
    setDateFilter(fromDate || null, toDate || null);
  }

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
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setEventTypeFilter(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              !filters.eventType
                ? 'bg-primary text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.5)]'
                : 'bg-[#1F1F22] text-gray-400 border border-white/10 hover:border-primary/30 hover:text-white'
            }`}
          >
            All Events
          </button>
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setEventTypeFilter(filters.eventType === type.value ? null : type.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                filters.eventType === type.value
                  ? 'bg-primary text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.5)]'
                  : 'bg-[#1F1F22] text-gray-400 border border-white/10 hover:border-primary/30 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 mb-12 flex flex-wrap items-end gap-6">
          {/* Zone Select */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Zone / Region</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <select
                value={filters.zone || ''}
                onChange={(e) => setZoneFilter((e.target.value || null) as ZoneCode | null)}
                className="w-full bg-[#1F1F22] text-white border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
              >
                <option value="">All Zones</option>
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Start Date */}
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

          {/* End Date */}
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

        {/* Active Filter Summary */}
        {(filters.eventType || filters.zone) && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-gray-500 text-sm">Showing:</span>
            {filters.eventType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full">
                {EVENT_TYPES.find((t) => t.value === filters.eventType)?.label}
                <button onClick={() => setEventTypeFilter(null)} className="hover:text-white transition-colors">&times;</button>
              </span>
            )}
            {filters.zone && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full">
                {ZONES.find((z) => z.value === filters.zone)?.label}
                <button onClick={() => setZoneFilter(null)} className="hover:text-white transition-colors">&times;</button>
              </span>
            )}
            <button
              onClick={() => { setEventTypeFilter(null); setZoneFilter(null); }}
              className="text-gray-500 text-xs hover:text-white transition-colors ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm">
            {tournaments.length} event{tournaments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Results */}
        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] border border-dashed border-white/10 rounded-3xl">
            <Search className="size-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or check back later.</p>
            <button
              onClick={() => {
                setEventTypeFilter(null);
                setZoneFilter(null);
                setFromDate('');
                setToDate('');
                setDateFilter(null, null);
              }}
              className="px-6 py-2.5 bg-[#1F1F22] text-white font-bold rounded-xl border border-white/10 hover:border-primary/30 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((t) => {
              const entryFee = t.entry_fee_cents ? `$${(t.entry_fee_cents / 100).toFixed(0)}` : 'Free';
              const spotsLeft = t.teams_capacity - (t.registration_count || 0);
              const eventTypeLabel = EVENT_TYPES.find((et) => et.value === t.event_type);
              const zoneLabel = ZONES.find((z) => z.value === t.zone);
              const topProspects = t.prospects?.slice(0, 3) || [];
              const totalProspects = t.prospects?.length || 0;

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
                    {/* Top row: type badge + price */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {eventTypeLabel && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1F1F22] border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                            <span className="material-symbols-outlined text-xs text-primary">{eventTypeLabel.icon}</span>
                            {eventTypeLabel.label.replace(/s$/, '')}
                          </span>
                        )}
                        {zoneLabel && (
                          <span className="px-2.5 py-1 bg-[#1F1F22] border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            {zoneLabel.label}
                          </span>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">
                        {entryFee}
                      </span>
                    </div>

                    {/* Event tier badge */}
                    {t.event_tier && (
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${
                          t.event_tier === 'elite'
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : t.event_tier === 'premier'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {t.event_tier}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                      {t.name}
                    </h3>

                    {t.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
                    )}

                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Calendar className="size-4 text-primary shrink-0" />
                        <span>{new Date(t.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(t.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

                    {/* Prospects Attending */}
                    {totalProspects > 0 && (
                      <div className="mb-6 p-3 bg-[#1A1A1D] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary text-sm">group</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {totalProspects} Prospect{totalProspects !== 1 ? 's' : ''} Attending
                          </span>
                        </div>
                        <div className="space-y-1">
                          {topProspects.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-white font-medium">{p.player_name}</span>
                              <div className="flex items-center gap-2 text-gray-500">
                                {p.position && <span>{p.position}</span>}
                                {p.class_year && <span className="text-primary font-bold">&apos;{String(p.class_year).slice(-2)}</span>}
                              </div>
                            </div>
                          ))}
                          {totalProspects > 3 && (
                            <p className="text-gray-500 text-[10px] mt-1">+{totalProspects - 3} more</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
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

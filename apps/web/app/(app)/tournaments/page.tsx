'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePublicTournaments } from '@/lib/hooks';
import { Loader2, Search, Calendar, MapPin, Users } from 'lucide-react';

export default function PublicTournamentsPage() {
  const { tournaments, isLoading, filters, setDateFilter } = usePublicTournaments();
  const [fromDate, setFromDate] = useState(filters.from || '');
  const [toDate, setToDate] = useState(filters.to || '');

  function applyFilters() {
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
            Upcoming <span className="text-primary">Tournaments</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover elite football tournaments and showcases. Register your team to compete against top-tier talent.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 mb-12 flex flex-wrap items-end gap-6">
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
            onClick={applyFilters}
            className="px-8 py-2.5 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)]"
          >
            Search
          </button>
        </div>

        {/* Results */}
        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] border border-dashed border-white/10 rounded-3xl">
            <Search className="size-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">No tournaments found</h3>
            <p className="text-gray-500">Try adjusting your date filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments.map((t) => {
              const entryFee = t.entry_fee_cents ? `$${(t.entry_fee_cents / 100).toFixed(0)}` : 'Free';
              const spotsLeft = t.teams_capacity - (t.registration_count || 0);
              
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
                    <div className="flex items-start justify-between mb-6">
                      <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">sports_football</span>
                      </div>
                      <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                        {entryFee}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                      {t.name}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Calendar className="size-4 text-primary" />
                        <span>{new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <MapPin className="size-4 text-primary" />
                        <span className="truncate">{t.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Users className="size-4 text-primary" />
                        <span className={spotsLeft <= 5 ? 'text-yellow-500 font-bold' : ''}>
                          {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Tournament Full'}
                        </span>
                      </div>
                    </div>

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

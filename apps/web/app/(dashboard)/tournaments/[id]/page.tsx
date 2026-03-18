'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail, useBrackets, type BracketGameRecord } from '@/lib/hooks';
import { Loader2, Calendar, MapPin, Users, Info, Trophy, ChevronRight } from 'lucide-react';

export default function PublicTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, registrationCount, isLoading: detailLoading, error: detailError } = useTournamentDetail(id);
  const { games, isLoading: bracketsLoading } = useBrackets(id);

  if (detailLoading || bracketsLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (detailError || !tournament) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center">
        <div className="text-center p-8 bg-[#141414] border border-white/5 rounded-3xl max-w-md">
          <Info className="size-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Tournament Not Found</h2>
          <p className="text-gray-500 mb-6">The tournament you are looking for doesn&apos;t exist or is no longer public.</p>
          <Link href="/tournaments" className="text-primary font-bold hover:underline">Back to Tournaments</Link>
        </div>
      </div>
    );
  }

  const entryFee = tournament.entry_fee_cents ? `$${(tournament.entry_fee_cents / 100).toFixed(2)}` : 'Free';
  const hasCapacity = tournament.teams_capacity != null && tournament.teams_capacity > 0;
  const spotsLeft = hasCapacity ? tournament.teams_capacity - registrationCount : null;
  const isSoldOut = hasCapacity && spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <Link href="/tournaments" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="text-xs font-black uppercase tracking-widest">Back to Tournaments</span>
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                tournament.status === 'active' ? 'bg-green-500 text-black' : 'bg-primary text-black'
              }`}>
                {tournament.status}
              </span>
              {tournament.event_tier && (
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {tournament.event_tier} Tier
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">{tournament.name}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 bg-[#141414] border border-white/5 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Date</p>
                  <p className="text-white font-bold text-sm">{new Date(tournament.start_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#141414] border border-white/5 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Location</p>
                  <p className="text-white font-bold text-sm truncate">{tournament.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#141414] border border-white/5 p-4 rounded-2xl">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Capacity</p>
                  <p className="text-white font-bold text-sm">{hasCapacity ? `${registrationCount} / ${tournament.teams_capacity} Teams` : 'Open'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-[#141414] border border-white/10 rounded-3xl p-8 sticky top-32">
            <h3 className="text-white font-black text-xl mb-6">Registration</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">Entry Fee</span>
                <span className="text-white font-black text-xl">{entryFee}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-gray-400 text-sm">Deadline</span>
                <span className="text-white font-bold text-sm">
                  {tournament.registration_deadline ? new Date(tournament.registration_deadline).toLocaleDateString() : 'Rolling'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-400 text-sm">Status</span>
                <span className={isSoldOut ? 'text-red-500 font-bold text-sm' : 'text-green-500 font-bold text-sm'}>
                  {isSoldOut ? 'Sold Out' : hasCapacity ? `${spotsLeft} Spots Left` : 'Open'}
                </span>
              </div>
            </div>
            {isSoldOut ? (
              <div className="w-full bg-white/10 text-gray-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                Sold Out
              </div>
            ) : tournament.registration_url ? (
              <a
                href={tournament.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
              >
                Register
                <ChevronRight className="size-5" />
              </a>
            ) : (
              <div className="w-full bg-white/10 text-gray-500 font-black py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                Registration Unavailable
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {tournament.description && (
              <section>
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Info className="size-4" />
                  </div>
                  About the Event
                </h2>
                <div className="bg-[#141414] border border-white/5 rounded-3xl p-8">
                  <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{tournament.description}</p>
                </div>
              </section>
            )}

            {/* Schedule / Live Games */}
            <section>
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Trophy className="size-4" />
                </div>
                Live Schedule & Scores
              </h2>
              <div className="space-y-4">
                {games.length === 0 ? (
                  <div className="bg-[#141414] border border-white/5 rounded-3xl p-12 text-center">
                    <p className="text-gray-500">The game schedule hasn&apos;t been published yet.</p>
                  </div>
                ) : (
                  games.map((game: BracketGameRecord) => (
                    <div key={game.id} className="bg-[#141414] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/10 transition-colors">
                      <div className="flex flex-col items-center md:items-start">
                        <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                          {game.scheduled_at ? new Date(game.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                        </span>
                        <span className="text-white text-xs font-bold px-2 py-0.5 bg-white/5 rounded border border-white/10">
                          {game.venue?.name || 'Main Field'} {game.venue?.field_number ? `#${game.venue.field_number}` : ''}
                        </span>
                      </div>

                      <div className="flex-1 flex items-center justify-center gap-8 md:gap-12 w-full">
                        <div className="flex-1 text-right">
                          <h4 className="text-white font-black md:text-lg mb-1 truncate">{game.home_reg?.team_name || 'TBD'}</h4>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Home</span>
                        </div>
                        
                        <div className="flex items-center gap-4 px-6 py-2 bg-black rounded-2xl border border-white/5">
                          <span className={`text-3xl font-mono font-black ${game.status === 'in_progress' ? 'text-primary' : 'text-white'}`}>
                            {game.home_score}
                          </span>
                          <span className="text-gray-700 font-black">-</span>
                          <span className={`text-3xl font-mono font-black ${game.status === 'in_progress' ? 'text-primary' : 'text-white'}`}>
                            {game.away_score}
                          </span>
                        </div>

                        <div className="flex-1 text-left">
                          <h4 className="text-white font-black md:text-lg mb-1 truncate">{game.away_reg?.team_name || 'TBD'}</h4>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Away</span>
                        </div>
                      </div>

                      <div className="w-24 text-center md:text-right">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                          game.status === 'in_progress' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                          game.status === 'final' ? 'bg-white/5 text-gray-400 border border-white/10' :
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {game.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

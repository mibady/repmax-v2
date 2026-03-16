'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCoachDashboard } from '@/lib/hooks';
import type { RosterAthlete } from '@/lib/hooks/use-coach-dashboard';

interface PipelineStage {
  key: string;
  label: string;
  icon: string;
  color: string;
  athletes: RosterAthlete[];
}

export default function CoachPipelinePage() {
  const { roster, isLoading, error } = useCoachDashboard();

  const stages = useMemo((): PipelineStage[] => {
    const discovered = roster.filter(
      (a) => a.status === 'active' && a.offers === 0
    );
    const filmSent = roster.filter(
      (a) => a.status === 'active' && a.offers === 0 && a.starRating != null && a.starRating > 0
    );
    // Remove filmSent athletes from discovered
    const filmSentIds = new Set(filmSent.map((a) => a.id));
    const discoveredOnly = discovered.filter((a) => !filmSentIds.has(a.id));

    const contacted = roster.filter(
      (a) => a.status === 'active' && a.offers > 0 && a.offers <= 2
    );
    const offerExtended = roster.filter(
      (a) => a.status === 'active' && a.offers > 2
    );
    const committed = roster.filter((a) => a.status === 'committed');

    return [
      { key: 'discovered', label: 'Discovered', icon: 'search', color: 'border-t-slate-500', athletes: discoveredOnly },
      { key: 'film_sent', label: 'Film Sent', icon: 'videocam', color: 'border-t-blue-500', athletes: filmSent },
      { key: 'contacted', label: 'Contacted', icon: 'connect_without_contact', color: 'border-t-yellow-500', athletes: contacted },
      { key: 'offer_extended', label: 'Offer Extended', icon: 'emoji_events', color: 'border-t-orange-500', athletes: offerExtended },
      { key: 'committed', label: 'Committed', icon: 'verified', color: 'border-t-green-500', athletes: committed },
    ];
  }, [roster]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recruiting Pipeline</h2>
            <p className="text-sm text-white/40">
              Track your athletes through the college recruiting journey
            </p>
          </div>
          <Link
            href="/coach/roster/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Athlete
          </Link>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className={`bg-[#1F1F22] rounded-xl border border-white/5 border-t-2 ${stage.color} min-h-[300px] flex flex-col`}
            >
              {/* Stage Header */}
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/50 text-[18px]">
                      {stage.icon}
                    </span>
                    <span className="text-sm font-semibold text-white">{stage.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                    {stage.athletes.length}
                  </span>
                </div>
              </div>

              {/* Stage Cards */}
              <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[500px]">
                {stage.athletes.length === 0 ? (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-white/10 text-3xl">inbox</span>
                    <p className="text-xs text-white/20 mt-1">No athletes</p>
                  </div>
                ) : (
                  stage.athletes.map((athlete) => (
                    <Link
                      key={athlete.id}
                      href={`/coach/roster/${athlete.id}`}
                      className="block p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {athlete.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={athlete.avatarUrl}
                            alt={athlete.name}
                            className="size-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {athlete.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                          {athlete.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/40">
                        <span>{athlete.position}</span>
                        <span>·</span>
                        <span>Class {athlete.classYear}</span>
                        {athlete.offers > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-primary font-semibold">{athlete.offers} offers</span>
                          </>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

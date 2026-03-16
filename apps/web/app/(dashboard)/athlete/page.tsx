'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAthleteDashboard } from '@/lib/hooks';

function formatHeight(inches: number | null): string {
  if (!inches) return "N/A";
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function formatDate(dateStr: string): { month: string; day: string } {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate().toString().padStart(2, '0');
  return { month, day };
}

function getEventPriorityStyles(priority?: string) {
  if (priority === 'high') {
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }
  return 'bg-[#333] text-text-muted border-[#444]';
}

export default function AthleteDashboardPage() {
  const { profile, stats, shortlistCoaches, calendarEvents, isLoading, error } = useAthleteDashboard();
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = async () => {
    if (!profile) return;

    const shareUrl = `${window.location.origin}/card/${profile.id}`;
    const shareData = {
      title: `${profile.firstName} ${profile.lastName} - RepMax Profile`,
      text: `Check out ${profile.firstName}'s recruiting profile on RepMax`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch {
      // User cancelled or error - try clipboard fallback
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch {
        console.error('Failed to share or copy');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error?.message || 'Failed to load dashboard'}</p>
          <Link href="/login" className="text-primary hover:underline">Return to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.firstName}</h1>
          <p className="text-text-muted">Here&apos;s what&apos;s happening in your recruitment journey today.</p>
        </div>

        {/* Zone Pulse Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2e1065] to-surface-dark border border-accent-purple/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-accent-purple/5">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-accent-purple animate-pulse">leak_add</span>
              <span className="text-xs font-bold text-accent-purple uppercase tracking-wider">Zone Pulse: {profile.zone}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Recruiting activity is Active</h3>
            <p className="text-gray-300 text-sm max-w-lg">Coaches in your region are actively scouting {profile.position}s. Keep your profile updated.</p>
          </div>
          <Link href="/athlete/analytics" className="relative z-10 bg-white text-black hover:bg-gray-100 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
            View Your Analytics
          </Link>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Views */}
              <div className="bg-surface-dark p-5 rounded-xl border border-[#333] hover:border-[#444] transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                    Profile Views
                  </div>
                  {stats && stats.profileViewsChange !== 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 data-point ${
                      stats.profileViewsChange > 0
                        ? 'text-green-500 bg-green-500/10'
                        : 'text-red-500 bg-red-500/10'
                    }`}>
                      <span className="material-symbols-outlined text-[12px]">
                        {stats.profileViewsChange > 0 ? 'trending_up' : 'trending_down'}
                      </span>
                      {stats.profileViewsChange > 0 ? '+' : ''}{stats.profileViewsChange}%
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-4xl font-bold text-white data-point">{stats?.profileViews || 0}</div>
                  <div className="h-10 w-24 flex items-end gap-1 pb-1">
                    <div className="w-1/5 bg-primary/30 h-[40%] rounded-t-sm"></div>
                    <div className="w-1/5 bg-primary/40 h-[60%] rounded-t-sm"></div>
                    <div className="w-1/5 bg-primary/30 h-[30%] rounded-t-sm"></div>
                    <div className="w-1/5 bg-primary/60 h-[80%] rounded-t-sm"></div>
                    <div className="w-1/5 bg-primary h-[100%] rounded-t-sm"></div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-text-muted">Last 7 days</div>
              </div>

              {/* Shortlists */}
              <div className="bg-surface-dark p-5 rounded-xl border border-[#333] hover:border-[#444] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    Shortlists
                  </div>
                  <Link href="/athlete/offers" className="text-text-muted hover:text-white cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-4xl font-bold text-white data-point">{stats?.shortlistCount || 0}</div>
                  <div className="mb-1 text-sm text-text-muted">Coaches watching</div>
                </div>
                {shortlistCoaches.length > 0 && (
                  <div className="mt-4 flex -space-x-2 overflow-hidden">
                    {shortlistCoaches.slice(0, 3).map((coach) => (
                      coach.avatarUrl ? (
                        <Image
                          key={coach.id}
                          alt={coach.name}
                          className="inline-block size-8 rounded-full ring-2 ring-surface-dark"
                          src={coach.avatarUrl}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div
                          key={coach.id}
                          className="inline-block size-8 rounded-full ring-2 ring-surface-dark bg-[#333] flex items-center justify-center text-xs font-medium text-white"
                        >
                          {coach.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )
                    ))}
                    {shortlistCoaches.length > 3 && (
                      <div className="inline-block size-8 rounded-full ring-2 ring-surface-dark bg-[#333] flex items-center justify-center text-xs font-medium text-white">
                        +{shortlistCoaches.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-surface-dark rounded-xl border border-[#333] overflow-hidden flex-1">
              <div className="p-5 border-b border-[#333] flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Recruiting Calendar
                </h3>
                <Link href="/athlete/calendar" className="text-xs font-semibold text-primary hover:text-primary/80">View Full Schedule</Link>
              </div>
              <div className="p-0">
                {calendarEvents.length === 0 ? (
                  <div className="p-8 text-center text-text-muted">
                    No upcoming events
                  </div>
                ) : (
                  calendarEvents.map((event, index) => {
                    const { month, day } = formatDate(event.date);
                    const isLast = index === calendarEvents.length - 1;
                    return (
                      <div
                        key={event.id}
                        className={`flex items-center p-4 ${!isLast ? 'border-b border-[#333]' : ''} hover:bg-white/5 transition-colors group`}
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className={`text-xs font-bold uppercase ${event.priority === 'high' ? 'text-red-400' : 'text-text-muted'}`}>{month}</div>
                          <div className="text-xl font-bold text-white data-point">{day}</div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-bold text-white">{event.title}</div>
                          <div className="text-xs text-text-muted">{event.location || 'NCAA Event'}</div>
                        </div>
                        {event.priority && (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getEventPriorityStyles(event.priority)}`}>
                            {event.priority === 'high' ? 'High Priority' : 'Upcoming'}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-dark rounded-xl border border-[#333] p-1 shadow-xl">
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: profile.avatarUrl ? `url('${profile.avatarUrl}')` : "url('https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&h=600&fit=crop')"}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                </div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-xs font-bold text-primary uppercase tracking-wider">
                    Class of &apos;{profile.classYear.toString().slice(-2)}
                  </div>
                  <div className="size-10 bg-white rounded-full flex items-center justify-center">
                    <svg className="size-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black to-transparent">
                  <div className="flex items-end justify-between mb-1">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{profile.lastName}</h2>
                    <div className="text-3xl font-black text-primary data-point italic">{profile.position}</div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`material-symbols-outlined text-[18px] ${
                          star <= profile.starRating
                            ? 'text-primary fill'
                            : 'text-[#444]'
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-white/20 pt-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Height</div>
                      <div className="text-sm font-bold text-white data-point">{formatHeight(profile.heightInches)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">Weight</div>
                      <div className="text-sm font-bold text-white data-point">{profile.weightLbs || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase">40YD</div>
                      <div className="text-sm font-bold text-white data-point">{profile.fortyYardDash?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <Link href="/athlete/card/edit" className="flex items-center justify-center gap-2 bg-primary text-black font-bold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </Link>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-[#333] text-white font-bold py-2 rounded-lg text-sm hover:bg-[#444] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {shareStatus === 'copied' ? 'check' : 'share'}
                  </span>
                  {shareStatus === 'copied' ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface-dark rounded-xl border border-[#333] p-5">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-text-muted">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/athlete/card/edit" className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">Update Photos</span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">chevron_right</span>
                </Link>
                <Link href="/athlete/card/edit" className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">Log New Maxes</span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">chevron_right</span>
                </Link>
                <Link href="/athlete/film" className="w-full flex items-center justify-between p-3 rounded-lg bg-[#2A2A2E] hover:bg-[#333] border border-transparent hover:border-[#444] transition-all group text-left">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">Upload Tape</span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted text-[18px]">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

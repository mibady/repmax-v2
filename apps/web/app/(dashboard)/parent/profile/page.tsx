'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParentDashboard } from '@/lib/hooks';
import { AcademicHealth } from '@/components/parent/AcademicHealth';
import { OffersOverview } from '@/components/parent/OffersOverview';

const fallbackMetrics = {
  profileViews: 0,
  profileViewsChange: 0,
  coachMessages: 0,
  schoolsTracking: 0,
  upcomingDeadlines: 0,
  offersCount: 0,
};

export default function ParentProfilePage() {
  const { childProfile, metrics, academic, offers, isLoading, error } = useParentDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load profile</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const stats = metrics || fallbackMetrics;
  const fullName = childProfile?.fullName || childProfile?.name || 'Athlete';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/parent" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            {childProfile?.avatarUrl ? (
              <Image
                src={childProfile.avatarUrl}
                alt={fullName}
                className="size-24 rounded-full object-cover border-2 border-white/10"
                width={96}
                height={96}
              />
            ) : (
              <div className="size-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/30">
                {initials}
              </div>
            )}

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{fullName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">sports_football</span>
                  {childProfile?.position || 'ATH'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                  Class of {childProfile?.classYear || 2026}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {childProfile?.school || 'High School'}
                </span>
                {childProfile?.gpa !== null && childProfile?.gpa !== undefined && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">grade</span>
                    {childProfile.gpa.toFixed(2)} GPA
                  </span>
                )}
              </div>
            </div>

            {/* View Public Card */}
            {childProfile?.id && (
              <Link
                href={`/card/${childProfile.id}`}
                className="inline-flex items-center gap-2 bg-primary text-[#201d12] px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                View Public Card
              </Link>
            )}
          </div>
        </div>

        {/* Metrics Row — 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px] text-blue-400">visibility</span>
              Profile Views
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stats.profileViews}</span>
              {stats.profileViewsChange > 0 && (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                  +{stats.profileViewsChange}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>

          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px] text-green-400">chat_bubble</span>
              Coach Messages
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stats.coachMessages}</span>
              {stats.coachMessages > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">New</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Unread messages</p>
          </div>

          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px] text-amber-400">emoji_events</span>
              Offers
            </div>
            <span className="text-3xl font-bold text-white">{stats.offersCount}</span>
            <p className="text-xs text-slate-500 mt-1">Scholarship offers</p>
          </div>

          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px] text-blue-400">school</span>
              Schools Tracking
            </div>
            <span className="text-3xl font-bold text-white">{stats.schoolsTracking}</span>
            <p className="text-xs text-slate-500 mt-1">On shortlists</p>
          </div>
        </div>

        {/* Two-column: Offers + Academic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OffersOverview offers={offers} />
          {academic && <AcademicHealth academic={academic} />}
        </div>
      </div>
    </div>
  );
}

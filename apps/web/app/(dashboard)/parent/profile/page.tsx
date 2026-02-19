'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/lib/hooks';

const fallbackProfile = {
  id: '',
  name: 'Athlete',
  position: 'ATH',
  classYear: 2026,
  gpa: null as number | null,
  school: 'High School',
  avatarUrl: null as string | null,
};

const fallbackMetrics = {
  profileViews: 0,
  profileViewsChange: 0,
  coachMessages: 0,
  schoolsTracking: 0,
  upcomingDeadlines: 0,
};

export default function ParentProfilePage(): JSX.Element {
  const { childProfile, metrics, isLoading, error } = useParentDashboard();

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

  const profile = childProfile || fallbackProfile;
  const stats = metrics || fallbackMetrics;
  const initials = profile.name
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
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="size-24 rounded-full object-cover border-2 border-white/10"
              />
            ) : (
              <div className="size-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/30">
                {initials}
              </div>
            )}

            {/* Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-slate-400 text-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">sports_football</span>
                  {profile.position}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                  Class of {profile.classYear}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {profile.school}
                </span>
                {profile.gpa !== null && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">grade</span>
                    {profile.gpa.toFixed(2)} GPA
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
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
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </div>

          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
              Coach Messages
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-white">{stats.coachMessages}</span>
              {stats.coachMessages > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Unread messages</p>
          </div>

          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">school</span>
              Schools Tracking
            </div>
            <span className="text-3xl font-bold text-white">{stats.schoolsTracking}</span>
            <p className="text-xs text-slate-500 mt-1">Showing interest</p>
          </div>
        </div>

        {/* View Public Card */}
        {profile.id && (
          <Link
            href={`/card/${profile.id}`}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
            View Public Card
          </Link>
        )}
      </div>
    </div>
  );
}

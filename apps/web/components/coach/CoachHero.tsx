'use client';

import Link from 'next/link';

interface CoachHeroProps {
  coachName: string;
  school: string;
  activeTab: 'dashboard' | 'pipeline' | 'messages' | 'analytics';
  metrics: {
    activeRecruits: number;
    profileViews: number;
    filmClicks: number;
    newOffers: number;
    offerVelocity: number;
  };
  isLoading: boolean;
}

const tabs = [
  { key: 'dashboard', label: 'Dashboard', href: '/coach' },
  { key: 'pipeline', label: 'Pipeline', href: '/coach/pipeline' },
  { key: 'messages', label: 'Messages', href: '/messages' },
  { key: 'analytics', label: 'Analytics', href: '/coach/analytics' },
] as const;

export default function CoachHero({ coachName, school, activeTab, metrics, isLoading }: CoachHeroProps) {
  const firstName = coachName?.split(' ')[0] || 'Coach';

  return (
    <div className="relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-[#0a0a0a] to-primary/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

      <div className="relative z-10 px-8 pt-6 pb-0">
        {/* Top row: greeting + contact period badge + notification */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, Coach {firstName}
            </h1>
            <p className="text-sm text-white/50 mt-0.5">{school}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              Contact Period Open
            </span>
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-5">
          <Link
            href="/search"
            className="flex items-center gap-2 w-full max-w-md px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm hover:bg-white/8 hover:border-white/15 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            Search athletes, schools, events...
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-5">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Stats bar */}
        {!isLoading && (
          <div className="flex items-center gap-6 pb-5 border-b border-white/5">
            <StatItem label="Active Recruits" value={metrics.activeRecruits} />
            <div className="w-px h-8 bg-white/10" />
            <StatItem label="College Profile Views" value={metrics.profileViews} />
            <div className="w-px h-8 bg-white/10" />
            <StatItem label="Film Clicks" value={metrics.filmClicks} />
            <div className="w-px h-8 bg-white/10" />
            <StatItem label="New Offers" value={metrics.newOffers} />
            <div className="w-px h-8 bg-white/10" />
            <StatItem label="Committed" value={metrics.offerVelocity} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

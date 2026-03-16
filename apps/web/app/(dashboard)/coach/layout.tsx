'use client';

import { usePathname } from 'next/navigation';
import CoachHero from '@/components/coach/CoachHero';
import { useCoachDashboard } from '@/lib/hooks';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { coach, team, metrics, roster, isLoading } = useCoachDashboard();

  // Don't show hero on setup page
  if (pathname === '/coach/setup') {
    return <>{children}</>;
  }

  const activeTab =
    pathname === '/coach' ? 'dashboard' :
    pathname.startsWith('/coach/pipeline') ? 'pipeline' :
    pathname.startsWith('/messages') ? 'messages' :
    pathname.startsWith('/coach/analytics') ? 'analytics' :
    'dashboard';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <CoachHero
        coachName={coach?.name || ''}
        school={coach?.school || team?.school || ''}
        activeTab={activeTab}
        metrics={{
          activeRecruits: metrics?.totalAthletes ?? roster.length,
          profileViews: 0,
          filmClicks: 0,
          newOffers: metrics?.totalOffers ?? 0,
          offerVelocity: metrics?.committedAthletes ?? 0,
        }}
        isLoading={isLoading}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

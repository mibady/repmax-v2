'use client';

import { useParentDashboard } from '@/lib/hooks';
import { RecruitingPulse } from '@/components/parent/RecruitingPulse';
import { SchoolInterestTracker } from '@/components/parent/SchoolInterestTracker';
import { AlertsActionItems } from '@/components/parent/AlertsActionItems';
import { AcademicHealth } from '@/components/parent/AcademicHealth';
import { UpcomingKeyDates } from '@/components/parent/UpcomingKeyDates';
import { ParentResourceHub } from '@/components/parent/ParentResourceHub';
import { RecentActivity } from '@/components/parent/RecentActivity';
import { OffersOverview } from '@/components/parent/OffersOverview';

const fallbackMetrics = {
  profileViews: 0,
  profileViewsChange: 0,
  coachMessages: 0,
  schoolsTracking: 0,
  upcomingDeadlines: 0,
  offersCount: 0,
};

export default function ParentDashboardPage() {
  const {
    childProfile,
    metrics,
    schools,
    academic,
    alerts,
    activity,
    offers,
    athleteEvents,
    isLoading,
    error,
  } = useParentDashboard();

  const stats = metrics || fallbackMetrics;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const name = childProfile?.name || 'Athlete';
  const classYear = childProfile?.classYear || 2026;

  return (
    <div className="flex-1">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">{name}&apos;s Recruiting Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Class of {classYear} &middot; {childProfile?.position || 'ATH'} &middot; {childProfile?.school || 'High School'}
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <AlertsActionItems alerts={alerts} />
          </div>
        )}

        {/* Recruiting Pulse */}
        <div className="mb-6">
          <RecruitingPulse metrics={stats} classYear={classYear} />
        </div>

        {/* Two-column layout: Left (schools + academic) / Right (dates + resources) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <SchoolInterestTracker schools={schools} />
            <OffersOverview offers={offers} />
            {academic && <AcademicHealth academic={academic} />}
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-6">
            <RecentActivity activity={activity} />
            <UpcomingKeyDates classYear={classYear} athleteEvents={athleteEvents} />
          </div>
        </div>

        {/* Resource Hub */}
        <ParentResourceHub />
      </div>
    </div>
  );
}

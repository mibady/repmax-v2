'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/lib/hooks';
import { RecommendedResources } from '@/components/content/RecommendedResources';

// Fallback mock data for when API returns empty
const fallbackProfile = {
  name: 'Athlete',
  position: 'ATH',
  classYear: 2026,
  gpa: null,
  school: 'High School',
};

const fallbackMetrics = {
  profileViews: 0,
  profileViewsChange: 0,
  coachMessages: 0,
  schoolsTracking: 0,
  upcomingDeadlines: 0,
};

export default function ParentDashboardPage() {
  const {
    childProfile,
    metrics,
    schools,
    activity,
    calendarEvents,
    isLoading,
    error,
  } = useParentDashboard();

  // Use API data or fallback
  const profile = childProfile || fallbackProfile;
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{profile.name}&apos;s Recruiting Journey</h1>
          <p className="text-slate-400">Track {profile.name}&apos;s recruiting progress and stay informed.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

          <div className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <span className="material-symbols-outlined text-[20px]">event</span>
              Upcoming Deadlines
            </div>
            <span className="text-3xl font-bold text-white">{stats.upcomingDeadlines}</span>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-[#1F1F22] rounded-xl border border-white/5">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Activity
              </h3>
              <Link href="/parent/activity" className="text-xs font-semibold text-primary hover:text-primary/80">View All</Link>
            </div>
            <div className="divide-y divide-white/5">
              {activity.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">inbox</span>
                  <p className="text-slate-500 text-sm">No recent activity</p>
                </div>
              ) : (
                activity.map((item, index) => (
                  <div key={item.id || index} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      item.type === 'view' ? 'bg-blue-500/20 text-blue-400' :
                      item.type === 'message' ? 'bg-green-500/20 text-green-400' :
                      item.type === 'update' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-primary/20 text-primary'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {item.type === 'view' ? 'visibility' :
                         item.type === 'message' ? 'chat_bubble' :
                         item.type === 'update' ? 'upload' : 'bookmark'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.message}</p>
                      <p className="text-xs text-slate-500">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* College Interest Tracker */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span>
                College Interest
              </h3>
              <Link href="/parent/schools" className="text-xs font-semibold text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {schools.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">school</span>
                  <p className="text-slate-500 text-sm">No schools tracking yet</p>
                </div>
              ) : (
                schools.map((school, index) => (
                  <div key={school.id || index} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[20px]">sports_football</span>
                      </div>
                      <span className="text-sm font-medium text-white">{school.name}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${school.statusColor}`}>
                      {school.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recommended Resources */}
        <div className="mt-6">
          <RecommendedResources />
        </div>

        {/* Calendar Section */}
        <div className="mt-6 bg-[#1F1F22] rounded-xl border border-white/5">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              Recruiting Calendar
            </h3>
            <Link href="/parent/calendar" className="text-xs font-semibold text-primary hover:text-primary/80">
              View Full Calendar
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {calendarEvents.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">event</span>
                <p className="text-slate-500 text-sm">No upcoming events</p>
              </div>
            ) : (
              calendarEvents.map((event, index) => {
                const date = new Date(event.date);
                const month = date.toLocaleString('en-US', { month: 'short' });
                const day = date.getDate().toString().padStart(2, '0');
                return (
                  <div key={event.id || index} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-16 text-center">
                      <div className="text-xs font-bold uppercase text-slate-400">{month}</div>
                      <div className="text-xl font-bold text-white">{day}</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{event.type}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      event.type === 'deadline' ? 'bg-red-500/10 text-red-400' :
                      event.type === 'visit' ? 'bg-green-500/10 text-green-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {event.type === 'deadline' ? 'Deadline' : event.type === 'visit' ? 'Visit' : 'Camp'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/parent/profile" className="bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-colors group">
            <div className="size-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
            <h4 className="text-white font-semibold mb-1 group-hover:text-primary transition-colors">View {profile.name}&apos;s Profile</h4>
            <p className="text-xs text-slate-500">See what coaches see</p>
          </Link>

          <Link href="/messages" className="bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-colors group">
            <div className="size-12 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
            </div>
            <h4 className="text-white font-semibold mb-1 group-hover:text-primary transition-colors">Message History</h4>
            <p className="text-xs text-slate-500">View coach communications</p>
          </Link>

          <Link href="/parent/resources" className="bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-colors group">
            <div className="size-12 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <h4 className="text-white font-semibold mb-1 group-hover:text-primary transition-colors">Academic Requirements</h4>
            <p className="text-xs text-slate-500">NCAA eligibility info</p>
          </Link>

          <Link href="/parent/resources" className="bg-[#1F1F22] rounded-xl p-5 border border-white/5 hover:border-primary/30 transition-colors group">
            <div className="size-12 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <h4 className="text-white font-semibold mb-1 group-hover:text-primary transition-colors">Compliance Info</h4>
            <p className="text-xs text-slate-500">Know the rules</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

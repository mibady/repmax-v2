'use client';

import Link from 'next/link';
import { useAdminAnalytics } from '@/lib/hooks/use-admin-analytics';
import { Loader2 } from 'lucide-react';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin/analytics', active: true },
  { icon: 'group', label: 'User Management', href: '/admin/users', active: false },
  { icon: 'trending_up', label: 'Engagement', href: '/admin/analytics', active: false },
  { icon: 'gavel', label: 'Moderation', href: '/admin/moderation', active: false },
  { icon: 'toggle_on', label: 'Feature Flags', href: '/admin/feature-flags', active: false },
];

export default function AdminPlatformAnalyticsPage() {
  const { data, isLoading, error, refresh } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="bg-[#f8f6f6] dark:bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#ef4343]" />
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f8f6f6] dark:bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <p className="text-slate-500">Failed to load analytics</p>
          <p className="text-sm text-red-400">{error.message}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[#ef4343] text-white rounded-lg hover:bg-[#ef4343]/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpiData = data?.kpiData || [];
  const profileCompleteness = data?.profileCompleteness || [];
  const roleDistribution = data?.roleDistribution || [];
  const totalUsers = data?.totalUsers || 0;

  return (
    <div className="bg-[#f8f6f6] dark:bg-[#050505] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Side Navigation */}
        <aside className="w-64 border-r border-slate-200 dark:border-[#262626] bg-white dark:bg-[#050505] flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="size-8 bg-[#ef4343] rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-[#ef4343]">RepMax Admin</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Platform Control</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer group ${
                  item.active
                    ? 'bg-[#ef4343]/10 text-[#ef4343] border border-[#ef4343]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121212]'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${!item.active ? 'group-hover:text-[#ef4343]' : ''}`}>
                  {item.icon}
                </span>
                <p className={`text-sm ${item.active ? 'font-semibold' : 'font-medium'}`}>{item.label}</p>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-[#262626]">
            <button className="w-full bg-[#ef4343] hover:bg-[#ef4343]/90 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
              <span className="material-symbols-outlined text-sm">file_download</span>
              <span className="text-sm">Export Report</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#f8f6f6] dark:bg-[#050505]">
          {/* Top Nav */}
          <header className="h-16 border-b border-slate-200 dark:border-[#262626] flex items-center justify-between px-8 bg-white/50 dark:bg-[#050505]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-bold tracking-tight">Admin Analytics</h2>
              <div className="relative w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                <input
                  className="w-full bg-slate-100 dark:bg-[#121212] border-none rounded-lg pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-[#ef4343] placeholder:text-slate-500"
                  placeholder="Search analytics..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refresh}
                className="size-9 rounded-lg bg-slate-100 dark:bg-[#121212] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#ef4343]"
                title="Refresh data"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <button className="size-9 rounded-lg bg-slate-100 dark:bg-[#121212] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#ef4343]">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <div className="h-8 w-[1px] bg-slate-200 dark:border-[#262626] mx-1"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold">Admin User</p>
                  <p className="text-[10px] text-slate-500">Super Admin</p>
                </div>
                <div className="size-9 rounded-full bg-[#ef4343] flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-8 max-w-7xl mx-auto w-full">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpiData.map((kpi) => (
                <div
                  key={kpi.id}
                  className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-xl p-6 transition-transform hover:scale-[1.02]"
                >
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold font-mono tracking-tighter">{kpi.value}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        kpi.isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {kpi.isPositive ? 'trending_up' : 'trending_down'}
                      </span>
                      {kpi.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1: Growth & Active Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* New Users Chart */}
              <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">New Users Over Time</h4>
                    <p className="text-xs text-slate-500">Historical user growth trend</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-500 rounded font-bold">GOLD METRIC</span>
                    <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-white">more_vert</span>
                  </div>
                </div>
                <div className="flex-1 h-64 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                    <path
                      d="M0 160 Q 50 150, 100 130 T 200 140 T 300 80 T 400 60 T 500 20"
                      fill="none"
                      stroke="#f59e0b"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                    <circle cx="500" cy="20" fill="#f59e0b" r="4" />
                    <line stroke="#262626" strokeDasharray="4" x1="0" x2="500" y1="190" y2="190" />
                  </svg>
                  <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                  </div>
                </div>
              </div>

              {/* Daily Active Users Chart */}
              <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Daily Active Users</h4>
                    <p className="text-xs text-slate-500">Volume of active sessions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded font-bold">STABLE</span>
                  </div>
                </div>
                <div className="flex-1 h-64 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="greenArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 180 Q 50 160, 100 170 T 200 120 T 300 140 T 400 90 T 500 100 V 200 H 0 Z"
                      fill="url(#greenArea)"
                    />
                    <path
                      d="M0 180 Q 50 160, 100 170 T 200 120 T 300 140 T 400 90 T 500 100"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 uppercase">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 2: Distribution & Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Completeness (Bar) */}
              <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-xl p-6 lg:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Profile Completeness</h4>
                <div className="space-y-5">
                  {profileCompleteness.map((bucket, index) => (
                    <div key={bucket.range} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                        <span>{bucket.range}</span>
                        <span>{bucket.percentage}% of Users</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-[#262626] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#ef4343] rounded-full transition-all duration-500"
                          style={{
                            width: `${bucket.percentage}%`,
                            opacity: 1 - index * 0.2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Distribution (Pie Simulated) */}
              <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#262626] rounded-xl p-6">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Role Distribution</h4>
                <div className="flex flex-col items-center">
                  <div className="relative size-40 mb-6">
                    {/* Simulated Pie Chart with SVGs */}
                    <svg className="size-full" viewBox="0 0 100 100">
                      {roleDistribution.length > 0 && (
                        <>
                          <circle
                            cx="50"
                            cy="50"
                            fill="transparent"
                            r="40"
                            stroke="#ef4343"
                            strokeDasharray={`${(roleDistribution[0]?.percentage || 0) * 2.513} 251.3`}
                            strokeWidth="20"
                            transform="rotate(-90 50 50)"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            fill="transparent"
                            r="40"
                            stroke="#3b82f6"
                            strokeDasharray={`${(roleDistribution[1]?.percentage || 0) * 2.513} 251.3`}
                            strokeWidth="20"
                            transform={`rotate(${-90 + (roleDistribution[0]?.percentage || 0) * 3.6} 50 50)`}
                          />
                          <circle
                            cx="50"
                            cy="50"
                            fill="transparent"
                            r="40"
                            stroke="#10b981"
                            strokeDasharray={`${(roleDistribution[2]?.percentage || 0) * 2.513} 251.3`}
                            strokeWidth="20"
                            transform={`rotate(${-90 + ((roleDistribution[0]?.percentage || 0) + (roleDistribution[1]?.percentage || 0)) * 3.6} 50 50)`}
                          />
                          <circle
                            cx="50"
                            cy="50"
                            fill="transparent"
                            r="40"
                            stroke="#6b7280"
                            strokeDasharray={`${(roleDistribution[3]?.percentage || 0) * 2.513} 251.3`}
                            strokeWidth="20"
                            transform={`rotate(${-90 + ((roleDistribution[0]?.percentage || 0) + (roleDistribution[1]?.percentage || 0) + (roleDistribution[2]?.percentage || 0)) * 3.6} 50 50)`}
                          />
                        </>
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-mono font-bold">{totalUsers.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 uppercase">Total</span>
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-2 gap-y-3">
                    {roleDistribution.map((role) => (
                      <div key={role.role} className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${role.color}`}></span>
                        <span className="text-xs font-medium">{role.role} ({role.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

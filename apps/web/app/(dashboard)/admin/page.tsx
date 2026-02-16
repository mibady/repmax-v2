'use client';

import { useAdminAnalytics } from '@/lib/hooks';

function getBarColor(range: string): string {
  if (range.startsWith('75') || range.startsWith('76') || range.includes('100')) return 'bg-primary';
  if (range.startsWith('50') || range.startsWith('51')) return 'bg-blue-500';
  if (range.startsWith('25') || range.startsWith('26')) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, error, refresh } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load analytics</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Platform Analytics</h1>
            <p className="text-slate-400">{data.totalUsers.toLocaleString()} Total Users</p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 bg-[#1F1F22] text-white font-medium px-4 py-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.kpiData.map((kpi) => (
            <div key={kpi.id} className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
              <div className="text-slate-400 text-sm mb-2">{kpi.label}</div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">{kpi.value}</span>
                <div className={`flex items-center gap-0.5 text-sm font-medium ${kpi.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {kpi.isPositive ? 'trending_up' : 'trending_down'}
                  </span>
                  {Math.abs(kpi.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Profile Completeness */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-bold text-white text-sm">Profile Completeness</h2>
            </div>
            <div className="p-5 space-y-4">
              {data.profileCompleteness.map((bucket) => (
                <div key={bucket.range}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-400">{bucket.range}</span>
                    <span className="text-sm font-medium text-white">{bucket.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getBarColor(bucket.range)} transition-all duration-500`}
                      style={{ width: `${bucket.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-[#1F1F22] rounded-xl border border-white/5">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-bold text-white text-sm">Role Distribution</h2>
            </div>
            <div className="p-5 space-y-3">
              {data.roleDistribution.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="text-sm text-white capitalize">{role.role}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">{role.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-bold text-white text-sm">Monthly Growth</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(data.monthlyGrowth).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                  <span className="text-sm text-slate-400">{month}</span>
                  <span className="text-sm font-bold text-white">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

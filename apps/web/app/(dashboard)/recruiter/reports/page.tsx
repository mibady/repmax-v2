'use client';

import { Loader2 } from 'lucide-react';
import { useRecruitingReports, type StaffMember } from '@/lib/hooks';

function getRankBadgeColor(rank?: number) {
  if (rank === 1) return 'bg-[#D4AF37]';
  if (rank === 2) return 'bg-[#C0C0C0]';
  if (rank === 3) return 'bg-[#CD7F32]';
  return '';
}

export default function RecruitingReportsPage() {
  const { funnel, stats, staffActivity, zoneCoverage, isLoading, error } = useRecruitingReports();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Heading & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Recruiting Reports</h1>
          <p className="text-[#A1A1AA]">Pipeline analytics and staff performance metrics</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 rounded-full border border-[#2A2A2E] bg-[#1F1F22] px-4 py-1.5 text-sm font-medium text-white hover:border-[#D4AF37]/50 transition-colors">
            <span>Class of 2025</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 rounded-full border border-[#2A2A2E] bg-[#1F1F22] px-4 py-1.5 text-sm font-medium text-white hover:border-[#D4AF37]/50 transition-colors">
            <span>Varsity Program</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 rounded-full border border-[#2A2A2E] bg-[#1F1F22] px-4 py-1.5 text-sm font-medium text-white hover:border-[#D4AF37]/50 transition-colors">
            <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">calendar_today</span>
            <span>This Quarter</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500">{error.message}</p>
          </div>
        ) : (
          <>
            {/* Pipeline Funnel Visualization */}
            <section className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D4AF37]">filter_list</span>
                  Pipeline Funnel
                </h3>
                <button disabled title="Detail view coming soon" className="text-xs text-[#D4AF37] font-medium opacity-50 cursor-not-allowed">View Detail</button>
              </div>
              <div className="min-w-[800px] flex flex-col">
                {/* Funnel Bars */}
                <div className="flex items-stretch gap-1 h-32 relative">
                  {funnel.map((stage, index) => {
                    const isLast = index === funnel.length - 1;
                    const bgColors = [
                      'bg-[#2A2A2E]',
                      'bg-[#3a3a3e]',
                      'bg-[#4a4a4e]',
                      'bg-[#5a5a5e]',
                      'bg-[#6a6a6e]',
                      'bg-[#D4AF37]/10',
                    ];

                    return (
                      <div key={stage.stage} className="flex-1 flex flex-col group relative">
                        {index > 0 && (
                          <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center -translate-y-[20px]">
                            <div className={`bg-[#050505] border ${isLast ? 'border-[#D4AF37]/40 text-[#D4AF37]' : 'border-[#333] text-white'} text-[10px] px-2 py-0.5 rounded-full font-mono shadow-lg`}>
                              {stage.conversionRate}%
                            </div>
                          </div>
                        )}
                        <div className={`flex-1 ${bgColors[index]} ${index === 0 ? 'rounded-l-lg' : ''} ${isLast ? 'rounded-r-lg border border-[#D4AF37]/20 shadow-[0_0_15px_-5px_rgba(212,175,53,0.3)]' : 'border-r border-[#050505]'} relative overflow-hidden flex items-center justify-center`}>
                          {isLast && (
                            <div className="absolute inset-y-12 inset-x-0 bg-[#D4AF37] group-hover:bg-[#b08d1a] transition-colors"></div>
                          )}
                          <span className={`relative z-10 ${isLast ? 'text-3xl' : 'text-2xl'} font-bold font-mono ${isLast ? 'text-white drop-shadow-md' : 'text-white/90'} group-hover:scale-110 transition-transform`}>
                            {stage.count}
                          </span>
                        </div>
                        <div className="mt-3 text-center">
                          <p className={`text-xs font-bold uppercase tracking-wider ${isLast ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'} mb-1`}>
                            {stage.stage}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Stat Card 1 */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-1">Communications</p>
                    <p className="text-xs text-[#A1A1AA]/60">Calls, Emails, &amp; SMS</p>
                  </div>
                  <div className="p-2 bg-[#2A2A2E] rounded-lg text-[#A1A1AA] group-hover:text-white group-hover:bg-[#2A2A2E]/80 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white font-mono">{stats?.communications.value || 0}</span>
                  {stats?.communications.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stats?.communications.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {stats?.communications.changeType === 'increase' ? 'trending_up' : 'trending_down'}
                      </span>
                      {Math.abs(stats?.communications.change || 0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-1">Campus Visits</p>
                    <p className="text-xs text-[#A1A1AA]/60">Official &amp; Unofficial</p>
                  </div>
                  <div className="p-2 bg-[#2A2A2E] rounded-lg text-[#A1A1AA] group-hover:text-white group-hover:bg-[#2A2A2E]/80 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white font-mono">{stats?.campusVisits.value || 0}</span>
                  <span className="text-xs font-medium text-[#A1A1AA] flex items-center">
                    {stats?.campusVisits.comparison}
                  </span>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-colors group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A1A1AA] text-sm font-medium mb-1">Avg Time to Commit</p>
                    <p className="text-xs text-[#A1A1AA]/60">From Identified Date</p>
                  </div>
                  <div className="p-2 bg-[#2A2A2E] rounded-lg text-[#A1A1AA] group-hover:text-white group-hover:bg-[#2A2A2E]/80 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#D4AF37] font-mono">{stats?.avgTimeToCommit.value || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Detail Grid: Leaderboard & Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Staff Activity Table */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] overflow-hidden flex flex-col h-full">
                <div className="p-5 border-b border-[#333333] flex justify-between items-center">
                  <h3 className="font-semibold text-white">Staff Activity Leaderboard</h3>
                  <span className="text-[#A1A1AA] opacity-50" title="Options coming soon">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </span>
                </div>
                <div className="overflow-x-auto flex-1">
                  {staffActivity.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-[#A1A1AA]">
                      No staff activity data available
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#2A2A2E]/50 text-[#A1A1AA]">
                        <tr>
                          <th className="px-5 py-3 font-medium">Recruiter</th>
                          <th className="px-5 py-3 font-medium text-center">Calls</th>
                          <th className="px-5 py-3 font-medium text-center">Emails</th>
                          <th className="px-5 py-3 font-medium text-center">Visits</th>
                          <th className="px-5 py-3 font-medium text-right text-[#D4AF37]">Commits</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333333]">
                        {staffActivity.map((staff: StaffMember) => (
                          <tr key={staff.id} className="hover:bg-[#2A2A2E]/30 transition-colors group cursor-pointer">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  {staff.imageUrl ? (
                                    <div
                                      className="size-9 rounded-full bg-cover bg-center"
                                      style={{ backgroundImage: `url('${staff.imageUrl}')` }}
                                    ></div>
                                  ) : (
                                    <div className="size-9 rounded-full bg-[#2A2A2E] flex items-center justify-center text-xs font-bold text-white">
                                      {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                  )}
                                  {staff.rank && (
                                    <div className={`absolute -top-1 -right-1 ${getRankBadgeColor(staff.rank)} text-[#050505] rounded-full size-4 flex items-center justify-center text-[10px] font-bold border border-[#1F1F22]`}>
                                      {staff.rank}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-white">{staff.name}</p>
                                  <p className="text-xs text-[#A1A1AA]">{staff.region}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center font-mono text-[#A1A1AA] group-hover:text-white">{staff.calls}</td>
                            <td className="px-5 py-4 text-center font-mono text-[#A1A1AA] group-hover:text-white">{staff.emails}</td>
                            <td className="px-5 py-4 text-center font-mono text-[#A1A1AA] group-hover:text-white">{staff.visits}</td>
                            <td className="px-5 py-4 text-right font-bold text-[#D4AF37] font-mono">{staff.commits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="p-3 border-t border-[#333333] flex justify-center">
                  <button disabled title="Staff directory coming soon" className="text-xs font-medium text-[#A1A1AA] opacity-50 cursor-not-allowed">View All Staff</button>
                </div>
              </div>

              {/* Zone Coverage Bar Chart */}
              <div className="rounded-xl border border-[#333333] bg-[#1F1F22] p-6 flex flex-col h-full min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-white">Zone Coverage</h3>
                    <p className="text-xs text-[#A1A1AA]">Active prospects distribution</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="size-3 rounded-sm bg-[#D4AF37] block"></span>
                    <span className="text-xs text-[#A1A1AA]">Prospects</span>
                  </div>
                </div>
                <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2">
                  {zoneCoverage.map((zone) => (
                    <div key={zone.zone} className="flex flex-col items-center gap-2 group w-full">
                      <div className="relative w-full bg-[#2A2A2E]/30 rounded-t-sm h-[200px] flex items-end justify-center">
                        <div
                          className="w-full mx-2 bg-[#D4AF37]/60 group-hover:bg-[#D4AF37] transition-all rounded-t-sm relative"
                          style={{ height: zone.height || '0%' }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2A2A2E] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {zone.prospects}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#A1A1AA]">{zone.zone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

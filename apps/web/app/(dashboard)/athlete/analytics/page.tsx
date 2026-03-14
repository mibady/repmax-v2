'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileViews, useGeographicViews, useSubscription } from '@/lib/hooks';
import { getAthleteTier } from '@/lib/utils/subscription-tier';
import { UpgradeCTA } from '@/components/upgrade-cta';

interface KpiCard {
  icon: string;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  progress?: number;
  actionLabel?: string;
  actionHref?: string;
}

interface ViewerSection {
  label: string;
  percentage: number;
  color: string;
}


function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-dark border border-surface-border rounded-xl p-6">
            <div className="h-8 w-8 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatViewerName(view: { viewer_school?: string | null; viewer_role?: string | null }): string {
  if (view.viewer_school) return view.viewer_school;
  if (view.viewer_role) return `${view.viewer_role.charAt(0).toUpperCase() + view.viewer_role.slice(1)}`;
  return 'Anonymous Viewer';
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

export default function AthleteAnalyticsPage() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState(30);
  const { summary, grouped, recent, isLoading, error } = useProfileViews({ days: selectedDays, groupBy: 'day' });
  const { data: geoData } = useGeographicViews({ days: selectedDays });
  const { subscription, isLoading: subLoading } = useSubscription();
  const tier = getAthleteTier(subscription?.plan?.slug);

  // Build KPI cards from real data
  const kpiCards: KpiCard[] = [
    {
      icon: 'visibility',
      label: 'Profile Views',
      value: summary?.total_views?.toString() || '0',
      trend: undefined,
    },
    {
      icon: 'bookmark',
      label: 'Unique Viewers',
      value: summary?.unique_viewers?.toString() || '0',
    },
    {
      icon: 'sports',
      label: 'Coach Views',
      value: summary?.coach_views?.toString() || '0',
    },
    {
      icon: 'verified',
      label: 'Completeness',
      value: 'N/A',
      actionLabel: 'Edit Card',
      actionHref: '/athlete/card/edit',
    },
  ];

  // Filter KPIs by tier: premium/pro see everything, basic is gated (though basic shouldn't see this page at all due to early return)
  const visibleKpiCards = tier === 'basic'
    ? kpiCards.filter((c) => c.label === 'Profile Views' || c.label === 'Completeness')
    : kpiCards;

  // Calculate viewer types from geographic data or use defaults
  const viewerTypes: ViewerSection[] = geoData?.by_role
    ? Object.entries(geoData.by_role).map(([role, count], idx) => ({
        label: role.charAt(0).toUpperCase() + role.slice(1) + 's',
        percentage: Math.round((count as number / (summary?.total_views || 1)) * 100),
        color: idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-gray-500' : 'bg-gray-700',
      }))
    : [];

  // Get top viewers from recent data
  const topViewers = (recent || []).slice(0, 5).map((view, idx) => ({
    name: formatViewerName(view),
    logo: null as string | null,
    role: view.viewer_role || 'Unknown',
    time: formatTimeAgo(view.created_at),
    isBlurred: tier === 'pro' ? false : idx > 1, // Only Pro sees all names clearly
    blurLevel: tier === 'pro' ? 0 : (idx > 1 ? idx : 0),
    opacity: tier === 'pro' ? 100 : (idx > 1 ? 100 - (idx * 20) : 100),
  }));

  if (isLoading || subLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (tier === 'basic') {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Performance Analytics</h1>
            <p className="text-gray-400">Track your recruitment visibility and engagement metrics.</p>
          </div>
          <UpgradeCTA
            icon="analytics"
            title="Unlock Performance Analytics"
            description="Upgrade to Premium to track who's viewing your profile and measure your recruitment visibility."
            ctaText="Upgrade to Premium"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Performance Analytics</h1>
            <p className="text-gray-400">Track your recruitment visibility and engagement metrics.</p>
          </div>
          {/* Segmented Control */}
          <div className="bg-surface-dark border border-surface-border rounded-lg p-1 flex">
            {[
              { label: '7 Days', value: 7 },
              { label: '30 Days', value: 30 },
              { label: '90 Days', value: 90 },
            ].map((option) => (
              <label key={option.value} className="cursor-pointer relative">
                <input
                  className="peer sr-only"
                  name="time-range"
                  type="radio"
                  value={option.value}
                  checked={selectedDays === option.value}
                  onChange={() => setSelectedDays(option.value)}
                />
                <span className="block px-4 py-1.5 text-sm font-medium text-gray-400 rounded-md peer-checked:bg-primary peer-checked:text-black hover:text-white transition-all">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
            <p className="text-red-400">Failed to load analytics data. Please try again.</p>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {visibleKpiCards.map((card, idx) => (
              <div key={idx} className="bg-surface-dark border border-surface-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-surface-border/50 text-white">
                    <span className="material-symbols-outlined text-xl">{card.icon}</span>
                  </div>
                  {card.trend && (
                    <span className={`flex items-center text-sm font-medium px-2 py-1 rounded ${card.trend.positive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                      <span className="material-symbols-outlined text-sm mr-1">{card.trend.positive ? 'trending_up' : 'trending_down'}</span> {card.trend.value}
                    </span>
                  )}
                  {card.actionLabel && (
                    <Link className="text-primary text-xs font-medium hover:underline" href={card.actionHref || '#'}>{card.actionLabel}</Link>
                  )}
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{card.label}</h3>
                {card.progress !== undefined ? (
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                    <div className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${card.progress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                )}
              </div>
            ))}
          </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-surface-dark border border-surface-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white text-lg font-bold">Profile Views Over Time</h3>
                <p className="text-gray-400 text-sm">Last {selectedDays} Days</p>
              </div>
              <button
                onClick={() => {
                  const headers = ['Date', 'Views'];
                  const rows = grouped
                    ? Object.entries(grouped).map(([date, count]) => `${date},${count}`)
                    : [];
                  const csvContent = [headers.join(','), ...rows].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `analytics-report-${selectedDays}d.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1"
              >
                Full Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="relative w-full h-[300px] flex items-end">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500 font-medium">
                <span>{Math.max(...Object.values(grouped || { a: 10 })) || 50}</span>
                <span>{Math.round((Math.max(...Object.values(grouped || { a: 10 })) || 50) * 0.75)}</span>
                <span>{Math.round((Math.max(...Object.values(grouped || { a: 10 })) || 50) * 0.5)}</span>
                <span>{Math.round((Math.max(...Object.values(grouped || { a: 10 })) || 50) * 0.25)}</span>
                <span>0</span>
              </div>
              {/* Chart Content */}
              <div className="ml-10 flex-1 h-full relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-surface-border/50 border-t border-dashed border-gray-700"></div>
                  ))}
                </div>
                {/* SVG Line Chart — data-driven */}
                <svg className="w-full h-[calc(100%-2rem)] absolute top-0 left-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#d4af35" stopOpacity="0.2"></stop>
                      <stop offset="100%" stopColor="#d4af35" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  {(() => {
                    const values = grouped ? Object.values(grouped) : [];
                    if (values.length === 0) {
                      return (
                        <>
                          <path d="M0,95 L100,95 V100 H0 Z" fill="url(#chartGradient)" />
                          <path d="M0,95 L100,95" fill="none" stroke="#d4af35" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </>
                      );
                    }
                    const maxVal = Math.max(...values, 1);
                    const points = values.map((v, i) => {
                      const x = values.length === 1 ? 50 : (i / (values.length - 1)) * 100;
                      const y = 95 - (v / maxVal) * 85;
                      return `${x},${y}`;
                    });
                    const linePath = `M${points.join(' L')}`;
                    const fillPath = `${linePath} V100 H0 Z`;
                    return (
                      <>
                        <path d={fillPath} fill="url(#chartGradient)" />
                        <path d={linePath} fill="none" stroke="#d4af35" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      </>
                    );
                  })()}
                </svg>
                {/* X-Axis Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 font-medium pt-2">
                  {grouped && Object.keys(grouped).length > 0 ? (
                    Object.keys(grouped).slice(0, 5).map((date, idx) => (
                      <span key={idx}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    ))
                  ) : (
                    <>
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 3</span>
                      <span>Week 4</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Zone Benchmark */}
          <div className="bg-surface-dark border border-purple-900/50 rounded-xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl text-purple-500">public</span>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Zone Benchmark</h3>
            <p className="text-purple-400 text-sm font-medium mb-4">Regional Visibility</p>
            {geoData?.by_zone && geoData.by_zone.length > 0 ? (
              <div className="flex-1 flex flex-col gap-3">
                {geoData.by_zone.map((zone: { zone: string; view_count: number; unique_schools: number }) => {
                  const maxViews = geoData.by_zone[0].view_count || 1;
                  const pct = Math.round((zone.view_count / maxViews) * 100);
                  return (
                    <div key={zone.zone}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-purple-400">location_on</span>
                          {zone.zone}
                        </span>
                        <span className="text-white font-bold text-xs">
                          {zone.view_count} view{zone.view_count !== 1 ? 's' : ''}
                          {zone.unique_schools > 0 && (
                            <span className="text-gray-500 font-normal ml-1">({zone.unique_schools} school{zone.unique_schools !== 1 ? 's' : ''})</span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {geoData.top_zone && (
                  <p className="text-xs text-purple-400 mt-auto pt-2 border-t border-white/5">
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">trending_up</span>
                    Most views from <span className="font-bold text-white">{geoData.top_zone}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <span className="material-symbols-outlined text-4xl text-purple-500/30">public</span>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-400 block">No zone data yet</span>
                  <span className="text-xs text-gray-500 mt-1 block">Share your card to start seeing which regions are viewing your profile.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid: Viewers & Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Who's Viewing You (Left Column) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Viewer Types */}
            <div className="bg-surface-dark border border-surface-border rounded-xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">Who&apos;s Viewing You</h3>
              {viewerTypes.length > 0 ? (
                <div className="space-y-4">
                  {viewerTypes.map((viewer, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{viewer.label}</span>
                        <span className="text-white font-bold">{viewer.percentage}%</span>
                      </div>
                      <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                        <div className={`h-full ${viewer.color} rounded-full`} style={{ width: `${viewer.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <span className="material-symbols-outlined text-3xl text-gray-600">visibility_off</span>
                  <span className="text-sm text-gray-500">No viewer breakdown data yet</span>
                </div>
              )}
            </div>

          </div>

          {/* Top Viewers List (Right Column) */}
          <div className="lg:col-span-2 bg-surface-dark border border-surface-border rounded-xl p-6 relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-lg font-bold">Recent Viewers</h3>
              {recent && recent.length > 0 && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                  {recent.length} viewer{recent.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden relative">
              {/* List Header */}
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                <div className="col-span-6 md:col-span-5">Organization</div>
                <div className="col-span-3 md:col-span-3">Role</div>
                <div className="col-span-3 md:col-span-2 text-right">Date</div>
                <div className="col-span-0 md:col-span-2 hidden md:block text-right">Action</div>
              </div>
              {/* List Items */}
              <div className="space-y-2">
                {topViewers.length > 0 ? (
                  topViewers.map((viewer, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-4 items-center p-2 rounded-lg transition-colors ${viewer.isBlurred ? 'select-none' : 'hover:bg-surface-border/30'}`}
                      style={{
                        opacity: viewer.opacity / 100,
                        filter: viewer.blurLevel ? `blur(${viewer.blurLevel}px)` : undefined,
                      }}
                    >
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                        <div className="size-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {viewer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-white font-medium text-sm truncate">{viewer.name}</span>
                      </div>
                      <div className="col-span-3 md:col-span-3 text-gray-400 text-sm capitalize">{viewer.role}</div>
                      <div className="col-span-3 md:col-span-2 text-right text-gray-400 text-sm">{viewer.time}</div>
                      {!viewer.isBlurred && (
                        <div className="col-span-0 md:col-span-2 hidden md:flex justify-end">
                          <button onClick={() => router.push('/messages')} className="text-xs text-white bg-surface-border hover:bg-white hover:text-black px-3 py-1.5 rounded transition-colors">Message</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2">visibility_off</span>
                    <p>No recent viewers yet</p>
                  </div>
                )}
              </div>

              {/* Upgrade CTA Overlay */}
              {tier !== 'pro' && topViewers.length > 2 && (
                <div className="absolute bottom-0 left-0 right-0 h-[180px] flex items-center justify-center bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent z-10">
                  <div className="text-center p-6 max-w-sm">
                    <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                      <span className="material-symbols-outlined text-primary">lock</span>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">Unlock All Viewer Data</h4>
                    <p className="text-gray-400 text-sm mb-4">See exactly which coaches and universities are viewing your profile with RepMax Pro.</p>
                    <Link
                      href="/pricing"
                      className="w-full bg-primary hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      Upgrade to Pro
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

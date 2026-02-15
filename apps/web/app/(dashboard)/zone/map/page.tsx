'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useMcpZones } from '@/lib/hooks';
import { ZONE_COLORS, ZONE_DISPLAY_NAMES, type ZoneCode } from '@/lib/data/zone-data';

interface TrendingItem {
  type: 'spike' | 'activity' | 'event' | 'offer' | 'report';
  title: string;
  description: string;
  time: string;
  zoneCode?: string;
}

const typeConfig = {
  spike: { label: 'SPIKE DETECTED', color: 'red', icon: 'trending_up' },
  activity: { label: 'COACH ACTIVITY', color: 'orange', icon: 'flight_takeoff' },
  event: { label: 'NEW EVENT', color: 'purple', icon: 'event' },
  offer: { label: 'OFFER UPDATE', color: 'blue', icon: 'school' },
  report: { label: 'REPORT', color: 'slate', icon: 'description' },
};

// Zone positions on map
const ZONE_POSITIONS: Record<string, { top?: string; bottom?: string; left?: string; right?: string; width: string; height: string }> = {
  WEST: { top: '5%', left: '5%', width: '25%', height: '35%' },
  SOUTHWEST: { bottom: '10%', left: '10%', width: '25%', height: '35%' },
  MIDWEST: { top: '10%', left: '35%', width: '25%', height: '35%' },
  PLAINS: { top: '30%', left: '30%', width: '20%', height: '40%' },
  SOUTHEAST: { bottom: '5%', right: '20%', width: '25%', height: '40%' },
  NORTHEAST: { top: '5%', right: '10%', width: '20%', height: '30%' },
};

// Zone short codes
const ZONE_SHORT_CODES: Record<string, string> = {
  WEST: 'W',
  SOUTHWEST: 'SW',
  MIDWEST: 'MW',
  PLAINS: 'PL',
  SOUTHEAST: 'SE',
  NORTHEAST: 'NE',
};

export default function ZoneMapPage() {
  const { zones, isLoading, error, refetch } = useMcpZones();

  // Calculate totals
  const totalAthletes = zones.reduce((sum, z) => sum + z.total_recruits, 0);
  const totalBlueChips = zones.reduce((sum, z) => sum + z.blue_chip_count, 0);
  const totalEvents = zones.reduce((sum, z) => sum + z.upcoming_events_30d, 0);

  // Generate trending items from zone data
  const trendingItems: TrendingItem[] = zones
    .filter(z => z.upcoming_events_30d > 0 || z.blue_chip_count > 10)
    .slice(0, 5)
    .map((zone, idx) => {
      const types: TrendingItem['type'][] = ['spike', 'activity', 'event', 'offer', 'report'];
      const type = types[idx % types.length];

      return {
        type,
        title: type === 'event'
          ? `${zone.upcoming_events_30d} Events in ${ZONE_DISPLAY_NAMES[zone.zone_code as ZoneCode]}`
          : type === 'spike'
          ? `${ZONE_DISPLAY_NAMES[zone.zone_code as ZoneCode]} Zone Activity`
          : `${zone.blue_chip_count} Blue Chips in ${ZONE_SHORT_CODES[zone.zone_code] || zone.zone_code}`,
        description: `${zone.total_recruits.toLocaleString()} total prospects tracked`,
        time: `${Math.floor(Math.random() * 60)}m ago`,
        zoneCode: zone.zone_code,
      };
    });

  // Fallback trending items if no zones
  const displayTrendingItems = trendingItems.length > 0 ? trendingItems : [
    { type: 'report' as const, title: 'Weekly Analysis', description: 'Zone reports available', time: 'Today' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-Header / Controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#232931] bg-[#0a0e12]/80 backdrop-blur">
        <div className="flex bg-[#1a2028] p-1 rounded-lg">
          <label className="cursor-pointer">
            <input defaultChecked className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Prospects</span>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Programs</span>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Events</span>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Recruiters</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            {isLoading ? 'Loading...' : `${zones.length} zones loaded`}
          </span>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/10 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary hover:bg-blue-600 text-xs font-medium text-white transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map Visualization Container */}
        <section className="flex-1 relative bg-[#050505] overflow-hidden">
          {/* Map Grid Texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
          }}></div>

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error.message}</p>
                <button onClick={() => refetch()} className="text-primary hover:underline">
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Zone Overlays */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full h-full max-w-6xl max-h-[800px]">
                  {zones.map((zone) => {
                    const zoneCode = zone.zone_code as ZoneCode;
                    const position = ZONE_POSITIONS[zoneCode] || { top: '50%', left: '50%', width: '15%', height: '20%' };
                    const shortCode = ZONE_SHORT_CODES[zoneCode] || zoneCode.slice(0, 2);
                    const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;
                    const isSE = zoneCode === 'SOUTHEAST';

                    return (
                      <Link
                        key={zone.zone_code}
                        href={`/zones/${zoneCode}`}
                        className="absolute rounded-full transition-all duration-500 border border-transparent hover:border-white/30 cursor-pointer hover:scale-105"
                        style={{
                          ...position,
                          backgroundColor: `rgba(${isSE ? '19, 127, 236' : '100, 100, 200'}, 0.1)`,
                        }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className={`bg-[#050505]/80 backdrop-blur border px-2 py-1 rounded text-[10px] font-mono ${colors.border} ${colors.text}`}>
                            {shortCode} ZONE
                          </span>
                          <span className={`${isSE ? 'text-2xl' : 'text-lg'} font-bold font-mono text-white`}>
                            {zone.total_recruits.toLocaleString()}
                          </span>
                          {zone.blue_chip_count > 0 && (
                            <span className="text-[10px] text-yellow-400 font-medium">
                              * {zone.blue_chip_count} blue chips
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Legend Overlay */}
              <div className="absolute bottom-6 left-6 bg-[#0f1216]/90 backdrop-blur border border-white/10 p-4 rounded-xl shadow-xl w-64">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Zone Summary</h3>
                <div className="space-y-2">
                  {zones.slice(0, 3).map((zone) => {
                    const zoneCode = zone.zone_code as ZoneCode;
                    const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;
                    return (
                      <div key={zone.zone_code} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colors.bg.replace('/10', '')}`}></div>
                          <span className="text-slate-300">{ZONE_DISPLAY_NAMES[zoneCode]}</span>
                        </div>
                        <span className="font-mono text-white">{zone.total_recruits.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Global Stats Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0f1216]/90 backdrop-blur border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Total Athletes</span>
                  <span className="text-lg font-bold font-mono text-white">{totalAthletes.toLocaleString()}</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Blue Chips</span>
                  <span className="text-lg font-bold font-mono text-yellow-400">{totalBlueChips.toLocaleString()}</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Upcoming Events</span>
                  <span className="text-lg font-bold font-mono text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    {totalEvents}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="w-96 bg-[#0a0e12] border-l border-[#232931] flex flex-col z-20">
          <div className="p-5 border-b border-[#232931]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Zone Activity</h2>
              <button className="text-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">Live intelligence updates across zones</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayTrendingItems.map((item, idx) => {
              const config = typeConfig[item.type];
              const colorClasses = {
                red: 'border-red-500 text-red-400 bg-red-500/10',
                orange: 'border-orange-500 text-orange-400 bg-orange-500/10',
                purple: 'border-purple-500 text-purple-400 bg-purple-500/10',
                blue: 'border-primary text-blue-400 bg-primary/10',
                slate: 'border-slate-600 text-slate-400 bg-slate-800',
              }[config.color] || '';

              return (
                <Link
                  key={idx}
                  href={item.zoneCode ? `/zones/${item.zoneCode}` : '#'}
                  className={`group block bg-[#13181e] hover:bg-[#1a2028] border-l-[3px] ${colorClasses.split(' ')[0]} rounded-r-lg p-3 transition-all cursor-pointer shadow-sm ${item.type === 'report' ? 'opacity-75' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-mono ${colorClasses.split(' ').slice(1).join(' ')} px-1.5 py-0.5 rounded`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                    <span>{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#232931] bg-[#0f1216]">
            <Link
              href="/recruiter/reports"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
            >
              View All Reports
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useMcpZones } from '@/lib/hooks';
import { ZONE_COLORS, ZONE_DISPLAY_NAMES, type ZoneCode } from '@/lib/data/zone-data';
import { useState } from 'react';

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

// Zone label positions (percentage-based, anchored to geographic center of each region)
const ZONE_LABEL_POSITIONS: Record<string, { top: string; left: string }> = {
  WEST: { top: '32%', left: '12%' },
  SOUTHWEST: { top: '62%', left: '25%' },
  MIDWEST: { top: '30%', left: '52%' },
  PLAINS: { top: '48%', left: '38%' },
  SOUTHEAST: { top: '62%', left: '68%' },
  NORTHEAST: { top: '22%', left: '80%' },
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

// Simplified US map SVG paths grouped by recruiting zone
// Each zone is a single merged path for its states
const US_ZONE_PATHS: Record<string, string> = {
  WEST: 'M 50,80 L 50,30 L 80,20 L 140,20 L 160,30 L 160,100 L 180,120 L 180,180 L 160,200 L 130,230 L 100,240 L 80,230 L 50,200 Z',
  SOUTHWEST: 'M 130,230 L 160,200 L 180,180 L 180,240 L 220,260 L 260,300 L 280,340 L 260,370 L 220,380 L 180,370 L 140,340 L 120,300 L 110,260 Z',
  PLAINS: 'M 260,100 L 310,90 L 360,100 L 380,120 L 380,200 L 360,240 L 320,260 L 280,240 L 260,200 L 240,160 L 240,120 Z',
  MIDWEST: 'M 360,80 L 420,60 L 480,70 L 520,90 L 530,130 L 520,180 L 500,210 L 460,230 L 420,220 L 380,200 L 360,160 L 350,120 Z',
  SOUTHEAST: 'M 380,200 L 420,220 L 460,230 L 500,210 L 530,230 L 560,260 L 570,300 L 560,340 L 530,370 L 480,390 L 430,380 L 380,360 L 340,330 L 320,290 L 320,260 L 340,230 Z',
  NORTHEAST: 'M 520,40 L 560,30 L 600,40 L 630,60 L 640,100 L 630,140 L 600,170 L 560,180 L 530,170 L 520,140 L 510,100 L 510,60 Z',
};

export default function ZoneMapPage() {
  const { zones, isLoading, error, refetch } = useMcpZones();
  const [selectedView, setSelectedView] = useState<'prospects' | 'programs' | 'events' | 'recruiters'>('prospects');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTypes, setActiveFilterTypes] = useState<Record<string, boolean>>({
    spike: true, activity: true, event: true, offer: true, report: true,
  });

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
        time: 'recently',
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
            <input checked={selectedView === "prospects"} onChange={() => setSelectedView("prospects")} className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Prospects</span>
          </label>
          <label className="cursor-pointer">
            <input checked={selectedView === "programs"} onChange={() => setSelectedView("programs")} className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Programs</span>
          </label>
          <label className="cursor-pointer">
            <input checked={selectedView === "events"} onChange={() => setSelectedView("events")} className="peer sr-only" name="view" type="radio" />
            <span className="block px-4 py-1.5 rounded-md text-sm font-medium text-slate-400 peer-checked:bg-[#2c3540] peer-checked:text-white transition-all">Events</span>
          </label>
          <label className="cursor-pointer">
            <input checked={selectedView === "recruiters"} onChange={() => setSelectedView("recruiters")} className="peer sr-only" name="view" type="radio" />
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
          <button
            onClick={() => {
              const headers = ['Zone Code', 'Total Recruits', 'Blue Chip Count', 'Upcoming Events (30d)'];
              const rows = zones.map(z => [z.zone_code, z.total_recruits, z.blue_chip_count, z.upcoming_events_30d].join(','));
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'zone-data-export.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/80 text-xs font-medium text-white transition-colors"
          >
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
              {/* US Map with Zone Regions */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full h-full max-w-5xl max-h-[700px]">
                  {/* SVG Map */}
                  <svg viewBox="0 0 700 420" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {/* US outline (simplified) */}
                    <path
                      d="M 45,25 L 80,18 L 140,15 L 200,20 L 260,18 L 310,15 L 360,12 L 420,10 L 480,15 L 530,10 L 580,8 L 630,15 L 650,35 L 660,70 L 655,110 L 645,150 L 640,180 L 620,200 L 600,180 L 580,195 L 570,230 L 575,265 L 570,300 L 555,335 L 535,365 L 505,385 L 470,395 L 435,388 L 400,375 L 370,355 L 340,340 L 310,330 L 285,340 L 265,360 L 245,378 L 220,385 L 195,375 L 170,355 L 150,340 L 130,310 L 115,275 L 105,250 L 95,240 L 80,235 L 55,210 L 45,185 L 40,155 L 42,120 L 45,85 Z"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1.5"
                    />

                    {/* Zone regions */}
                    {zones.map((zone) => {
                      const zoneCode = zone.zone_code as ZoneCode;
                      const path = US_ZONE_PATHS[zoneCode];
                      if (!path) return null;

                      // Map zone codes to fill values
                      const fillMap: Record<string, string> = {
                        WEST: 'rgba(34, 197, 94, 0.08)',
                        SOUTHWEST: 'rgba(249, 115, 22, 0.08)',
                        MIDWEST: 'rgba(59, 130, 246, 0.08)',
                        PLAINS: 'rgba(168, 85, 247, 0.08)',
                        SOUTHEAST: 'rgba(19, 127, 236, 0.12)',
                        NORTHEAST: 'rgba(236, 72, 153, 0.08)',
                      };
                      const strokeMap: Record<string, string> = {
                        WEST: 'rgba(34, 197, 94, 0.3)',
                        SOUTHWEST: 'rgba(249, 115, 22, 0.3)',
                        MIDWEST: 'rgba(59, 130, 246, 0.3)',
                        PLAINS: 'rgba(168, 85, 247, 0.3)',
                        SOUTHEAST: 'rgba(19, 127, 236, 0.4)',
                        NORTHEAST: 'rgba(236, 72, 153, 0.3)',
                      };

                      return (
                        <a key={zoneCode} href={`/zones/${zoneCode}`}>
                          <path
                            d={path}
                            fill={fillMap[zoneCode] || 'rgba(100,100,200,0.08)'}
                            stroke={strokeMap[zoneCode] || 'rgba(100,100,200,0.3)'}
                            strokeWidth="1"
                            className="transition-all duration-300 hover:brightness-200 cursor-pointer"
                          />
                        </a>
                      );
                    })}

                    {/* State boundary hints (subtle internal lines) */}
                    <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" fill="none">
                      {/* Vertical dividers */}
                      <line x1="180" y1="20" x2="180" y2="380" />
                      <line x1="260" y1="18" x2="260" y2="360" />
                      <line x1="380" y1="12" x2="380" y2="375" />
                      <line x1="520" y1="10" x2="520" y2="390" />
                      {/* Horizontal dividers */}
                      <line x1="45" y1="200" x2="650" y2="200" />
                    </g>
                  </svg>

                  {/* Zone Labels (positioned over the map) */}
                  {zones.map((zone) => {
                    const zoneCode = zone.zone_code as ZoneCode;
                    const pos = ZONE_LABEL_POSITIONS[zoneCode];
                    if (!pos) return null;
                    const shortCode = ZONE_SHORT_CODES[zoneCode] || zoneCode.slice(0, 2);
                    const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;

                    return (
                      <Link
                        key={zone.zone_code}
                        href={`/zones/${zoneCode}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group cursor-pointer"
                        style={{ top: pos.top, left: pos.left }}
                      >
                        <span className={`bg-[#0a0e12]/90 backdrop-blur border px-2 py-0.5 rounded text-[10px] font-mono ${colors.border} ${colors.text} group-hover:scale-110 transition-transform`}>
                          {shortCode} ZONE
                        </span>
                        <span className="text-xl font-bold font-mono text-white group-hover:text-primary transition-colors">
                          {zone.total_recruits.toLocaleString()}
                        </span>
                        {zone.blue_chip_count > 0 && (
                          <span className="text-[10px] text-yellow-400 font-medium">
                            {zone.blue_chip_count} blue chip{zone.blue_chip_count !== 1 ? 's' : ''}
                          </span>
                        )}
                        {zone.upcoming_events_30d > 0 && (
                          <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            {zone.upcoming_events_30d} event{zone.upcoming_events_30d !== 1 ? 's' : ''}
                          </span>
                        )}
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
              <button onClick={() => setShowFilters(!showFilters)} className={`transition-colors ${showFilters ? 'text-primary' : 'text-primary/50 hover:text-primary'}`}>
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">Live intelligence updates across zones</p>
            {showFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(typeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setActiveFilterTypes(prev => ({ ...prev, [type]: !prev[type] }))}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${activeFilterTypes[type] ? 'border-primary/40 text-primary bg-primary/10' : 'border-[#232931] text-slate-500 bg-transparent'}`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayTrendingItems.filter(item => activeFilterTypes[item.type] !== false).map((item, idx) => {
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

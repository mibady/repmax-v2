'use client';

import Link from 'next/link';

interface ZoneData {
  code: string;
  label: string;
  count: number;
  color: string;
  position: { top?: string; bottom?: string; left?: string; right?: string; width: string; height: string };
}

interface TrendingItem {
  type: 'spike' | 'activity' | 'event' | 'offer' | 'report';
  title: string;
  description: string;
  time: string;
}

const zones: ZoneData[] = [
  { code: 'W', label: 'W ZONE', count: 842, color: 'blue', position: { top: '5%', left: '5%', width: '30%', height: '35%' } },
  { code: 'SW', label: 'SW ZONE', count: 1205, color: 'purple', position: { bottom: '10%', left: '10%', width: '25%', height: '35%' } },
  { code: 'MW', label: 'MW ZONE', count: 980, color: 'indigo', position: { top: '10%', left: '35%', width: '25%', height: '35%' } },
  { code: 'PL', label: 'PL ZONE', count: 450, color: 'cyan', position: { top: '30%', left: '30%', width: '20%', height: '40%' } },
  { code: 'SE', label: 'SE ZONE', count: 2410, color: 'primary', position: { bottom: '5%', right: '20%', width: '25%', height: '40%' } },
  { code: 'NE', label: 'NE ZONE', count: 765, color: 'emerald', position: { top: '5%', right: '10%', width: '20%', height: '30%' } },
];

const trendingItems: TrendingItem[] = [
  { type: 'spike', title: 'SE Zone Commits Surge', description: '12 new commits in Miami area', time: '2m ago' },
  { type: 'activity', title: 'Texas Tech Staff Visit', description: 'Spotted in Dallas Metro (SW)', time: '15m ago' },
  { type: 'event', title: 'LA Elite Camp Invite', description: '150+ Prospects Registered', time: '45m ago' },
  { type: 'offer', title: 'QB #14 just offered', description: 'Georgia Tech offer extended', time: '1h ago' },
  { type: 'report', title: 'Weekly NE Zone Analysis', description: 'Available for download', time: '3h ago' },
];

const typeConfig = {
  spike: { label: 'SPIKE DETECTED', color: 'red', icon: 'trending_up' },
  activity: { label: 'COACH ACTIVITY', color: 'orange', icon: 'flight_takeoff' },
  event: { label: 'NEW EVENT', color: 'purple', icon: 'event' },
  offer: { label: 'OFFER UPDATE', color: 'blue', icon: 'school' },
  report: { label: 'REPORT', color: 'slate', icon: 'description' },
};

export default function ZoneMapPage() {
  return (
    <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
      {/* Top Navigation */}
      <header className="flex-none flex items-center justify-between border-b border-[#232931] bg-[#0a0e12] px-6 py-3 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">pentagon</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">RepMax</h1>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-[#1a2028] p-1 rounded-lg">
            <Link className="px-4 py-1.5 rounded text-sm font-medium bg-primary text-white shadow-sm transition-all" href="/dashboard">Dashboard</Link>
            <Link className="px-4 py-1.5 rounded text-sm font-medium text-slate-400 hover:text-white transition-all" href="/dashboard/zone">Intelligence</Link>
            <Link className="px-4 py-1.5 rounded text-sm font-medium text-slate-400 hover:text-white transition-all" href="#">Reports</Link>
            <Link className="px-4 py-1.5 rounded text-sm font-medium text-slate-400 hover:text-white transition-all" href="/settings">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden sm:block w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[20px]">search</span>
            <input
              className="w-full bg-[#1a2028] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary"
              placeholder="Search athletes, programs..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-white">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-[#0a0e12]"></span>
            </button>
            <div className="size-9 rounded-full bg-slate-700 border border-slate-600"></div>
          </div>
        </div>
      </header>

      {/* Sub-Header / Controls */}
      <div className="flex-none flex items-center justify-between px-6 py-3 border-b border-[#232931] bg-[#0a0e12]/80 backdrop-blur z-10">
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
          <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Last updated: 14m ago</span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors border border-white/10">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary hover:bg-blue-600 text-xs font-medium text-white transition-colors">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Main Dashboard Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Map Visualization Container */}
        <section className="flex-1 relative bg-[#050505] overflow-hidden">
          {/* Map Grid Texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
          }}></div>

          {/* Zone Overlays */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full h-full max-w-6xl max-h-[800px]">
              {zones.map((zone) => (
                <div
                  key={zone.code}
                  className={`absolute rounded-full transition-colors duration-500 border border-transparent hover:border-${zone.color}-500/30 cursor-pointer`}
                  style={{
                    ...zone.position,
                    backgroundColor: zone.color === 'primary' ? 'rgba(19, 127, 236, 0.1)' : `rgba(var(--${zone.color}-rgb), 0.05)`,
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className={`bg-[#050505]/80 backdrop-blur border border-${zone.color}-500/30 px-2 py-1 rounded text-[10px] font-mono text-${zone.color}-200`}>
                      {zone.label}
                    </span>
                    <span className={`text-${zone.code === 'SE' ? '2xl' : 'lg'} font-bold font-mono text-white`}>
                      {zone.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-[#0f1216]/90 backdrop-blur border border-white/10 p-4 rounded-xl shadow-xl w-64">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Zone Activity Index</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_2px_rgba(239,68,68,0.6)]"></div>
                  <span className="text-slate-300">Critical (90%+)</span>
                </div>
                <span className="font-mono text-white">3</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_15px_2px_rgba(249,115,22,0.6)]"></div>
                  <span className="text-slate-300">High (75-90%)</span>
                </div>
                <span className="font-mono text-white">5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_2px_rgba(19,127,236,0.4)]"></div>
                  <span className="text-slate-300">Moderate (50-75%)</span>
                </div>
                <span className="font-mono text-white">12</span>
              </div>
            </div>
          </div>

          {/* Global Stats Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0f1216]/90 backdrop-blur border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Total Athletes</span>
              <span className="text-lg font-bold font-mono text-white">14,205</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Active Programs</span>
              <span className="text-lg font-bold font-mono text-white">350</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-slate-500 tracking-wider font-semibold">Recruiters Online</span>
              <span className="text-lg font-bold font-mono text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                85
              </span>
            </div>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="w-96 bg-[#0a0e12] border-l border-[#232931] flex flex-col z-20">
          <div className="p-5 border-b border-[#232931]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Trending This Week</h2>
              <button className="text-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">Live intelligence updates across zones</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {trendingItems.map((item, idx) => {
              const config = typeConfig[item.type];
              const colorClasses = {
                red: 'border-red-500 text-red-400 bg-red-500/10',
                orange: 'border-orange-500 text-orange-400 bg-orange-500/10',
                purple: 'border-purple-500 text-purple-400 bg-purple-500/10',
                blue: 'border-primary text-blue-400 bg-primary/10',
                slate: 'border-slate-600 text-slate-400 bg-slate-800',
              }[config.color] || '';

              return (
                <div
                  key={idx}
                  className={`group bg-[#13181e] hover:bg-[#1a2028] border-l-[3px] ${colorClasses.split(' ')[0]} rounded-r-lg p-3 transition-all cursor-pointer shadow-sm ${item.type === 'report' ? 'opacity-75' : ''}`}
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
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#232931] bg-[#0f1216]">
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors">
              View All Intelligence
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

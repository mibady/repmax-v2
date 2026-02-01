'use client';

import Link from 'next/link';

interface KpiCard {
  icon: string;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  progress?: number;
  actionLabel?: string;
  actionHref?: string;
}

interface Viewer {
  name: string;
  logo?: string;
  role: string;
  time: string;
  isBlurred?: boolean;
  blurLevel?: number;
  opacity?: number;
}

interface ViewerSection {
  label: string;
  percentage: number;
  color: string;
}

interface ProfileSection {
  label: string;
  heightPercent: number;
  isHighlighted?: boolean;
}

const kpiCards: KpiCard[] = [
  {
    icon: 'visibility',
    label: 'Profile Views',
    value: '47',
    trend: { value: '+12%', positive: true },
  },
  {
    icon: 'bookmark',
    label: 'Shortlist Adds',
    value: '5',
  },
  {
    icon: 'chat',
    label: 'Messages',
    value: '3',
  },
  {
    icon: 'verified',
    label: 'Completeness',
    value: '85%',
    progress: 85,
    actionLabel: 'Complete now',
    actionHref: '#',
  },
];

const viewerTypes: ViewerSection[] = [
  { label: 'College Recruiters', percentage: 65, color: 'bg-primary' },
  { label: 'Coaches', percentage: 25, color: 'bg-gray-500' },
  { label: 'Scouts/Media', percentage: 10, color: 'bg-gray-700' },
];

const profileSections: ProfileSection[] = [
  { label: 'Highlights', heightPercent: 80, isHighlighted: true },
  { label: 'Stats', heightPercent: 45 },
  { label: 'Academics', heightPercent: 60 },
  { label: 'Bio', heightPercent: 30 },
];

const topViewers: Viewer[] = [
  {
    name: 'Univ. of Alabama',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGTMHkprQsESHvvtDAMQQcnRXEqI371YgnT1f1DHgXg_gNAGhyywcw8Xp19VGuxO9t4NdLF5UxWdzPAVHsMJzPnf6FYE-1dUzzWlZiIqpKDeSHRSyZZlgag54TnXDQfPcWky-EE3XsJY4gDbGxBvBoVr8A5MuUaFMZ_XvUrhSMng5qff4-xGgWAfVxVwdAT1f7ACKLqoRnkRm5gYLNoiU62Dyw2leWZSqqUlvLLQlUuydoWFrCnZCoyOFA5IS8nC_0CHLk49Rc-vc',
    role: 'Recruiter',
    time: '2h ago',
  },
  {
    name: 'USC',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAirnOlotI5aNNQiqSdxXUxn9T0mpGGR74IHkD7pfj61NB-WLYVPV-5anNO2B33nlEQLZlOwe2KePV2431_JSJ8y-A0kJ-GwJmqJFTdZWs-VPnhBnP2v53wiqX9jcU7gAwjjiD911-8qpiufADN9IZz0YH8H8io2C9gw_WatyD37Te25DVL9empXW3lg7PRxo_TEXLejFtE-tiDApHH-JSI1HvqabwyRi4UJ_8Lt3IO8SRfwHrJ6cRE7HaafyEmxoNZt-Qgtr4TK2E',
    role: 'Assistant Coach',
    time: '5h ago',
  },
  {
    name: 'University of Texas',
    role: 'Head Coach',
    time: '1d ago',
    isBlurred: true,
    blurLevel: 2,
    opacity: 40,
  },
  {
    name: 'Oregon State',
    role: 'Scout',
    time: '1d ago',
    isBlurred: true,
    blurLevel: 3,
    opacity: 30,
  },
  {
    name: 'Clemson',
    role: 'Scout',
    time: '2d ago',
    isBlurred: true,
    blurLevel: 3,
    opacity: 20,
  },
];

export default function AthleteAnalyticsPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface-dark/95 backdrop-blur supports-[backdrop-filter]:bg-surface-dark/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">RepMax</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-white font-medium hover:text-primary transition-colors border-b-2 border-primary py-5" href="#">Dashboard</Link>
            <Link className="text-gray-400 font-medium hover:text-white transition-colors" href="#">Profile</Link>
            <Link className="text-gray-400 font-medium hover:text-white transition-colors" href="#">Recruiting</Link>
            <Link className="text-gray-400 font-medium hover:text-white transition-colors" href="#">Settings</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-surface-border cursor-pointer"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBncbwqZwnt7mBUnq-eJ0yXaBfAllQdUpKZCOH12LIiVU77igebdBU0ypd9SKhxnwNHSFYoafE9Y14sOXqXB324x4P9nCLOzrn7e2Xthxt-y4eSAI11dYuDr2aTchL7dlNOpLq2c76IlNOrX3FqvoIUFpf4-UFnZH4dYnH1cXc18cWmZw_jOueVir9nCSxWr90VbN2L1KzEdOkwojZ11wkD6UxG2hVrXvUCVQ8iHQcN5_1g3aHyX_KTf1qgFEtcnuU3RQ9q-1F83Cc')" }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Performance Analytics</h1>
            <p className="text-gray-400">Track your recruitment visibility and engagement metrics.</p>
          </div>
          {/* Segmented Control */}
          <div className="bg-surface-dark border border-surface-border rounded-lg p-1 flex">
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="time-range" type="radio" value="7d" />
              <span className="block px-4 py-1.5 text-sm font-medium text-gray-400 rounded-md peer-checked:bg-primary peer-checked:text-black hover:text-white transition-all">7 Days</span>
            </label>
            <label className="cursor-pointer relative">
              <input defaultChecked className="peer sr-only" name="time-range" type="radio" value="30d" />
              <span className="block px-4 py-1.5 text-sm font-medium text-gray-400 rounded-md peer-checked:bg-primary peer-checked:text-black hover:text-white transition-all">30 Days</span>
            </label>
            <label className="cursor-pointer relative">
              <input className="peer sr-only" name="time-range" type="radio" value="90d" />
              <span className="block px-4 py-1.5 text-sm font-medium text-gray-400 rounded-md peer-checked:bg-primary peer-checked:text-black hover:text-white transition-all">90 Days</span>
            </label>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card, idx) => (
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
                <p className="text-gray-400 text-sm">Last 30 Days</p>
              </div>
              <button className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                Full Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="relative w-full h-[300px] flex items-end">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500 font-medium">
                <span>50</span>
                <span>40</span>
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>
              {/* Chart Content */}
              <div className="ml-10 flex-1 h-full relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-surface-border/50 border-t border-dashed border-gray-700"></div>
                  ))}
                </div>
                {/* SVG Line Chart */}
                <svg className="w-full h-[calc(100%-2rem)] absolute top-0 left-0 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#d4af35" stopOpacity="0.2"></stop>
                      <stop offset="100%" stopColor="#d4af35" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M0,85 C10,80 20,88 30,65 C40,42 50,55 60,40 C70,25 80,35 90,20 C95,12 100,10 100,10 V100 H0 Z" fill="url(#chartGradient)"></path>
                  <path d="M0,85 C10,80 20,88 30,65 C40,42 50,55 60,40 C70,25 80,35 90,20 C95,12 100,10 100,10" fill="none" stroke="#d4af35" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                  <g transform="translate(60, 40)">
                    <circle fill="#050505" r="3" stroke="#d4af35" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></circle>
                  </g>
                </svg>
                {/* Annotation Tooltip */}
                <div className="absolute" style={{ left: '60%', top: '40%', transform: 'translate(-50%, -100%)' }}>
                  <div className="bg-surface-border text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-gray-600">
                    Shortlisted by TCU
                  </div>
                </div>
                {/* X-Axis Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 font-medium pt-2">
                  <span>Aug 1</span>
                  <span>Aug 7</span>
                  <span>Aug 14</span>
                  <span>Aug 21</span>
                  <span>Aug 28</span>
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
            <p className="text-purple-400 text-sm font-medium mb-6">West Zone Performance</p>
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="text-center">
                <span className="text-4xl font-bold text-white block">Top 15%</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">In Your Region</span>
              </div>
              <div className="relative pt-6">
                {/* Slider Track */}
                <div className="h-2 bg-surface-border rounded-full relative">
                  <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-purple-900 to-purple-500 w-[85%] rounded-full"></div>
                </div>
                {/* Markers */}
                <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-medium uppercase">
                  <span>Bottom 10%</span>
                  <span>Average</span>
                  <span>Top 1%</span>
                </div>
                {/* Tooltip styled marker */}
                <div className="absolute top-0 left-[85%] -translate-x-1/2 -mt-2">
                  <div className="w-0.5 h-4 bg-white mx-auto mb-1"></div>
                  <div className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">You</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Viewers & Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Who's Viewing You (Left Column) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Viewer Types */}
            <div className="bg-surface-dark border border-surface-border rounded-xl p-6">
              <h3 className="text-white text-lg font-bold mb-4">Who&apos;s Viewing You</h3>
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
            </div>

            {/* Most Viewed Sections */}
            <div className="bg-surface-dark border border-surface-border rounded-xl p-6 flex-1">
              <h3 className="text-white text-lg font-bold mb-4">Most Viewed Sections</h3>
              <div className="flex items-end gap-3 h-32 pt-2">
                {profileSections.map((section, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end gap-2 group">
                    <div
                      className={`w-full rounded-t-sm transition-colors ${section.isHighlighted ? 'bg-primary opacity-90 group-hover:opacity-100' : 'bg-surface-border group-hover:bg-gray-600'}`}
                      style={{ height: `${section.heightPercent}%` }}
                    ></div>
                    <span className="text-[10px] text-gray-400 text-center truncate">{section.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Viewers List (Right Column - Spanning 2 cols on LG) */}
          <div className="lg:col-span-2 bg-surface-dark border border-surface-border rounded-xl p-6 relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-lg font-bold">Top Viewers</h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">Active Now</span>
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
                {topViewers.map((viewer, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-4 items-center p-2 rounded-lg transition-colors ${viewer.isBlurred ? 'select-none' : 'hover:bg-surface-border/30'}`}
                    style={{
                      opacity: viewer.opacity ? viewer.opacity / 100 : 1,
                      filter: viewer.blurLevel ? `blur(${viewer.blurLevel}px)` : undefined,
                    }}
                  >
                    <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                      {viewer.logo ? (
                        <div className="size-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                          <img alt={`${viewer.name} logo`} className="w-5 h-5 object-contain" src={viewer.logo} />
                        </div>
                      ) : (
                        <div className="size-8 rounded-full bg-gray-600"></div>
                      )}
                      <span className="text-white font-medium text-sm truncate">{viewer.name}</span>
                    </div>
                    <div className="col-span-3 md:col-span-3 text-gray-400 text-sm">{viewer.role}</div>
                    <div className="col-span-3 md:col-span-2 text-right text-gray-400 text-sm">{viewer.time}</div>
                    {!viewer.isBlurred && (
                      <div className="col-span-0 md:col-span-2 hidden md:flex justify-end">
                        <button className="text-xs text-white bg-surface-border hover:bg-white hover:text-black px-3 py-1.5 rounded transition-colors">Message</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Upgrade CTA Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-[180px] flex items-center justify-center bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent z-10">
                <div className="text-center p-6 max-w-sm">
                  <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                    <span className="material-symbols-outlined text-primary">lock</span>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Unlock All Viewer Data</h4>
                  <p className="text-gray-400 text-sm mb-4">See exactly which coaches and universities are viewing your profile with RepMax Pro.</p>
                  <button className="w-full bg-primary hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                    Upgrade to Pro
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-surface-border mt-8 py-8 bg-surface-dark">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2023 RepMax Analytics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

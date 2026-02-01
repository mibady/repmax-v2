import Link from 'next/link';
import Image from 'next/image';

interface Assignment {
  id: string;
  recruiter: string;
  zone: string;
  color: string;
  states: string[];
  imageUrl: string;
}

interface UnassignedZone {
  id: string;
  name: string;
  states: string;
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    recruiter: 'Coach Martinez',
    zone: 'SOUTHWEST',
    color: 'orange',
    states: ['TX', 'AZ', 'NM', 'NV'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKMNfqhA3Y4K2Vn2GsO-4YnZUEcLaYlsKsFb6-9RX7cwPs7KHrDDxd1IzNd_rE6oZUFuHtzN0Zm3KuSa2mOsc8JmfSl6SLCg7JttYVwdNmEIWycK_yTAZ3H7d611SQq8mQ3JwdGU3Ge0dXTZcHfhBfV_uu8l94ikNV-Q_JGZ5mi_7MbhPis_48TJzii1S50BzrMcH78FzOm6lgDlJk6ynXlo07YSUjS2TOB8gJW1aze8jeyX5KbWaN5kYVGWcx9GqX2m9jYgJvZBk',
  },
  {
    id: '2',
    recruiter: 'Sarah Jenkins',
    zone: 'PACIFIC',
    color: 'teal',
    states: ['CA', 'OR', 'WA'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjRlwOrXtxqF1rl9lXKlYANtartnTjvfLYqDT7j88FLnbk3s58fB6NaHynF8qJ_f3DIj2RIX20I-REbxJiKkLyQTwPJ-UsCDV2MT9eeDvPy0LmS_tXn1ky8dUlIups6X3obeT0pQ7a9B45apFvSqSxRH-Yxagw37OZ_TaEaiKPG5aIvzsmLFcZAjK7O7urbi8gP-jWhPhloL8aN0J-pO-aM6UT1Ow4evaFr5DadFdKyvwxVX1bmgKUKlIW-kXS89Y3Mun5STiBDGk',
  },
  {
    id: '3',
    recruiter: 'Mark Cooper',
    zone: 'SOUTHEAST',
    color: 'indigo',
    states: ['FL', 'GA', 'SC', 'NC'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDgdm8Sgd36Hp-GHBtvczhEJH4wBSZL9mcfIAqIXSFMTCiX9LXzAWonlengRglghwwvSEArAi-3eZmXuvxSDY9o1fI4WJBMokuJUDNDPH-ty4aqZqeQwtIBZrUSTH8OMB3SIivaimgTMWgMc0bqEHiXvaF-kzyWvzfTmvQoz1gR09wO-HjKoL7xpxosNAAKKN_wuWtuZASXqeTprF-54OieQ5nbVhBqdo1QkyS6D6YKqWKs0sOllUf7AINPxGhUpfRa2ydNgaafJg',
  },
];

const unassignedZones: UnassignedZone[] = [
  { id: '1', name: 'Northeast Zone', states: 'Includes NY, MA, PA, NJ, CT' },
  { id: '2', name: 'Midwest Zone', states: 'Includes IL, OH, MI, IN, WI' },
];

function getZoneColors(color: string) {
  const colors: Record<string, { badge: string; state: string; border: string }> = {
    orange: {
      badge: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
      state: 'text-orange-300 bg-orange-900/30 border-orange-500/20',
      border: 'hover:border-orange-500/30',
    },
    teal: {
      badge: 'bg-teal-500/20 text-teal-400 border-teal-500/20',
      state: 'text-teal-300 bg-teal-900/30 border-teal-500/20',
      border: 'hover:border-teal-500/30',
    },
    indigo: {
      badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
      state: 'text-indigo-300 bg-indigo-900/30 border-indigo-500/20',
      border: 'hover:border-indigo-500/30',
    },
  };
  return colors[color] || colors.orange;
}

export default function TerritoryAssignmentsPage() {
  return (
    <div className="bg-[#050505] text-white font-display h-screen flex overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      {/* Navigation Sidebar */}
      <nav className="w-20 lg:w-64 h-full bg-[#0a0a0a] border-r border-[#262626] flex flex-col justify-between shrink-0 z-20">
        <div className="flex flex-col gap-6 p-4">
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-[#D4AF37]/20 rounded-lg h-10 w-10 shrink-0 flex items-center justify-center text-[#D4AF37]">
              <span className="material-symbols-outlined">api</span>
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-white text-base font-bold leading-tight">RepMax</h1>
              <p className="text-neutral-500 text-xs font-medium">Admin Console</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-2 mt-4">
            <Link href="/dashboard/recruiter" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">dashboard</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Dashboard</p>
            </Link>
            <Link href="/dashboard/recruiter/territory" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <span className="material-symbols-outlined">map</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Assignments</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">group</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Recruiters</p>
            </Link>
            <Link href="/dashboard/recruiter/prospects" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">person_search</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Candidates</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">settings</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Settings</p>
            </Link>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#262626]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-neutral-700"></div>
            <div className="hidden lg:flex flex-col">
              <p className="text-white text-sm font-medium leading-none">Admin User</p>
              <p className="text-neutral-500 text-xs mt-1">Logout</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area (Split View) */}
      <main className="flex flex-1 h-full overflow-hidden">
        {/* Left Panel: Map Visualization (55%) */}
        <section className="w-[55%] h-full relative bg-[#080808] border-r border-[#262626] hidden md:block overflow-hidden group">
          {/* Map Background */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)' }}></div>

          {/* Simulated Map Container */}
          <div className="w-full h-full relative flex items-center justify-center p-12">
            <div className="relative w-full aspect-[4/3] max-w-4xl">
              {/* Map placeholder - using a dark gradient instead of external image */}
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[120px] text-white/10">map</span>
              </div>

              {/* Map Overlays / Zones */}
              {/* Southwest Zone */}
              <div className="absolute bottom-[20%] left-[20%] group/zone cursor-pointer">
                <div className="absolute -inset-4 bg-orange-500/10 rounded-full blur-xl group-hover/zone:bg-orange-500/20 transition-all"></div>
                <div className="relative flex flex-col items-center">
                  <div className="h-3 w-3 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-pulse"></div>
                  <div className="mt-2 bg-[#121212]/90 backdrop-blur-md border border-orange-500/30 px-3 py-1.5 rounded-lg shadow-xl">
                    <p className="text-xs font-bold text-orange-400 tracking-wider">SOUTHWEST</p>
                    <p className="text-[10px] text-white font-medium">Martinez</p>
                  </div>
                </div>
              </div>

              {/* Pacific Zone */}
              <div className="absolute top-[30%] left-[8%] group/zone cursor-pointer">
                <div className="absolute -inset-4 bg-teal-500/10 rounded-full blur-xl group-hover/zone:bg-teal-500/20 transition-all"></div>
                <div className="relative flex flex-col items-center">
                  <div className="h-3 w-3 bg-teal-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
                  <div className="mt-2 bg-[#121212]/90 backdrop-blur-md border border-teal-500/30 px-3 py-1.5 rounded-lg shadow-xl">
                    <p className="text-xs font-bold text-teal-400 tracking-wider">PACIFIC</p>
                    <p className="text-[10px] text-white font-medium">Jenkins</p>
                  </div>
                </div>
              </div>

              {/* Northeast Zone (Unassigned) */}
              <div className="absolute top-[25%] right-[15%] group/zone cursor-pointer">
                <div className="absolute -inset-4 bg-neutral-500/10 rounded-full blur-xl group-hover/zone:bg-neutral-500/20 transition-all"></div>
                <div className="relative flex flex-col items-center">
                  <div className="h-3 w-3 bg-neutral-500 rounded-full border border-neutral-300 shadow-[0_0_15px_rgba(115,115,115,0.3)]"></div>
                  <div className="mt-2 bg-[#121212]/90 backdrop-blur-md border border-neutral-700 border-dashed px-3 py-1.5 rounded-lg shadow-xl">
                    <p className="text-xs font-bold text-neutral-400 tracking-wider">NORTHEAST</p>
                    <p className="text-[10px] text-neutral-500 font-medium italic">Unassigned</p>
                  </div>
                </div>
              </div>

              {/* Southeast Zone */}
              <div className="absolute bottom-[25%] right-[22%] group/zone cursor-pointer">
                <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-xl group-hover/zone:bg-indigo-500/20 transition-all"></div>
                <div className="relative flex flex-col items-center">
                  <div className="h-3 w-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  <div className="mt-2 bg-[#121212]/90 backdrop-blur-md border border-indigo-500/30 px-3 py-1.5 rounded-lg shadow-xl">
                    <p className="text-xs font-bold text-indigo-400 tracking-wider">SOUTHEAST</p>
                    <p className="text-[10px] text-white font-medium">Cooper</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Legend/Controls overlay */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-[#121212]/80 backdrop-blur border border-white/5 rounded-lg p-3 shadow-lg">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-semibold">Map Layers</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                  <span className="text-xs text-neutral-300">Active Zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border border-neutral-500"></div>
                  <span className="text-xs text-neutral-300">Unassigned</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: List & Management (45%) */}
        <section className="w-full md:w-[45%] h-full flex flex-col bg-[#050505] relative border-l border-transparent md:border-[#262626]">
          {/* Sticky Header */}
          <header className="shrink-0 px-8 pt-8 pb-4 bg-[#050505]/95 backdrop-blur z-10 border-b border-white/5">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Territory Assignments</h2>
              <p className="text-neutral-400 text-sm">Distribute recruitment zones for the 2024 season.</p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Assigned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#D4AF37]">2</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Open Zones</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">94%</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Coverage</p>
              </div>
            </div>
          </header>

          {/* Scrollable List Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 pb-32">
            {/* Active Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Assignments</h3>
                <button className="text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                {mockAssignments.map((assignment) => {
                  const colors = getZoneColors(assignment.color);
                  return (
                    <div key={assignment.id} className={`group bg-[#121212] rounded-xl border border-white/5 p-4 ${colors.border} transition-all duration-200`}>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div
                            className="h-12 w-12 rounded-full bg-neutral-800 bg-center bg-cover border border-white/10"
                            style={{ backgroundImage: `url('${assignment.imageUrl}')` }}
                          ></div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-semibold text-base">{assignment.recruiter}</h4>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors.badge}`}>{assignment.zone}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {assignment.states.map((state) => (
                                <span key={state} className={`text-[10px] font-medium border px-2 py-0.5 rounded ${colors.state}`}>{state}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3 text-xs font-medium">
                          <button className="text-neutral-400 hover:text-white">Edit</button>
                          <button className="text-red-500 hover:text-red-400">Remove</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unassigned Section */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pending / Unassigned</h3>
              <div className="flex flex-col gap-3">
                {unassignedZones.map((zone) => (
                  <div key={zone.id} className="relative bg-transparent rounded-xl border border-dashed border-neutral-700 p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-neutral-300 font-medium text-base">{zone.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-500 text-[10px] font-bold border border-neutral-700">OPEN</span>
                        </div>
                        <p className="text-neutral-500 text-xs">{zone.states}</p>
                      </div>
                      <button className="flex items-center gap-1 text-[#D4AF37] hover:text-white font-semibold text-sm transition-colors pr-2">
                        Assign
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fixed Action Footer */}
          <div className="absolute bottom-0 left-0 w-full bg-[#050505]/80 backdrop-blur-lg border-t border-white/10 p-6 flex justify-between items-center z-20">
            <p className="text-xs text-neutral-500 font-medium hidden sm:block">Last saved: 2 mins ago</p>
            <div className="flex gap-4 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-white font-medium hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#D4AF37] text-black font-bold hover:bg-[#d6aa1a] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check</span>
                Save Assignments
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMcpPrograms, useMcpCalendar, useMcpZones } from "@/lib/hooks";
import { ZONE_COLORS } from "@/lib/data/zone-data";
import type { Program, ZoneCode } from "@/lib/data/zone-data";

// State name mappings
const STATE_NAMES: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", de: "Delaware", fl: "Florida", ga: "Georgia",
  hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa",
  ks: "Kansas", ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
  ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri",
  mt: "Montana", ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey",
  nm: "New Mexico", ny: "New York", nc: "North Carolina", nd: "North Dakota", oh: "Ohio",
  ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina",
  sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont",
  va: "Virginia", wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
  dc: "Washington DC",
};

// State to zone mapping
const STATE_TO_ZONE: Record<string, ZoneCode> = {
  oh: "MIDWEST", mi: "MIDWEST", il: "MIDWEST", in: "MIDWEST", wi: "MIDWEST", mn: "MIDWEST", ia: "MIDWEST",
  pa: "NORTHEAST", md: "NORTHEAST", nj: "NORTHEAST", ny: "NORTHEAST", va: "NORTHEAST", ma: "NORTHEAST",
  ct: "NORTHEAST", de: "NORTHEAST", dc: "NORTHEAST", wv: "NORTHEAST", me: "NORTHEAST", nh: "NORTHEAST", vt: "NORTHEAST", ri: "NORTHEAST",
  ne: "PLAINS", ks: "PLAINS", mo: "PLAINS", ar: "PLAINS",
  fl: "SOUTHEAST", ga: "SOUTHEAST", al: "SOUTHEAST", sc: "SOUTHEAST", nc: "SOUTHEAST", tn: "SOUTHEAST", ms: "SOUTHEAST",
  tx: "SOUTHWEST", ok: "SOUTHWEST", az: "SOUTHWEST", nm: "SOUTHWEST", la: "SOUTHWEST",
  ca: "WEST", nv: "WEST", or: "WEST", wa: "WEST", ut: "WEST", co: "WEST",
};

function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      href={`/programs/${program.id}`}
      className="group flex flex-col gap-4 rounded-2xl bg-[#121212] p-6 border border-white/5 hover:border-[#d4af35]/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="size-16 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-[#d4af35] text-3xl">sports_football</span>
        </div>
        {program.state_rank === 1 && (
          <div className="bg-[#d4af35]/20 text-[#d4af35] text-xs font-bold px-3 py-1 rounded-full uppercase">#1 Ranked</div>
        )}
        {program.state_rank && program.state_rank > 1 && program.state_rank <= 5 && (
          <div className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Top 5</div>
        )}
      </div>
      <div>
        <h3 className="text-white text-lg font-bold leading-tight group-hover:text-[#d4af35] transition-colors">{program.team_name}</h3>
        <p className="text-gray-500 text-sm">{program.city ? `${program.city}, ` : ""}{program.state}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-sm">
        <span className="text-gray-400">Record</span>
        <span className="text-white font-bold">{program.current_record}</span>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-800 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}

export default function StateLandingPage() {
  const params = useParams();
  const stateSlug = (params.state as string)?.toLowerCase();

  const stateName = STATE_NAMES[stateSlug] || stateSlug?.charAt(0).toUpperCase() + stateSlug?.slice(1) || "Unknown";
  const stateCode = stateSlug?.toUpperCase() || "";
  const zoneCode = STATE_TO_ZONE[stateSlug] || "SOUTHWEST";
  const colors = ZONE_COLORS[zoneCode];

  const { programs, isLoading: programsLoading, error: programsError } = useMcpPrograms(stateCode, 10);
  const { calendar } = useMcpCalendar();
  const { zones } = useMcpZones();

  const [search, setSearch] = useState("");

  // Find the zone info for this state
  const zoneInfo = zones.find(z => z.zone_code === zoneCode);

  // Get total recruits from the zone (as a rough estimate for the state)
  const totalRecruits = zoneInfo?.total_recruits || 0;
  const estimatedStateRecruits = Math.floor(totalRecruits / (zoneInfo?.states?.length || 1));

  const filteredPrograms = programs.filter((p) =>
    p.team_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#050505] text-white font-[family-name:var(--font-inter)] relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-[#050505]/90 backdrop-blur-md px-4 py-3 lg:px-10">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-4 text-white">
            <div className="size-8 flex items-center justify-center text-[#d4af35]">
              <span className="material-symbols-outlined text-3xl">sports_football</span>
            </div>
            <h2 className="text-white text-xl font-black leading-tight tracking-tight uppercase">RepMax</h2>
          </Link>
          <div className="hidden lg:flex items-center gap-9">
            <Link href="/programs" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Programs</Link>
            <Link href="/athletes" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Athletes</Link>
            <Link href="/calendar" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Events</Link>
            <Link href="/rankings" className="text-gray-300 hover:text-[#d4af35] transition-colors text-sm font-medium leading-normal">Rankings</Link>
          </div>
        </div>
        <div className="flex flex-1 justify-end gap-4 lg:gap-8">
          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-[#121212] border border-white/10 focus-within:border-[#d4af35]/50 transition-colors">
              <div className="text-[#c3b998] flex border-none items-center justify-center pl-4 rounded-l-full">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#666] px-4 pl-2 text-sm font-normal leading-normal" placeholder="Search athletes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </label>
          <div className="flex gap-2">
            <Link href="/signup" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-[#d4af35] hover:bg-yellow-500 transition-colors text-[#201d13] text-sm font-bold leading-normal tracking-wide">
              Sign Up
            </Link>
            <Link href="/login" className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-bold leading-normal tracking-wide">
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[500px] flex-col justify-center overflow-hidden">
          {/* Background with Overlay */}
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 ${colors.bg} opacity-20`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col justify-center px-4 py-20 lg:px-40">
            <div className="max-w-[800px] flex flex-col gap-6">
              {/* Badge */}
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-fit items-center justify-center gap-x-2 rounded-full ${colors.bg} backdrop-blur-sm pl-3 pr-4 shadow-lg ${colors.border} border`}>
                  <span className={`material-symbols-outlined ${colors.text} text-[18px]`}>location_on</span>
                  <p className={`${colors.text} text-xs font-bold uppercase tracking-wider`}>{zoneInfo?.zone_name || zoneCode} Zone</p>
                </div>
              </div>
              {/* Main Heading */}
              <div className="flex flex-col gap-2">
                <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                  {stateName}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Football</span><br />
                  Recruiting
                </h1>
                <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mt-4">
                  {zoneInfo?.description || `The premier hub for ${stateName} talent. Join the network powering the next generation of champions.`}
                </p>
              </div>
              {/* Stats Row */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className={`flex flex-col border-l-4 ${colors.border} pl-4`}>
                  <span className="text-3xl font-bold text-white tracking-tighter">{estimatedStateRecruits.toLocaleString()}</span>
                  <span className="text-sm text-gray-400 uppercase tracking-wide font-medium">Active Athletes</span>
                </div>
                <div className="flex flex-col border-l-4 border-gray-700 pl-4">
                  <span className="text-3xl font-bold text-white tracking-tighter">{programs.length}</span>
                  <span className="text-sm text-gray-400 uppercase tracking-wide font-medium">Top Programs</span>
                </div>
              </div>
              {/* CTA */}
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/signup" className="flex h-12 items-center justify-center rounded-full bg-[#d4af35] px-8 text-base font-bold text-[#201d13] shadow-lg shadow-yellow-500/20 hover:scale-105 transition-transform">
                  Get Scouted
                </Link>
                <Link href={`/athletes?state=${stateCode}`} className="flex h-12 items-center justify-center rounded-full bg-white/10 border border-white/10 px-8 text-base font-bold text-white hover:bg-white/20 transition-colors">
                  Browse Talent
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="px-4 py-16 lg:px-40 bg-[#050505]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">Top Rated Programs in {stateName}</h2>
            <Link href={`/programs?state=${stateCode}`} className="text-[#d4af35] text-sm font-medium hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {programsLoading ? (
            <LoadingSkeleton />
          ) : programsError ? (
            <div className="text-center py-12 text-red-400">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p>Error loading programs</p>
            </div>
          ) : filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPrograms.slice(0, 4).map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-2">school</span>
              <p>No programs data available for {stateName}</p>
            </div>
          )}
        </section>

        {/* Events Module */}
        {calendar && (
          <section className="px-4 py-16 lg:px-40 bg-[#050505]">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Text Content */}
              <div className="md:w-1/3 flex flex-col gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                  <span className="material-symbols-outlined">event</span>
                </div>
                <h2 className="text-white text-3xl font-bold tracking-tight">{stateName} Combines & Camps</h2>
                <p className="text-gray-400">Register for upcoming events to get verified data, updated measurements, and exposure to top recruiters in the {zoneInfo?.zone_name || zoneCode} zone.</p>
                <Link href="/calendar" className="mt-2 w-fit px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
                  View Full Calendar
                </Link>
              </div>
              {/* Events List */}
              <div className="md:w-2/3 flex flex-col">
                <div className="flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
                  {/* Current Period Banner */}
                  <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-4`}>
                    <p className={`text-xs font-mono ${colors.text} uppercase`}>Current Period</p>
                    <p className="text-lg font-bold text-white mt-1">{calendar.currentPeriod}</p>
                    {calendar.daysUntilSigning > 0 && (
                      <p className="text-sm text-gray-400 mt-1">{calendar.daysUntilSigning} days until signing day</p>
                    )}
                  </div>

                  {calendar.keyDates.slice(0, 3).map((event) => (
                    <div key={event.date} className="group flex items-center justify-between py-6 hover:bg-white/5 px-4 transition-colors rounded-lg">
                      <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-center justify-center bg-[#121212] border border-white/10 rounded-lg h-16 w-16 min-w-16">
                          <span className={`text-xs ${colors.text} font-bold uppercase`}>
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-xl text-white font-bold">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">{event.event}</h4>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-[#0a0a0a] border-t border-white/10">
        <div className="px-4 py-20 lg:px-40 flex flex-col items-center text-center gap-8">
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tight max-w-3xl">
            Don&apos;t get left on the sidelines.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl">
            Join {stateName} athletes taking control of their recruiting journey on RepMax.
          </p>
          <Link href="/signup" className="flex h-14 min-w-[200px] items-center justify-center rounded-full bg-[#d4af35] px-8 text-lg font-bold text-[#201d13] shadow-xl hover:scale-105 transition-transform">
            Join {stateName} Athletes on RepMax
          </Link>
          <div className="mt-12 flex flex-col md:flex-row justify-between w-full pt-8 border-t border-white/5 text-gray-500 text-sm">
            <p>© 2026 RepMax. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

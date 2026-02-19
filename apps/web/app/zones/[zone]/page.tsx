"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMcpZone, useMcpCalendar } from "@/lib/hooks";
import { ZONE_SLUG_MAP, ZONE_DISPLAY_NAMES, ZONE_COLORS, getPlaceholderImage } from "@/lib/data/zone-data";
import type { ZoneCode, Prospect, Program } from "@/lib/data/zone-data";

function AthleteCard({ athlete }: { athlete: Prospect }) {
  const imageUrl = athlete.image_url || getPlaceholderImage(athlete.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-[#121212] border border-[#2a2a2a] transition-all hover:-translate-y-1 hover:border-orange-500/50">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800 relative">
        <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-white border border-white/10">
          CLASS &apos;{String(athlete.class_year).slice(-2)}
        </div>
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-80"></div>
      </div>
      <div className="relative -mt-12 p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white">{athlete.full_name}</h3>
        <p className="text-sm text-orange-500 font-bold mb-3">
          {athlete.position} • {athlete.high_school}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#333] pt-3">
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Stars</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined text-[14px] ${i < athlete.star_rating ? "text-orange-500" : "text-gray-700"}`}
                  style={{ fontVariationSettings: i < athlete.star_rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">Status</p>
            <p className={`font-mono text-sm ${athlete.commitment_status === "committed" ? "text-green-500" : "text-gray-300"}`}>
              {athlete.commitment_status === "committed" ? athlete.committed_team : "Open"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgramCard({ program, rank }: { program: Program; rank: number }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-[#121212] p-4 border border-[#2a2a2a]">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-lg font-bold text-white">
        {rank}
      </div>
      <div className="flex-grow">
        <h3 className="text-base font-bold text-white">{program.team_name}</h3>
        <p className="text-sm text-gray-400">
          {program.city ? `${program.city}, ` : ""}{program.state} • {program.current_record}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-xl font-bold text-orange-500">{program.current_rating.toFixed(1)}</p>
        <p className="text-[10px] text-gray-500 uppercase">Score</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}

export default function ZoneLandingPage() {
  const params = useParams();
  const zoneSlug = (params.zone as string)?.toLowerCase();
  const zoneCode = ZONE_SLUG_MAP[zoneSlug] as ZoneCode | undefined;

  const { zone, prospects, programs, isLoading, error } = useMcpZone(zoneCode || null);
  const { calendar } = useMcpCalendar();

  const zoneName = zoneCode ? ZONE_DISPLAY_NAMES[zoneCode] : "Unknown";
  const colors = zoneCode ? ZONE_COLORS[zoneCode] : ZONE_COLORS.SOUTHWEST;

  if (error) {
    return (
      <div className="bg-[#050505] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Zone</h1>
          <p className="text-gray-400">{error.message}</p>
          <Link href="/zones" className="mt-4 inline-block text-orange-500 hover:text-orange-400">
            ← Back to Zones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white overflow-x-hidden min-h-screen">
      <div className="relative flex flex-col w-full">
        {/* Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-[#2a2a2a] bg-[#050505]/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 text-white">
                <div className="size-6 text-orange-500">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold tracking-tight">RepMax</h2>
              </Link>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="/zones" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">All Zones</Link>
                <Link href="/athletes" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Athletes</Link>
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
                <div className="h-8 w-px bg-[#2a2a2a]"></div>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">search</span>
                    <input
                      className="h-9 w-40 rounded-lg bg-[#1a1a1a] border-none py-1 pl-9 pr-2 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500 transition-all"
                      placeholder="Search"
                      type="text"
                    />
                  </div>
                  <Link href="/signup" className="h-9 rounded-lg bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 flex items-center">
                    Join
                  </Link>
                </div>
              </div>
              {/* Mobile Menu Button */}
              <button disabled title="Mobile menu coming soon" className="md:hidden text-white opacity-50">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-20 pb-12 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40">
              <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${colors.bg.replace("bg-", "from-")}/20 via-[#050505]/50 to-[#050505]`}></div>
            </div>
            <div className="layout-container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
              <span className={`mb-4 inline-flex items-center gap-1 rounded-full border ${colors.border} ${colors.bg} px-3 py-1 text-xs font-medium ${colors.text}`}>
                <span className="material-symbols-outlined text-[14px]">public</span> Recruiting Zone
              </span>
              <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.9]">
                {zoneName} <br className="hidden sm:block" /> <span className={colors.text}>Zone</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-gray-400 font-light">
                {zone?.description || "Track performance, analyze regional rankings, and get discovered by top collegiate programs."}
              </p>

              {/* Stats Row */}
              {isLoading ? (
                <div className="mt-12 w-full max-w-4xl animate-pulse">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-12 w-full max-w-4xl">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-[#121212] border border-[#2a2a2a] p-6 hover:border-orange-500/50 transition-colors">
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Athletes</p>
                      <p className="font-mono text-4xl font-bold text-white mt-2">{zone?.total_recruits || 0}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl bg-[#121212] border border-[#2a2a2a] p-6 hover:border-orange-500/50 transition-colors">
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Blue Chips</p>
                      <p className={`font-mono text-4xl font-bold ${colors.text} mt-2`}>{zone?.blue_chip_count || 0}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl bg-[#121212] border border-[#2a2a2a] p-6 hover:border-orange-500/50 transition-colors">
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Upcoming Events</p>
                      <p className="font-mono text-4xl font-bold text-white mt-2">{String(zone?.upcoming_events_30d || 0).padStart(2, "0")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Featured Athletes */}
          <section className="py-12 bg-[#050505]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">Featured Athletes</h2>
                  <p className="text-sm text-gray-400 mt-1">Top performers in the {zoneName} Zone</p>
                </div>
                <Link href={`/athletes?zone=${zoneCode}`} className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400">
                  View All Rankings <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : prospects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {prospects.slice(0, 4).map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                  <p>No athletes found in this zone</p>
                </div>
              )}

              <div className="mt-6 flex sm:hidden justify-center">
                <Link href={`/athletes?zone=${zoneCode}`} className="w-full rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-white text-center">
                  View All Athletes
                </Link>
              </div>
            </div>
          </section>

          {/* Two Column Section: Top Programs & Calendar */}
          <section className="py-12 bg-[#050505]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Top Programs */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Programs</h2>
                    <span className={`text-xs font-mono ${colors.text} ${colors.bg} px-2 py-1 rounded`}>BY REPMAX SCORE</span>
                  </div>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
                      ))}
                    </div>
                  ) : programs.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {programs.slice(0, 5).map((program, idx) => (
                        <ProgramCard key={program.id} program={program} rank={idx + 1} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-2">school</span>
                      <p>No programs data available</p>
                    </div>
                  )}
                </div>

                {/* Recruiting Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Key Dates</h2>
                    <Link href="/calendar" className="text-xs font-bold text-orange-500 hover:text-orange-400">View Calendar</Link>
                  </div>
                  {calendar ? (
                    <div className="relative border-l border-[#2a2a2a] pl-6 space-y-8 ml-3">
                      {/* Current Period Banner */}
                      <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 -ml-6`}>
                        <p className={`text-xs font-mono ${colors.text} uppercase`}>Current Period</p>
                        <p className="text-lg font-bold text-white mt-1">{calendar.currentPeriod}</p>
                        {calendar.daysUntilSigning > 0 && (
                          <p className="text-sm text-gray-400 mt-1">{calendar.daysUntilSigning} days until signing day</p>
                        )}
                      </div>

                      {calendar.keyDates.slice(0, 4).map((event, idx) => (
                        <div key={event.date} className="relative">
                          <span className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ${idx === 0 ? "bg-orange-500" : "bg-[#333]"} ring-4 ring-[#050505]`}></span>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <span className={`text-xs font-mono ${idx === 0 ? "text-orange-500" : "text-gray-500"}`}>
                                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                              </span>
                              <h3 className="text-lg font-bold text-white mt-1">{event.event}</h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="animate-pulse space-y-4">
                      <div className="h-20 bg-gray-800 rounded-lg"></div>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* States in Zone */}
          {zone?.states && zone.states.length > 0 && (
            <section className="py-12 bg-[#0a0a0a]">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-white mb-6">States in {zoneName} Zone</h2>
                <div className="flex flex-wrap gap-3">
                  {zone.states.map((state) => (
                    <Link
                      key={state}
                      href={`/states/${state.toLowerCase()}`}
                      className={`px-4 py-2 rounded-lg ${colors.bg} ${colors.border} border ${colors.text} text-sm font-medium hover:bg-opacity-20 transition-colors`}
                    >
                      {state}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Banner */}
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-2xl bg-[#121212] px-6 py-12 sm:px-12 lg:px-16 border border-[#2a2a2a] flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(249,116,21,0.05)_50%,transparent_75%,transparent_100%)]"></div>
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/20 blur-[100px]"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[100px]"></div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to get noticed?</h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
                    Join <span className="text-orange-500 font-bold">{zone?.total_recruits || 0}</span> athletes in the {zoneName} Zone already building their recruitment profile on RepMax.
                  </p>
                  <div className="mt-8 flex justify-center gap-4">
                    <Link href="/signup" className="rounded-lg bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-[0_0_20px_rgba(249,116,21,0.3)] transition hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,116,21,0.5)]">
                      Create Free RepMax ID
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-gray-500">No credit card required. Free for athletes.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#2a2a2a] bg-[#050505] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <div className="size-5 text-gray-500">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-400">RepMax Inc. © 2026</span>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-white">Privacy</Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-white">Terms</Link>
                <Link href="/support" className="text-sm text-gray-500 hover:text-white">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

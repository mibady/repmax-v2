"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAthlete, useHighlights } from "@/lib/hooks";
import { ZONE_COLORS, getPlaceholderImage } from "@/lib/data/zone-data";
import type { ZoneCode } from "@/lib/data/zone-data";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="h-32 w-full bg-gradient-to-b from-[#1a1a1a] to-[#121212]"></div>
      {/* Avatar */}
      <div className="px-6 relative -mt-16 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-700"></div>
        <div className="mt-4 h-8 w-48 bg-gray-700 rounded"></div>
        <div className="mt-2 h-4 w-64 bg-gray-700 rounded"></div>
      </div>
      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="h-24 bg-gray-700 rounded-2xl"></div>
        <div className="h-24 bg-gray-700 rounded-2xl"></div>
        <div className="h-48 bg-gray-700 rounded-2xl"></div>
      </div>
    </div>
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AthletePage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  // Guard: only fetch when id is a valid UUID to avoid collisions with
  // sibling named routes like (dashboard)/athlete/offers that share the
  // /athlete/* URL space via route groups.
  const isValidId = UUID_RE.test(athleteId);

  const { athlete, isLoading, error } = useAthlete(isValidId ? athleteId : "");
  const { highlights } = useHighlights(isValidId ? athleteId : "");
  const firstHighlight = highlights?.[0];

  if (!isValidId || error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            {!isValidId ? "Athlete Not Found" : "Error Loading Athlete"}
          </h1>
          <p className="text-gray-400 mb-4">
            {!isValidId ? "The requested athlete profile does not exist." : error?.message}
          </p>
          <Link href="/athletes" className="text-orange-500 hover:text-orange-400">
            ← Back to Athletes
          </Link>
        </div>
      </div>
    );
  }

  // Get zone colors based on athlete zone
  const zoneCode = (athlete?.zone?.toUpperCase() || "SOUTHWEST") as ZoneCode;
  const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;

  // Profile data
  const profile = athlete?.profile;
  const fullName = profile?.full_name || "Unknown Athlete";
  const avatarUrl = profile?.avatar_url || getPlaceholderImage(athleteId);

  // Format height
  const formatHeight = (inches?: number | null) => {
    if (!inches) return "N/A";
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] ${colors.bg} rounded-full blur-[120px]`}></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Card Container */}
      <main className="relative z-10 w-full max-w-[480px] bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Header Background */}
            <div className="h-32 w-full bg-gradient-to-b from-[#1a1a1a] to-[#121212] relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

              {/* Zone Badge */}
              {athlete?.zone && (
                <div className={`absolute top-4 right-4 ${colors.bg} ${colors.border} border backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1`}>
                  <span className={`material-symbols-outlined ${colors.text} text-[14px]`}>location_on</span>
                  <span className={`text-[10px] font-bold tracking-wider ${colors.text} uppercase`}>{athlete.zone} Zone</span>
                </div>
              )}

              {/* Back Button */}
              <Link href="/athletes" className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 text-white hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span className="text-xs font-medium">Back</span>
              </Link>
            </div>

            {/* Avatar & Identity Section */}
            <div className="px-6 relative -mt-16 flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full border-4 ${colors.border} shadow-lg p-0.5 bg-[#121212] overflow-hidden relative z-10 transition-transform duration-300 group-hover:scale-105`}>
                  <Image
                    alt={`Portrait of ${fullName}`}
                    className="w-full h-full object-cover rounded-full"
                    src={avatarUrl}
                    width={96}
                    height={96}
                  />
                </div>
                {/* Verified Badge */}
                {athlete?.verified && (
                  <div className="absolute bottom-0 right-0 z-20 bg-green-900 border-2 border-[#121212] rounded-full p-1.5 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-green-400 text-[16px] leading-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>verified</span>
                  </div>
                )}
              </div>

              {/* Name & School */}
              <div className="mt-4 flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">{fullName}</h1>
                <p className="text-gray-400 text-sm font-medium">
                  {athlete?.high_school || "Unknown School"}{athlete?.state ? `, ${athlete.state}` : ""}
                </p>
              </div>

              {/* Position Pills */}
              <div className="mt-4 flex gap-3">
                {athlete?.primary_position && (
                  <div className={`flex h-7 items-center justify-center px-4 rounded-full ${colors.bg} ${colors.border} border`}>
                    <span className={`${colors.text} text-xs font-bold tracking-wider`}>{athlete.primary_position}</span>
                  </div>
                )}
                {athlete?.secondary_position && (
                  <div className="flex h-7 items-center justify-center px-4 rounded-full bg-neutral-800 border border-white/10">
                    <span className="text-gray-300 text-xs font-bold tracking-wider">{athlete.secondary_position}</span>
                  </div>
                )}
              </div>

              {/* Ratings & Class */}
              <div className="mt-5 w-full flex items-center justify-between border-y border-white/5 py-3 px-2">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Class Of</span>
                  <span className="text-sm font-bold text-white">{athlete?.class_year || "N/A"}</span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rating</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined text-[16px] ${i < (athlete?.star_rating || 0) ? colors.text : "text-gray-700"}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Status</span>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${athlete?.verified ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></span>
                    <span className={`text-sm font-bold ${athlete?.verified ? "text-green-400" : "text-gray-400"}`}>
                      {athlete?.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Section: Measurables */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`material-symbols-outlined ${colors.text} text-[20px]`}>straighten</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Measurables</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-gray-500 font-medium">Height</span>
                    <span className="text-2xl text-white font-bold font-mono">{formatHeight(athlete?.height_inches)}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-gray-500 font-medium">Weight</span>
                    <span className="text-2xl text-white font-bold font-mono">{athlete?.weight_lbs || "N/A"}</span>
                    {athlete?.weight_lbs && <span className="text-[10px] text-gray-500 -mt-1">lbs</span>}
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-gray-500 font-medium">40-Yard</span>
                    <span className={`text-2xl font-bold font-mono ${athlete?.forty_yard_time ? colors.text : "text-gray-500"}`}>
                      {athlete?.forty_yard_time ? `${athlete.forty_yard_time}s` : "N/A"}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-xs text-gray-500 font-medium">Vertical</span>
                    <span className="text-2xl text-white font-bold font-mono">
                      {athlete?.vertical_inches ? `${athlete.vertical_inches}"` : "N/A"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Section: Academics */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`material-symbols-outlined ${colors.text} text-[20px]`}>school</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Academics</h2>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">GPA</span>
                    <span className="text-xl text-white font-bold font-mono">{athlete?.gpa?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">SAT</span>
                    <span className="text-xl text-white font-bold font-mono">{athlete?.sat_score || "N/A"}</span>
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">NCAA ID</span>
                    {athlete?.ncaa_id ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span className="text-xs font-bold">Cleared</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Section: Film */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${colors.text} text-[20px]`}>smart_display</span>
                    <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Highlights</h2>
                  </div>
                  <Link href={`/athlete/${athleteId}#highlights`} className={`text-xs ${colors.text} font-medium cursor-pointer hover:underline`}>View All</Link>
                </div>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10" onClick={() => firstHighlight?.video_url && window.open(firstHighlight.video_url, '_blank')}>
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 bg-gradient-to-br from-gray-800 to-gray-900"
                    style={{ backgroundImage: undefined }}
                  ></div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform`}>
                      <span className={`material-symbols-outlined ${colors.text} text-[32px] font-bold`}>play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                    <p className="text-[10px] text-white font-medium">
                      {athlete?.class_year ? `${athlete.class_year} Season Highlights` : "Highlight Reel"}
                    </p>
                  </div>
                </div>
              </section>

              {/* RepMax Score */}
              {athlete?.repmax_score && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`material-symbols-outlined ${colors.text} text-[20px]`}>trending_up</span>
                    <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">RepMax Score</h2>
                  </div>
                  <div className={`${colors.bg} ${colors.border} border rounded-2xl p-5 flex items-center justify-between`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 font-medium">Overall Rating</span>
                      <span className={`text-4xl font-bold font-mono ${colors.text}`}>{athlete.repmax_score.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">Percentile</span>
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg.replace("/10", "")} rounded-full`}
                          style={{ width: `${Math.min(athlete.repmax_score, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Sticky Footer Actions */}
            <div className="p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex flex-col gap-4">
              <button onClick={() => router.push('/login?returnTo=/athlete/' + athleteId)} className={`w-full h-12 ${colors.bg.replace("/10", "")} hover:opacity-90 text-black font-bold rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg`}>
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add to Shortlist
              </button>
              <button onClick={() => router.push('/login?returnTo=/athlete/' + athleteId)} className={`w-full h-12 bg-transparent ${colors.border} border ${colors.text} hover:${colors.bg} font-bold rounded-full flex items-center justify-center gap-2 transition-all active:scale-95`}>
                <span className="material-symbols-outlined text-[20px]">mail</span>
                Contact Coach
              </button>
              <div className="w-full flex justify-center items-center gap-1.5 opacity-40 mt-2">
                <span className="material-symbols-outlined text-[12px]">bolt</span>
                <p className="text-[10px] font-medium tracking-widest uppercase">Powered by REPMAX</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

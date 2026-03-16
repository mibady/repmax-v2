import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import CardActions from "./CardActions";
import HighlightVideo from "./HighlightVideo";

type AthleteWithProfile = Tables<"athletes"> & {
  profile: Tables<"profiles"> | null;
  highlights: Tables<"highlights">[];
  repmax_id?: string | null;
};

function formatHeight(inches: number | null): string {
  if (!inches) return "--";
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function formatValue(val: number | null | undefined, suffix = ""): string {
  if (val === null || val === undefined || val === 0) return "--";
  return `${val}${suffix}`;
}

export default async function AthleteCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Support lookup by UUID or repmax_id (e.g. REP-JW-2026)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const column = isUuid ? "id" : "repmax_id";

  const { data: athleteData } = await supabase
    .from("athletes")
    .select(`
      *,
      profile:profiles(*),
      highlights(*)
    `)
    .eq(column, id)
    .single();

  if (!athleteData) {
    notFound();
  }

  const typedAthlete = athleteData as AthleteWithProfile;

  // Query documents by type
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, document_type, file_url")
    .eq("athlete_id", typedAthlete.id)
    .order("uploaded_at", { ascending: false });

  const transcripts = (documents ?? []).filter(d => d.document_type === "transcript");
  const recommendations = (documents ?? []).filter(d => d.document_type === "recommendation");


  // Record the view — do not await, do not block card render
  void Promise.resolve(
    supabase.from("profile_views").insert({
      athlete_id: typedAthlete.id,
      viewer_id: null,
    })
  ).catch(() => {});

  // Map to display format
  const athlete = {
    id: typedAthlete.id,
    name: typedAthlete.profile?.full_name || "Unknown Athlete",
    school: typedAthlete.high_school,
    city: typedAthlete.city,
    state: typedAthlete.state,
    zone: typedAthlete.zone ? `${typedAthlete.zone} Zone` : "Unknown Zone",
    classYear: typedAthlete.class_year,
    primaryPosition: typedAthlete.primary_position,
    secondaryPosition: typedAthlete.secondary_position,
    starRating: typedAthlete.star_rating || 0,
    verified: typedAthlete.verified,
    avatarUrl: typedAthlete.profile?.avatar_url ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCz5tdm2iqfJ4HWNltYdzZxqDD6zvFqQFxnt8XAnlYNU5PepMx3HTwvhTH-esYE5zA4sgEvuLBo7PxEdcvYiBbXA7_loyZ49uw3KPhiG5s0H5PLQFYekJM4E6nKivPokKcEDg4l0cDCyg2eEJgsZz5FpYskvM5EYz5PCbDeWUyiB3r5lrztrr53ZUGsJ_FoaDdS7b0wv4EQuoJAgbTNAo_2LBmejJ7qGoSIDGQnEPDBLujfO4I48IZ12Yfa4lE-S6jUgG40lXh2rnQ",
    metrics: {
      height: formatHeight(typedAthlete.height_inches),
      weight: typedAthlete.weight_lbs,
      fortyYard: typedAthlete.forty_yard_time,
      tenYardSplit: typedAthlete.ten_yard_split,
      fiveTenFive: typedAthlete.five_ten_five,
      broadJump: typedAthlete.broad_jump_inches,
      vertical: typedAthlete.vertical_inches,
      wingspan: typedAthlete.wingspan_inches,
      bench: typedAthlete.bench_press_lbs,
      squat: typedAthlete.squat_lbs,
    },
    academics: {
      gpa: typedAthlete.gpa,
      weightedGpa: typedAthlete.weighted_gpa,
      sat: typedAthlete.sat_score,
      act: typedAthlete.act_score,
      ncaaCleared: typedAthlete.ncaa_cleared || false,
      ncaaId: typedAthlete.ncaa_id,
    },
    offersCount: 0, // Will be replaced with live count below
    bio: typedAthlete.bio,
    ncaaEcId: typedAthlete.ncaa_id,
    coachNotes: typedAthlete.coach_notes,
    playerSummary: typedAthlete.player_summary,
    coachPhone: typedAthlete.coach_phone,
    coachEmail: typedAthlete.coach_email,
    highlightVideo: typedAthlete.highlights?.[0] ? {
      thumbnail: typedAthlete.highlights[0].thumbnail_url ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD0kL36A2BWxzFzDUEhlWJflUxzoToTl3AVBx8LzI8iXl6P_Z2w19x4UrmKu2VUVyUBN16sRxKirK-0xo1Q3OEi-cm8wO11Ss4uNOiRuWCTvioea_8BO16HCcKknhuyrRjhmh0AB2SG28LVgZu0kgYmiqig0zn4MTbOoRAf5NbTSu-kU5DvK6uoxxTYuIRZU9QWNLIHWpwN_G6Pd7A38-TGI-yTko6oAGBpneHDt5iI0UzinakkTymm-Gr4TeQk9oco8CsaakatJMs",
      title: typedAthlete.highlights[0].title,
      videoUrl: typedAthlete.highlights[0].video_url || null,
    } : {
      thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0kL36A2BWxzFzDUEhlWJflUxzoToTl3AVBx8LzI8iXl6P_Z2w19x4UrmKu2VUVyUBN16sRxKirK-0xo1Q3OEi-cm8wO11Ss4uNOiRuWCTvioea_8BO16HCcKknhuyrRjhmh0AB2SG28LVgZu0kgYmiqig0zn4MTbOoRAf5NbTSu-kU5DvK6uoxxTYuIRZU9QWNLIHWpwN_G6Pd7A38-TGI-yTko6oAGBpneHDt5iI0UzinakkTymm-Gr4TeQk9oco8CsaakatJMs",
      title: "No highlights uploaded yet",
      videoUrl: null,
    },
  };

  // Query live offers count
  const { count: liveOffersCount } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('athlete_id', typedAthlete.id);

  athlete.offersCount = liveOffersCount || 0;


  return (
    <div className="bg-background-dark text-white min-h-screen flex justify-center py-8 px-4 relative overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Main Card Container */}
      <main className="relative z-10 w-full max-w-[480px] bg-card-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#1a1a1a] to-card-dark overflow-hidden">
          <Image
            src={athlete.avatarUrl}
            alt={`Portrait of athlete ${athlete.name}`}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-card-dark/40 to-transparent" />
          {/* Zone Badge */}
          <div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <span className="material-symbols-outlined text-purple-200 text-[14px]">
              location_on
            </span>
            <span className="text-[10px] font-bold tracking-wider text-purple-100 uppercase">
              {athlete.zone}
            </span>
          </div>
          {/* Verified Badge */}
          {athlete.verified && (
            <div className="absolute bottom-4 right-4 z-10 bg-green-900/80 border border-green-500/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-green-400 text-[16px] leading-none"
                style={{
                  fontVariationSettings: "'FILL' 1, 'wght' 700",
                }}
              >
                verified
              </span>
              <span className="text-[10px] font-bold tracking-wider text-green-300 uppercase">Verified</span>
            </div>
          )}
        </div>

        {/* Identity Section */}
        <div className="px-6 pt-5 flex flex-col items-center text-center">
          {/* Name & School */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {athlete.name}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {athlete.school}, {athlete.city}, {athlete.state}
            </p>
          </div>

          {/* Position Pills */}
          <div className="mt-4 flex gap-3">
            <div className="flex h-7 items-center justify-center px-4 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-primary text-xs font-bold tracking-wider">
                {athlete.primaryPosition}
              </span>
            </div>
            {athlete.secondaryPosition && (
              <div className="flex h-7 items-center justify-center px-4 rounded-full bg-neutral-800 border border-white/10">
                <span className="text-gray-300 text-xs font-bold tracking-wider">
                  {athlete.secondaryPosition}
                </span>
              </div>
            )}
          </div>

          {/* Ratings & Class */}
          <div className="mt-5 w-full flex items-center justify-between border-y border-white/5 py-3 px-2">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Class Of
              </span>
              <span className="text-sm font-bold text-white">
                {athlete.classYear}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Rating
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`material-symbols-outlined text-[16px] ${
                      star <= athlete.starRating
                        ? "text-primary"
                        : "text-gray-700"
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Offers
              </span>
              <span className="text-sm font-bold text-primary">
                {athlete.offersCount}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 flex flex-col gap-6">
          {/* Section: Bio */}
          {athlete.bio && (
            <section>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                <p className="text-sm text-gray-300 leading-relaxed">{athlete.bio}</p>
              </div>
            </section>
          )}

          {/* Section: Quick Metrics (3-col grid) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                straighten
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Athletic Metrics
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Height</span>
                <span className="text-xl text-white font-bold font-mono">
                  {athlete.metrics.height}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Weight</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.metrics.weight)}
                </span>
                {athlete.metrics.weight ? <span className="text-[10px] text-gray-500 -mt-1">lbs</span> : null}
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">40-Yard</span>
                <span className="text-xl text-primary font-bold font-mono">
                  {athlete.metrics.fortyYard ? `${athlete.metrics.fortyYard}s` : "--"}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">10Y Split</span>
                <span className="text-xl text-white font-bold font-mono">
                  {athlete.metrics.tenYardSplit ? `${athlete.metrics.tenYardSplit}s` : "--"}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">5-10-5</span>
                <span className="text-xl text-white font-bold font-mono">
                  {athlete.metrics.fiveTenFive ? `${athlete.metrics.fiveTenFive}s` : "--"}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Broad Jump</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.metrics.broadJump, '"')}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Vertical</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.metrics.vertical, '"')}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Wingspan</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.metrics.wingspan, '"')}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Bench</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.metrics.bench)}
                </span>
                {athlete.metrics.bench ? <span className="text-[10px] text-gray-500 -mt-1">lbs</span> : null}
              </div>
              <div />
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-[10px] text-gray-500 font-medium">Squat</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.metrics.squat)}
                </span>
                {athlete.metrics.squat ? <span className="text-[10px] text-gray-500 -mt-1">lbs</span> : null}
              </div>
            </div>
          </section>

          {/* Section: Profile Snapshot */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                school
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Profile Snapshot
              </h2>
            </div>
            {/* Top row: GPA tiles + Offers */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">GPA</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.academics.gpa)}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">W. GPA</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.academics.weightedGpa)}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">Offers</span>
                <span className="text-xl text-primary font-bold font-mono">
                  {athlete.offersCount}
                </span>
              </div>
            </div>
            {/* Bottom row: SAT, ACT, NCAA */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">SAT</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.academics.sat)}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">ACT</span>
                <span className="text-xl text-white font-bold font-mono">
                  {formatValue(athlete.academics.act)}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  NCAA ID
                </span>
                <span className="text-xl text-white font-bold font-mono">
                  {athlete.academics.ncaaId || "--"}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Documents */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                description
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Documents
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Transcript box */}
              {transcripts.length > 0 ? (
                <a href={transcripts[0].file_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center">
                  <span className="material-symbols-outlined text-primary text-[28px]">description</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transcript</span>
                </a>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                  <span className="material-symbols-outlined text-gray-500 text-[28px]">description</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transcript</span>
                </div>
              )}
              {/* Recommendation box */}
              {recommendations.length > 0 ? (
                <a href={recommendations[0].file_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center">
                  <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Letter</span>
                </a>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                  <span className="material-symbols-outlined text-gray-500 text-[28px]">mail</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Letter</span>
                </div>
              )}
              {/* Scouting Report box */}
              <a href="#" className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center">
                <span className="material-symbols-outlined text-primary text-[28px]">query_stats</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Scouting Report</span>
              </a>
            </div>
          </section>

          {/* Section: Film */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  smart_display
                </span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                  Highlights
                </h2>
              </div>
              <Link href={`/athlete/${athlete.id}#highlights`} className="text-xs text-primary font-medium hover:underline">
                View All
              </Link>
            </div>
            <HighlightVideo
              thumbnail={athlete.highlightVideo.thumbnail}
              title={athlete.highlightVideo.title}
              videoUrl={athlete.highlightVideo.videoUrl}
            />
          </section>

          {/* Section: Coach Notes */}
          {athlete.coachNotes && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  sports
                </span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                  Coach Notes
                </h2>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {athlete.coachNotes}
                </p>
              </div>
            </section>
          )}

          {/* Section: Player Summary */}
          {athlete.playerSummary && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  person_search
                </span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                  Player Summary
                </h2>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {athlete.playerSummary}
                </p>
              </div>
            </section>
          )}

          {/* Section: NCAA ID / Recruiting # */}
          {athlete.ncaaEcId && (
            <section>
              <div className="bg-primary/15 border border-primary/40 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  NCAA ID
                </span>
                <span className="text-2xl font-bold text-white font-mono tracking-wide">
                  {athlete.ncaaEcId}
                </span>
              </div>
            </section>
          )}
        </div>

        {/* Sticky Footer Actions */}
        <CardActions
          athleteId={athlete.id}
          repMaxId={typedAthlete.repmax_id ?? null}
          athleteName={athlete.name}
          coachPhone={athlete.coachPhone ?? null}
          coachEmail={athlete.coachEmail ?? null}
        />
      </main>
    </div>
  );
}

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
};

function formatHeight(inches: number | null): string {
  if (!inches) return "--";
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

export default async function AthleteCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch athlete data from Supabase
  const { data: athleteData } = await supabase
    .from("athletes")
    .select(`
      *,
      profile:profiles(*),
      highlights(*)
    `)
    .eq("id", id)
    .single();

  if (!athleteData) {
    notFound();
  }

  const typedAthlete = athleteData as AthleteWithProfile;

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
    measurables: {
      height: formatHeight(typedAthlete.height_inches),
      weight: typedAthlete.weight_lbs || 0,
      fortyYard: typedAthlete.forty_yard_time || 0,
      vertical: typedAthlete.vertical_inches || 0,
    },
    academics: {
      gpa: typedAthlete.gpa || 0,
      sat: typedAthlete.sat_score || 0,
      ncaaCleared: typedAthlete.ncaa_cleared || false,
    },
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

  return (
    <div className="bg-background-dark text-white min-h-screen flex justify-center py-8 px-4 relative overflow-x-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Main Card Container */}
      <main className="relative z-10 w-full max-w-[480px] bg-card-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Background */}
        <div className="h-32 w-full bg-gradient-to-b from-[#1a1a1a] to-card-dark relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
            }}
          />
          {/* Zone Badge */}
          <div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-purple-200 text-[14px]">
              location_on
            </span>
            <span className="text-[10px] font-bold tracking-wider text-purple-100 uppercase">
              {athlete.zone}
            </span>
          </div>
        </div>

        {/* Avatar & Identity Section */}
        <div className="px-6 relative -mt-16 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-primary shadow-glow p-0.5 bg-card-dark overflow-hidden relative z-10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={athlete.avatarUrl}
                alt={`Portrait of athlete ${athlete.name}`}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Verified Badge */}
            {athlete.verified && (
              <div className="absolute bottom-0 right-0 z-20 bg-green-900 border-2 border-card-dark rounded-full p-1.5 flex items-center justify-center shadow-md">
                <span
                  className="material-symbols-outlined text-green-400 text-[16px] leading-none"
                  style={{
                    fontVariationSettings: "'FILL' 1, 'wght' 700",
                  }}
                >
                  verified
                </span>
              </div>
            )}
          </div>

          {/* Name & School */}
          <div className="mt-4 flex flex-col gap-1">
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
                Status
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-green-400">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 flex flex-col gap-6">
          {/* Section: Measurables */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                straighten
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Measurables
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">
                  Height
                </span>
                <span className="text-2xl text-white font-bold font-mono">
                  {athlete.measurables.height}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">
                  Weight
                </span>
                <span className="text-2xl text-white font-bold font-mono">
                  {athlete.measurables.weight}
                </span>
                <span className="text-[10px] text-gray-500 -mt-1">lbs</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">
                  40-Yard
                </span>
                <span className="text-2xl text-primary font-bold font-mono">
                  {athlete.measurables.fortyYard}s
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-500 font-medium">
                  Vertical
                </span>
                <span className="text-2xl text-white font-bold font-mono">
                  {athlete.measurables.vertical}&quot;
                </span>
              </div>
            </div>
          </section>

          {/* Section: Academics */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                school
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Academics
              </h2>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">GPA</span>
                <span className="text-xl text-white font-bold font-mono">
                  {athlete.academics.gpa}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">SAT</span>
                <span className="text-xl text-white font-bold font-mono">
                  {athlete.academics.sat}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  NCAA ID
                </span>
                {athlete.academics.ncaaCleared ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <span className="material-symbols-outlined text-[16px]">
                      check_circle
                    </span>
                    <span className="text-xs font-bold">Cleared</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Pending</span>
                )}
              </div>
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
        </div>

        {/* Sticky Footer Actions */}
        <CardActions athleteId={athlete.id} />
      </main>
    </div>
  );
}

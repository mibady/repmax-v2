import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { PlayerCardData } from "@/components/player-card/types";
import { PlayerCardContent } from "@/components/player-card";
import CardActions from "./CardActions";
import PublicNav from "@/components/layout/public-nav";

type AthleteWithProfile = Tables<"athletes"> & {
  profile: Tables<"profiles"> | null;
  highlights: Tables<"highlights">[];
  repmax_id?: string | null;
};

function formatHeight(inches: number | null): string {
  if (!inches) return "N/A";
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

  // Query live offers count
  const { count: liveOffersCount } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true })
    .eq('athlete_id', typedAthlete.id);

  // Map to PlayerCardData
  const cardData: PlayerCardData = {
    id: typedAthlete.id,
    name: typedAthlete.profile?.full_name || "Unknown Athlete",
    school: typedAthlete.high_school,
    city: typedAthlete.city,
    state: typedAthlete.state,
    zone: typedAthlete.zone,
    classYear: typedAthlete.class_year,
    primaryPosition: typedAthlete.primary_position,
    secondaryPosition: typedAthlete.secondary_position,
    starRating: typedAthlete.star_rating || 0,
    verified: typedAthlete.verified ?? false,
    avatarUrl: typedAthlete.profile?.avatar_url || null,
    bio: typedAthlete.bio,
    coachNotes: typedAthlete.coach_notes,
    playerSummary: typedAthlete.player_summary,
    ncaaId: typedAthlete.ncaa_id,
    repmaxId: typedAthlete.repmax_id ?? null,
    offersCount: liveOffersCount || 0,
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
    },
    documents: {
      transcripts: transcripts.map(d => ({ id: d.id, fileUrl: d.file_url })),
      recommendations: recommendations.map(d => ({ id: d.id, fileUrl: d.file_url })),
    },
    highlight: typedAthlete.highlights?.[0] ? {
      thumbnail: typedAthlete.highlights[0].thumbnail_url ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD0kL36A2BWxzFzDUEhlWJflUxzoToTl3AVBx8LzI8iXl6P_Z2w19x4UrmKu2VUVyUBN16sRxKirK-0xo1Q3OEi-cm8wO11Ss4uNOiRuWCTvioea_8BO16HCcKknhuyrRjhmh0AB2SG28LVgZu0kgYmiqig0zn4MTbOoRAf5NbTSu-kU5DvK6uoxxTYuIRZU9QWNLIHWpwN_G6Pd7A38-TGI-yTko6oAGBpneHDt5iI0UzinakkTymm-Gr4TeQk9oco8CsaakatJMs",
      title: typedAthlete.highlights[0].title,
      videoUrl: typedAthlete.highlights[0].video_url || null,
    } : null,
  };

  return (
    <div className="bg-background-dark text-white min-h-screen flex justify-center py-8 pt-28 px-4 relative overflow-x-hidden">
      <PublicNav />
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-[480px]">
        <PlayerCardContent
          data={cardData}
          variant="standalone"
          actions={
            <CardActions
              athleteId={cardData.id}
              repMaxId={typedAthlete.repmax_id ?? null}
              athleteName={cardData.name}
              coachPhone={typedAthlete.coach_phone ?? null}
              coachEmail={typedAthlete.coach_email ?? null}
            />
          }
        />
      </main>
    </div>
  );
}

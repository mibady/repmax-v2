import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stateToZone } from "@/lib/utils/athlete-helpers";

function formatHeight(inches: number | null): string {
  if (!inches) return "";
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function parseHeight(heightStr: string): number | null {
  const match = heightStr.match(/(\d+)'(\d+)"/);
  if (match) return parseInt(match[1]) * 12 + parseInt(match[2]);
  return null;
}

async function verifyCoachOwnsAthlete(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, athleteId: string) {
  // Get coach's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", userId)
    .single();

  if (!profile || (profile.role !== "coach" && profile.role !== "admin")) {
    return { authorized: false, reason: "Not a coach or admin" };
  }

  // Check if athlete is on coach's roster via team_rosters
  const { data: coach } = await supabase
    .from("coaches")
    .select("team_id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach?.team_id) {
    return { authorized: false, reason: "No team found" };
  }

  const { data: rosterEntry } = await supabase
    .from("team_rosters")
    .select("id")
    .eq("team_id", coach.team_id)
    .eq("athlete_id", athleteId)
    .single();

  if (!rosterEntry) {
    return { authorized: false, reason: "Athlete not on your roster" };
  }

  return { authorized: true, profileId: profile.id };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyCoachOwnsAthlete(supabase, user.id, id);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 403 });
    }

    // Get athlete with profile
    const { data: athlete } = await supabase
      .from("athletes")
      .select(`
        *,
        profile:profiles(id, full_name, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    const profile = athlete.profile as { id: string; full_name: string | null; avatar_url: string | null } | null;

    const cardData = {
      athleteId: athlete.id,
      name: profile?.full_name || "",
      avatarUrl: profile?.avatar_url || "",
      position: athlete.primary_position || "",
      secondaryPosition: athlete.secondary_position || "",
      classYear: athlete.class_year || new Date().getFullYear() + 1,
      highSchool: athlete.high_school || "",
      city: athlete.city || "",
      state: athlete.state || "",
      bio: athlete.bio || "",
      zone: athlete.zone || "",
      height: formatHeight(athlete.height_inches),
      weight: athlete.weight_lbs?.toString() || "",
      fortyYard: athlete.forty_yard_time?.toFixed(2) || "",
      tenYardSplit: athlete.ten_yard_split?.toFixed(2) || "",
      fiveTenFive: athlete.five_ten_five?.toFixed(2) || "",
      broadJump: athlete.broad_jump_inches?.toString() || "",
      vertical: athlete.vertical_inches?.toString() || "",
      wingspan: athlete.wingspan_inches?.toString() || "",
      benchPress: athlete.bench_press_lbs?.toString() || "",
      squat: athlete.squat_lbs?.toString() || "",
      gpa: athlete.gpa?.toFixed(2) || "",
      weightedGpa: athlete.weighted_gpa?.toFixed(2) || "",
      sat: athlete.sat_score?.toString() || "",
      act: athlete.act_score?.toString() || "",
      hudlLink: athlete.hudl_link || "",
      youtubeLink: athlete.youtube_link || "",
      coachNotes: athlete.coach_notes || "",
      playerSummary: athlete.player_summary || "",
      ncaaEcId: athlete.ncaa_id || "",
      coachPhone: athlete.coach_phone || "",
      coachEmail: athlete.coach_email || "",
      jerseyNumber: athlete.jersey_number || "",
    };

    return NextResponse.json(cardData);
  } catch (error) {
    console.error("Error fetching athlete for coach:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifyCoachOwnsAthlete(supabase, user.id, id);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 403 });
    }

    const body = await request.json();

    // Get athlete's profile_id for name update
    const { data: athlete } = await supabase
      .from("athletes")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Update profile name if provided
    if (body.name && athlete.profile_id) {
      await supabase
        .from("profiles")
        .update({ full_name: body.name })
        .eq("id", athlete.profile_id);
    }

    // Build athlete update object
    const update: Record<string, unknown> = {};

    if (body.position !== undefined) update.primary_position = body.position || null;
    if (body.secondaryPosition !== undefined) update.secondary_position = body.secondaryPosition || null;
    if (body.classYear !== undefined) update.class_year = body.classYear;
    if (body.highSchool !== undefined) update.high_school = body.highSchool || null;
    if (body.city !== undefined) update.city = body.city || null;
    if (body.state !== undefined) update.state = body.state || null;
    if (body.bio !== undefined) update.bio = body.bio || null;
    if (body.zone !== undefined) update.zone = body.zone || null;
    if (body.height !== undefined) update.height_inches = parseHeight(body.height);
    if (body.weight !== undefined) update.weight_lbs = body.weight ? parseInt(body.weight) : null;
    if (body.fortyYard !== undefined) update.forty_yard_time = body.fortyYard ? parseFloat(body.fortyYard) : null;
    if (body.tenYardSplit !== undefined) update.ten_yard_split = body.tenYardSplit ? parseFloat(body.tenYardSplit) : null;
    if (body.fiveTenFive !== undefined) update.five_ten_five = body.fiveTenFive ? parseFloat(body.fiveTenFive) : null;
    if (body.broadJump !== undefined) update.broad_jump_inches = body.broadJump ? parseInt(body.broadJump) : null;
    if (body.vertical !== undefined) update.vertical_inches = body.vertical ? parseInt(body.vertical) : null;
    if (body.wingspan !== undefined) update.wingspan_inches = body.wingspan ? parseInt(body.wingspan) : null;
    if (body.benchPress !== undefined) update.bench_press_lbs = body.benchPress ? parseInt(body.benchPress) : null;
    if (body.squat !== undefined) update.squat_lbs = body.squat ? parseInt(body.squat) : null;
    if (body.gpa !== undefined) update.gpa = body.gpa ? parseFloat(body.gpa) : null;
    if (body.weightedGpa !== undefined) update.weighted_gpa = body.weightedGpa ? parseFloat(body.weightedGpa) : null;
    if (body.sat !== undefined) update.sat_score = body.sat ? parseInt(body.sat) : null;
    if (body.act !== undefined) update.act_score = body.act ? parseInt(body.act) : null;
    if (body.hudlLink !== undefined) update.hudl_link = body.hudlLink || null;
    if (body.youtubeLink !== undefined) update.youtube_link = body.youtubeLink || null;
    if (body.coachNotes !== undefined) update.coach_notes = body.coachNotes || null;
    if (body.playerSummary !== undefined) update.player_summary = body.playerSummary || null;
    if (body.ncaaEcId !== undefined) update.ncaa_id = body.ncaaEcId || null;
    if (body.coachPhone !== undefined) update.coach_phone = body.coachPhone || null;
    if (body.coachEmail !== undefined) update.coach_email = body.coachEmail || null;
    if (body.jerseyNumber !== undefined) update.jersey_number = body.jerseyNumber || null;

    // Auto-derive zone from state
    if (body.state && !body.zone) {
      const derivedZone = stateToZone(body.state);
      if (derivedZone) update.zone = derivedZone;
    }

    if (Object.keys(update).length > 0) {
      const { error } = await supabase
        .from("athletes")
        .update(update)
        .eq("id", id);

      if (error) {
        console.error("Error updating athlete:", error);
        return NextResponse.json({ error: "Failed to update athlete" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating athlete for coach:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

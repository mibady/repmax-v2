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

  // Find team via teams.coach_profile_id (matches existing roster routes)
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("coach_profile_id", profile.id)
    .single();

  if (!team) {
    return { authorized: false, reason: "No team found" };
  }

  // Check if athlete is on coach's roster via team_rosters
  const { data: rosterEntry } = await supabase
    .from("team_rosters")
    .select("id")
    .eq("team_id", team.id)
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
      // Measurables
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
      // Academics
      gpa: athlete.gpa?.toFixed(2) || "",
      weightedGpa: athlete.weighted_gpa?.toFixed(2) || "",
      coreGpa: athlete.core_gpa?.toFixed(2) || "",
      sat: athlete.sat_score?.toString() || "",
      act: athlete.act_score?.toString() || "",
      major: athlete.desired_major || "",
      academicInterest: athlete.academic_interest || "",
      collegePriority: athlete.college_priority || "",
      // Film
      hudlLink: athlete.hudl_link || "",
      youtubeLink: athlete.youtube_link || "",
      // Coach assessment
      coachNotes: athlete.coach_notes || "",
      playerSummary: athlete.player_summary || "",
      ncaaEcId: athlete.ncaa_id || "",
      coachPhone: athlete.coach_phone || "",
      coachEmail: athlete.coach_email || "",
      // Contact & Social
      phone: athlete.phone || "",
      twitter: athlete.twitter || "",
      instagram: athlete.instagram || "",
      // Parent/Guardian
      parent1Name: athlete.parent1_name || "",
      parent1Phone: athlete.parent1_phone || "",
      parent1Email: athlete.parent1_email || "",
      parent2Name: athlete.parent2_name || "",
      parent2Phone: athlete.parent2_phone || "",
      parent2Email: athlete.parent2_email || "",
      siblingsInfo: athlete.siblings_info || "",
      // Team
      jerseyNumber: athlete.jersey_number || "",
      organizationName: athlete.organization_name || "",
      // Recruiting
      awards: athlete.awards || "",
      otherSports: athlete.other_sports || "",
      campsAttended: athlete.camps_attended || "",
      dreamSchools: athlete.dream_schools || "",
      // Equipment
      cleatSize: athlete.cleat_size || "",
      shirtSize: athlete.shirt_size || "",
      pantsSize: athlete.pants_size || "",
      helmetSize: athlete.helmet_size || "",
      gloveSize: athlete.glove_size || "",
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
    // Contact & Social
    if (body.phone !== undefined) update.phone = body.phone || null;
    if (body.twitter !== undefined) update.twitter = body.twitter || null;
    if (body.instagram !== undefined) update.instagram = body.instagram || null;
    // Parent/Guardian
    if (body.parent1Name !== undefined) update.parent1_name = body.parent1Name || null;
    if (body.parent1Phone !== undefined) update.parent1_phone = body.parent1Phone || null;
    if (body.parent1Email !== undefined) update.parent1_email = body.parent1Email || null;
    if (body.parent2Name !== undefined) update.parent2_name = body.parent2Name || null;
    if (body.parent2Phone !== undefined) update.parent2_phone = body.parent2Phone || null;
    if (body.parent2Email !== undefined) update.parent2_email = body.parent2Email || null;
    if (body.siblingsInfo !== undefined) update.siblings_info = body.siblingsInfo || null;
    // Team
    if (body.organizationName !== undefined) update.organization_name = body.organizationName || null;
    // Additional academics
    if (body.major !== undefined) update.desired_major = body.major || null;
    if (body.coreGpa !== undefined) update.core_gpa = body.coreGpa ? parseFloat(body.coreGpa) : null;
    if (body.academicInterest !== undefined) update.academic_interest = body.academicInterest || null;
    if (body.collegePriority !== undefined) update.college_priority = body.collegePriority || null;
    // Recruiting
    if (body.awards !== undefined) update.awards = body.awards || null;
    if (body.otherSports !== undefined) update.other_sports = body.otherSports || null;
    if (body.campsAttended !== undefined) update.camps_attended = body.campsAttended || null;
    if (body.dreamSchools !== undefined) update.dream_schools = body.dreamSchools || null;
    // Equipment
    if (body.cleatSize !== undefined) update.cleat_size = body.cleatSize || null;
    if (body.shirtSize !== undefined) update.shirt_size = body.shirtSize || null;
    if (body.pantsSize !== undefined) update.pants_size = body.pantsSize || null;
    if (body.helmetSize !== undefined) update.helmet_size = body.helmetSize || null;
    if (body.gloveSize !== undefined) update.glove_size = body.gloveSize || null;

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

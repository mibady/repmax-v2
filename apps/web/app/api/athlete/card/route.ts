import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

function formatHeight(inches: number | null): string {
  if (!inches) return "";
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get athlete data
    const { data: athlete } = await supabase
      .from("athletes")
      .select(`
        id,
        school,
        city,
        state,
        class_year,
        position,
        height_inches,
        weight_lbs,
        forty_yard_dash,
        gpa,
        sat_score,
        act_score,
        zone,
        hudl_link,
        youtube_link,
        bio,
        wingspan_inches,
        bench_press_lbs,
        squat_lbs,
        vertical_inches,
        secondary_position,
        desired_major,
        ten_yard_split,
        five_ten_five,
        broad_jump_inches,
        weighted_gpa,
        coach_notes,
        player_summary,
        coach_phone,
        coach_email
      `)
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    // Format response
    const cardData = {
      name: profile.full_name || "",
      position: athlete.position || "",
      secondaryPosition: athlete.secondary_position || "",
      classYear: athlete.class_year || new Date().getFullYear() + 1,
      highSchool: athlete.school || "",
      city: athlete.city || "",
      state: athlete.state || "",
      bio: athlete.bio || "",
      zone: athlete.zone || "",
      avatarUrl: profile.avatar_url || "",
      height: formatHeight(athlete.height_inches),
      weight: athlete.weight_lbs?.toString() || "",
      wingspan: athlete.wingspan_inches?.toString() || "",
      fortyYard: athlete.forty_yard_dash?.toFixed(2) || "",
      benchPress: athlete.bench_press_lbs?.toString() || "",
      squat: athlete.squat_lbs?.toString() || "",
      vertical: athlete.vertical_inches?.toString() || "",
      gpa: athlete.gpa?.toFixed(2) || "",
      sat: athlete.sat_score?.toString() || "",
      act: athlete.act_score?.toString() || "",
      major: athlete.desired_major || "",
      hudlLink: athlete.hudl_link || "",
      youtubeLink: athlete.youtube_link || "",
      tenYardSplit: athlete.ten_yard_split?.toFixed(2) || "",
      fiveTenFive: athlete.five_ten_five?.toFixed(2) || "",
      broadJump: athlete.broad_jump_inches?.toString() || "",
      weightedGpa: athlete.weighted_gpa?.toFixed(2) || "",
      coachNotes: athlete.coach_notes || "",
      playerSummary: athlete.player_summary || "",
      coachPhone: athlete.coach_phone || "",
      coachEmail: athlete.coach_email || "",
    };

    return NextResponse.json(cardData);
  } catch (error) {
    console.error("Error fetching athlete card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get athlete
    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const cardUpdateSchema = z.object({
      name: z.string().optional(),
      position: z.string().optional(),
      secondaryPosition: z.string().nullable().optional(),
      classYear: z.number().optional(),
      highSchool: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      bio: z.string().nullable().optional(),
      zone: z.string().optional(),
      heightInches: z.number().nullable().optional(),
      weightLbs: z.number().nullable().optional(),
      wingspan: z.string().nullable().optional(),
      fortyYardDash: z.number().nullable().optional(),
      benchPress: z.string().nullable().optional(),
      squat: z.string().nullable().optional(),
      vertical: z.string().nullable().optional(),
      gpa: z.number().nullable().optional(),
      sat: z.string().nullable().optional(),
      act: z.string().nullable().optional(),
      major: z.string().nullable().optional(),
      hudlLink: z.string().nullable().optional(),
      youtubeLink: z.string().nullable().optional(),
      tenYardSplit: z.string().nullable().optional(),
      fiveTenFive: z.string().nullable().optional(),
      broadJump: z.string().nullable().optional(),
      weightedGpa: z.string().nullable().optional(),
      coachNotes: z.string().nullable().optional(),
      playerSummary: z.string().nullable().optional(),
      coachPhone: z.string().nullable().optional(),
      coachEmail: z.string().nullable().optional(),
    }).partial();

    const parsed = cardUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
    }

    // Update profile name
    if (body.name) {
      await supabase
        .from("profiles")
        .update({ full_name: body.name })
        .eq("id", profile.id);
    }

    // Update athlete data
    const athleteUpdate: Record<string, unknown> = {};

    if (body.position) athleteUpdate.position = body.position;
    if (body.secondaryPosition !== undefined)
      athleteUpdate.secondary_position = body.secondaryPosition || null;
    if (body.classYear) athleteUpdate.class_year = body.classYear;
    if (body.highSchool) athleteUpdate.school = body.highSchool;
    if (body.city) athleteUpdate.city = body.city;
    if (body.state) athleteUpdate.state = body.state;
    if (body.bio !== undefined) athleteUpdate.bio = body.bio || null;
    if (body.zone) athleteUpdate.zone = body.zone;
    if (body.heightInches !== undefined)
      athleteUpdate.height_inches = body.heightInches;
    if (body.weightLbs !== undefined) athleteUpdate.weight_lbs = body.weightLbs;
    if (body.wingspan) athleteUpdate.wingspan_inches = parseInt(body.wingspan);
    if (body.fortyYardDash !== undefined)
      athleteUpdate.forty_yard_dash = body.fortyYardDash;
    if (body.benchPress)
      athleteUpdate.bench_press_lbs = parseInt(body.benchPress);
    if (body.squat) athleteUpdate.squat_lbs = parseInt(body.squat);
    if (body.vertical) athleteUpdate.vertical_inches = parseInt(body.vertical);
    if (body.gpa !== undefined) athleteUpdate.gpa = body.gpa;
    if (body.sat) athleteUpdate.sat_score = parseInt(body.sat);
    if (body.act) athleteUpdate.act_score = parseInt(body.act);
    if (body.major !== undefined) athleteUpdate.desired_major = body.major || null;
    if (body.hudlLink !== undefined)
      athleteUpdate.hudl_link = body.hudlLink || null;
    if (body.youtubeLink !== undefined)
      athleteUpdate.youtube_link = body.youtubeLink || null;
    if (body.tenYardSplit !== undefined)
      athleteUpdate.ten_yard_split = body.tenYardSplit ? parseFloat(body.tenYardSplit) : null;
    if (body.fiveTenFive !== undefined)
      athleteUpdate.five_ten_five = body.fiveTenFive ? parseFloat(body.fiveTenFive) : null;
    if (body.broadJump !== undefined)
      athleteUpdate.broad_jump_inches = body.broadJump ? parseInt(body.broadJump) : null;
    if (body.weightedGpa !== undefined)
      athleteUpdate.weighted_gpa = body.weightedGpa ? parseFloat(body.weightedGpa) : null;
    if (body.coachNotes !== undefined)
      athleteUpdate.coach_notes = body.coachNotes || null;
    if (body.playerSummary !== undefined)
      athleteUpdate.player_summary = body.playerSummary || null;
    if (body.coachPhone !== undefined)
      athleteUpdate.coach_phone = body.coachPhone || null;
    if (body.coachEmail !== undefined)
      athleteUpdate.coach_email = body.coachEmail || null;

    if (Object.keys(athleteUpdate).length > 0) {
      const { error } = await supabase
        .from("athletes")
        .update(athleteUpdate)
        .eq("id", athlete.id);

      if (error) {
        console.error("Error updating athlete:", error);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating athlete card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

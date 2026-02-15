import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        desired_major
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

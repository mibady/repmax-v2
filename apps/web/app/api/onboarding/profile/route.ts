import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateRepmaxId, stateToZone } from "@/lib/utils/athlete-helpers";

// Schema for profile update
const updateProfileSchema = z.object({
  // Basic profile info
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional().nullable(),

  // Athlete-specific info
  high_school: z.string().min(1).max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(50).optional(),
  class_year: z.number().min(2020).max(2035).optional(),
  primary_position: z.string().min(1).max(20).optional(),
  secondary_position: z.string().min(1).max(20).optional().nullable(),

  // Measurables
  height_inches: z.number().min(48).max(96).optional().nullable(),
  weight_lbs: z.number().min(80).max(400).optional().nullable(),
  forty_yard_time: z.number().min(3.5).max(8.0).optional().nullable(),
  vertical_inches: z.number().min(10).max(60).optional().nullable(),

  // Academics
  gpa: z.number().min(0).max(5.0).optional().nullable(),
  sat_score: z.number().min(400).max(1600).optional().nullable(),
  act_score: z.number().min(1).max(36).optional().nullable(),

  // NCAA
  ncaa_id: z.string().max(50).optional().nullable(),
  ncaa_cleared: z.boolean().optional(),
});

export type OnboardingProfileUpdate = z.infer<typeof updateProfileSchema>;

// Define fields for completion calculation
const PROFILE_FIELDS = ["full_name"] as const;
const ATHLETE_REQUIRED_FIELDS = [
  "high_school",
  "city",
  "state",
  "class_year",
  "primary_position",
] as const;
const ATHLETE_OPTIONAL_FIELDS = [
  "secondary_position",
  "height_inches",
  "weight_lbs",
  "forty_yard_time",
  "vertical_inches",
  "gpa",
  "sat_score",
  "act_score",
  "ncaa_id",
] as const;

// GET /api/onboarding/profile
// Returns the current user's profile and athlete data for onboarding
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    // Get athlete data if profile exists
    let athlete = null;
    if (profile) {
      const { data: athleteData, error: athleteError } = await supabase
        .from("athletes")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (athleteError && athleteError.code !== "PGRST116") {
        console.error("Error fetching athlete:", athleteError);
      }
      athlete = athleteData;
    }

    // Calculate completion percentage
    const completedFields: string[] = [];
    const totalFields = [...PROFILE_FIELDS, ...ATHLETE_REQUIRED_FIELDS, ...ATHLETE_OPTIONAL_FIELDS];

    // Check profile fields
    if (profile?.full_name) completedFields.push("full_name");

    // Check athlete required fields
    if (athlete) {
      if (athlete.high_school) completedFields.push("high_school");
      if (athlete.city) completedFields.push("city");
      if (athlete.state) completedFields.push("state");
      if (athlete.class_year) completedFields.push("class_year");
      if (athlete.primary_position) completedFields.push("primary_position");

      // Check athlete optional fields
      if (athlete.secondary_position) completedFields.push("secondary_position");
      if (athlete.height_inches) completedFields.push("height_inches");
      if (athlete.weight_lbs) completedFields.push("weight_lbs");
      if (athlete.forty_yard_time) completedFields.push("forty_yard_time");
      if (athlete.vertical_inches) completedFields.push("vertical_inches");
      if (athlete.gpa) completedFields.push("gpa");
      if (athlete.sat_score) completedFields.push("sat_score");
      if (athlete.act_score) completedFields.push("act_score");
      if (athlete.ncaa_id) completedFields.push("ncaa_id");
    }

    const completionPercentage = Math.round((completedFields.length / totalFields.length) * 100);

    // Check if required fields are complete
    const requiredComplete = PROFILE_FIELDS.every(f => completedFields.includes(f)) &&
      ATHLETE_REQUIRED_FIELDS.every(f => completedFields.includes(f));

    return NextResponse.json({
      profile: profile ? {
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        created_at: profile.created_at,
      } : null,
      athlete: athlete ? {
        id: athlete.id,
        profile_id: athlete.profile_id,
        high_school: athlete.high_school,
        city: athlete.city,
        state: athlete.state,
        zone: athlete.zone,
        class_year: athlete.class_year,
        primary_position: athlete.primary_position,
        secondary_position: athlete.secondary_position,
        height_inches: athlete.height_inches,
        weight_lbs: athlete.weight_lbs,
        forty_yard_time: athlete.forty_yard_time,
        vertical_inches: athlete.vertical_inches,
        gpa: athlete.gpa,
        sat_score: athlete.sat_score,
        act_score: athlete.act_score,
        ncaa_id: athlete.ncaa_id,
        ncaa_cleared: athlete.ncaa_cleared,
        verified: athlete.verified,
      } : null,
      completion: {
        percentage: completionPercentage,
        completedFields,
        totalFields: totalFields.length,
        requiredComplete,
      },
    });
  } catch (error) {
    console.error("Onboarding profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/onboarding/profile
// Update profile and athlete data during onboarding
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    // Get or create profile
    // eslint-disable-next-line prefer-const
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          full_name: data.full_name || user.email?.split("@")[0] || "New User",
          role: "athlete",
          avatar_url: data.avatar_url || null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }
      profile = newProfile;
    } else if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    // Update profile fields if provided
    const profileUpdates: Record<string, unknown> = {};
    if (data.full_name !== undefined) profileUpdates.full_name = data.full_name;
    if (data.avatar_url !== undefined) profileUpdates.avatar_url = data.avatar_url;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString();
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", profile.id);

      if (updateProfileError) {
        console.error("Error updating profile:", updateProfileError);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }
    }

    // Get or create athlete record
    // eslint-disable-next-line prefer-const
    let { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("*")
      .eq("profile_id", profile.id)
      .single();

    // Prepare athlete updates
    const athleteUpdates: Record<string, unknown> = {};
    if (data.high_school !== undefined) athleteUpdates.high_school = data.high_school;
    if (data.city !== undefined) athleteUpdates.city = data.city;
    if (data.state !== undefined) athleteUpdates.state = data.state;
    if (data.class_year !== undefined) athleteUpdates.class_year = data.class_year;
    if (data.primary_position !== undefined) athleteUpdates.primary_position = data.primary_position;
    if (data.secondary_position !== undefined) athleteUpdates.secondary_position = data.secondary_position;
    if (data.height_inches !== undefined) athleteUpdates.height_inches = data.height_inches;
    if (data.weight_lbs !== undefined) athleteUpdates.weight_lbs = data.weight_lbs;
    if (data.forty_yard_time !== undefined) athleteUpdates.forty_yard_time = data.forty_yard_time;
    if (data.vertical_inches !== undefined) athleteUpdates.vertical_inches = data.vertical_inches;
    if (data.gpa !== undefined) athleteUpdates.gpa = data.gpa;
    if (data.sat_score !== undefined) athleteUpdates.sat_score = data.sat_score;
    if (data.act_score !== undefined) athleteUpdates.act_score = data.act_score;
    if (data.ncaa_id !== undefined) athleteUpdates.ncaa_id = data.ncaa_id;
    if (data.ncaa_cleared !== undefined) athleteUpdates.ncaa_cleared = data.ncaa_cleared;

    if (athleteError && athleteError.code === "PGRST116") {
      // Create athlete record if it doesn't exist — always create for athlete role
      const stateVal = athleteUpdates.state as string || "TBD";
      const classYearVal = athleteUpdates.class_year as number || new Date().getFullYear() + 1;
      const fullName = profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
      const repmaxId = await generateRepmaxId(supabase, fullName, classYearVal);
      const zone = stateVal !== "TBD" ? stateToZone(stateVal) : null;

      const { data: newAthlete, error: createAthleteError } = await supabase
        .from("athletes")
        .insert({
          profile_id: profile.id,
          high_school: athleteUpdates.high_school as string || "TBD",
          city: athleteUpdates.city as string || "TBD",
          state: stateVal,
          class_year: classYearVal,
          primary_position: athleteUpdates.primary_position as string || "ATH",
          secondary_position: athleteUpdates.secondary_position as string | null || null,
          height_inches: athleteUpdates.height_inches as number | null || null,
          weight_lbs: athleteUpdates.weight_lbs as number | null || null,
          forty_yard_time: athleteUpdates.forty_yard_time as number | null || null,
          vertical_inches: athleteUpdates.vertical_inches as number | null || null,
          gpa: athleteUpdates.gpa as number | null || null,
          sat_score: athleteUpdates.sat_score as number | null || null,
          act_score: athleteUpdates.act_score as number | null || null,
          ncaa_id: athleteUpdates.ncaa_id as string | null || null,
          ncaa_cleared: athleteUpdates.ncaa_cleared as boolean || false,
          repmax_id: repmaxId,
          zone: zone,
        })
        .select()
        .single();

      if (createAthleteError) {
        console.error("Error creating athlete:", createAthleteError);
        return NextResponse.json({ error: "Failed to create athlete record" }, { status: 500 });
      }
      athlete = newAthlete;
    } else if (athleteError) {
      console.error("Error fetching athlete:", athleteError);
      return NextResponse.json({ error: "Failed to fetch athlete" }, { status: 500 });
    } else if (athlete && Object.keys(athleteUpdates).length > 0) {
      // Auto-derive zone when state changes
      if (athleteUpdates.state) {
        const derivedZone = stateToZone(athleteUpdates.state as string);
        if (derivedZone) athleteUpdates.zone = derivedZone;
      }
      // Generate repmax_id if missing (backfill for pre-fix athletes)
      if (!athlete.repmax_id) {
        const fullName = profile.full_name || user.user_metadata?.full_name || "User";
        const classYear = (athleteUpdates.class_year as number) || athlete.class_year || new Date().getFullYear() + 1;
        athleteUpdates.repmax_id = await generateRepmaxId(supabase, fullName, classYear);
      }
      // Update existing athlete record
      athleteUpdates.updated_at = new Date().toISOString();
      const { data: updatedAthlete, error: updateAthleteError } = await supabase
        .from("athletes")
        .update(athleteUpdates)
        .eq("id", athlete.id)
        .select()
        .single();

      if (updateAthleteError) {
        console.error("Error updating athlete:", updateAthleteError);
        return NextResponse.json({ error: "Failed to update athlete record" }, { status: 500 });
      }
      athlete = updatedAthlete;
    }

    // Re-fetch profile for updated data
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profile.id)
      .single();

    // Calculate updated completion
    const completedFields: string[] = [];
    const totalFields = [...PROFILE_FIELDS, ...ATHLETE_REQUIRED_FIELDS, ...ATHLETE_OPTIONAL_FIELDS];

    if (updatedProfile?.full_name) completedFields.push("full_name");

    if (athlete) {
      if (athlete.high_school && athlete.high_school !== "TBD") completedFields.push("high_school");
      if (athlete.city && athlete.city !== "TBD") completedFields.push("city");
      if (athlete.state && athlete.state !== "TBD") completedFields.push("state");
      if (athlete.class_year) completedFields.push("class_year");
      if (athlete.primary_position && athlete.primary_position !== "ATH") completedFields.push("primary_position");
      if (athlete.secondary_position) completedFields.push("secondary_position");
      if (athlete.height_inches) completedFields.push("height_inches");
      if (athlete.weight_lbs) completedFields.push("weight_lbs");
      if (athlete.forty_yard_time) completedFields.push("forty_yard_time");
      if (athlete.vertical_inches) completedFields.push("vertical_inches");
      if (athlete.gpa) completedFields.push("gpa");
      if (athlete.sat_score) completedFields.push("sat_score");
      if (athlete.act_score) completedFields.push("act_score");
      if (athlete.ncaa_id) completedFields.push("ncaa_id");
    }

    const completionPercentage = Math.round((completedFields.length / totalFields.length) * 100);
    const requiredComplete = PROFILE_FIELDS.every(f => completedFields.includes(f)) &&
      ATHLETE_REQUIRED_FIELDS.every(f => completedFields.includes(f));

    return NextResponse.json({
      success: true,
      profile: updatedProfile ? {
        id: updatedProfile.id,
        user_id: updatedProfile.user_id,
        full_name: updatedProfile.full_name,
        avatar_url: updatedProfile.avatar_url,
        role: updatedProfile.role,
      } : null,
      athlete: athlete ? {
        id: athlete.id,
        profile_id: athlete.profile_id,
        high_school: athlete.high_school,
        city: athlete.city,
        state: athlete.state,
        zone: athlete.zone,
        class_year: athlete.class_year,
        primary_position: athlete.primary_position,
        secondary_position: athlete.secondary_position,
        height_inches: athlete.height_inches,
        weight_lbs: athlete.weight_lbs,
        forty_yard_time: athlete.forty_yard_time,
        vertical_inches: athlete.vertical_inches,
        gpa: athlete.gpa,
        sat_score: athlete.sat_score,
        act_score: athlete.act_score,
        ncaa_id: athlete.ncaa_id,
        ncaa_cleared: athlete.ncaa_cleared,
      } : null,
      completion: {
        percentage: completionPercentage,
        completedFields,
        totalFields: totalFields.length,
        requiredComplete,
      },
    });
  } catch (error) {
    console.error("Onboarding profile POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request body", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

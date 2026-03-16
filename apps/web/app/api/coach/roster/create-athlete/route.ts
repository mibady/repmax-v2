import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAthleteForCoach } from "@/lib/actions/coach-roster-actions";
import { z } from "zod";

const CreateSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Position is required"),
  class_year: z.number().int().min(2024).max(2032),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: team } = await supabase
      .from("teams")
      .select("id, school_name, city, state")
      .eq("coach_profile_id", profile.id)
      .single();

    if (!team) {
      return NextResponse.json(
        { error: "No team found. Complete team setup first." },
        { status: 400 }
      );
    }

    const body = CreateSchema.parse(await request.json());

    const result = await createAthleteForCoach({
      fullName: body.full_name,
      email: body.email,
      position: body.position,
      classYear: body.class_year,
      schoolName: team.school_name,
      city: team.city,
      state: team.state,
      teamId: team.id,
      coachProfileId: profile.id,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, result: result.result, athlete_id: result.athleteId || null },
        { status: result.athleteId ? 200 : 400 }
      );
    }

    return NextResponse.json(
      {
        result: result.result,
        athlete_id: result.athleteId,
        invite_sent: result.result === "created",
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create athlete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

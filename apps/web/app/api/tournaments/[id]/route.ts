import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch tournament
    const { data: tournament, error } = await supabase
      .from("off_season_events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if current user is the organizer
    const isOrganizer = tournament.organizer_id === user.id;

    // Get registration count (hide contact_email from non-organizers)
    const registrationFields = isOrganizer
      ? "id, school_id, team_name, contact_name, contact_email, payment_status, created_at"
      : "id, school_id, team_name, contact_name, payment_status, created_at";

    const { data: registrations } = await supabase
      .from("tournament_registrations")
      .select(registrationFields)
      .eq("tournament_id", id);

    // Check if the current user's school is registered
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let myRegistration = null;
    if (userProfile) {
      const { data: schoolMembership } = await supabase
        .from("school_members")
        .select("school_id")
        .eq("profile_id", userProfile.id)
        .limit(1)
        .maybeSingle();

      if (schoolMembership) {
        const { data: reg } = await supabase
          .from("tournament_registrations")
          .select("*")
          .eq("tournament_id", id)
          .eq("school_id", schoolMembership.school_id)
          .maybeSingle();

        myRegistration = reg;
      }
    }

    return NextResponse.json({
      tournament,
      registrations: registrations || [],
      registration_count: (registrations || []).length,
      my_registration: myRegistration,
    });
  } catch (error) {
    console.error("Tournament detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateTournamentSchema = z.object({
  schedule_published: z.boolean().optional(),
  waiver_text: z.string().nullable().optional(),
  age_cutoff_date: z.string().nullable().optional(),
  max_age_years: z.number().int().min(1).nullable().optional(),
});

// PATCH: Update tournament fields (organizer only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify organizer
    const { data: tournament } = await supabase
      .from("off_season_events")
      .select("id, organizer_id")
      .eq("id", id)
      .single();

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can update this event" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateTournamentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.schedule_published !== undefined) updates.schedule_published = parsed.data.schedule_published;
    if (parsed.data.waiver_text !== undefined) updates.waiver_text = parsed.data.waiver_text;
    if (parsed.data.age_cutoff_date !== undefined) updates.age_cutoff_date = parsed.data.age_cutoff_date;
    if (parsed.data.max_age_years !== undefined) updates.max_age_years = parsed.data.max_age_years;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("off_season_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Tournament update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Tournament PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

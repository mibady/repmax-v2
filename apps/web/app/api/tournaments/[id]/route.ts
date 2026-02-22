import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .from("tournaments")
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

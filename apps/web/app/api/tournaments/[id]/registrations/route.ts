import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET: List registrations for a tournament (for organizer)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is the tournament organizer
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id, organizer_id")
      .eq("id", tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can view registrations" },
        { status: 403 }
      );
    }

    const { data: registrations, error } = await supabase
      .from("tournament_registrations")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Registrations fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ registrations: registrations || [] });
  } catch (error) {
    console.error("Registrations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateStatusSchema = z.object({
  registration_id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

// PATCH: Update registration status (approve/reject) — organizer only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is the tournament organizer
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("id, organizer_id")
      .eq("id", tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can update registrations" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data: registration, error } = await supabase
      .from("tournament_registrations")
      .update({ payment_status: parsed.data.status })
      .eq("id", parsed.data.registration_id)
      .eq("tournament_id", tournamentId)
      .select()
      .single();

    if (error) {
      console.error("Registration update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Registration update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

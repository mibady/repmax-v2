import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// GET: Get roster for a registration
export async function GET(
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

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registration_id");

    if (!registrationId) {
      return NextResponse.json(
        { error: "registration_id is required" },
        { status: 400 }
      );
    }

    // Verify registration belongs to this tournament
    const { data: registration } = await supabase
      .from("tournament_registrations")
      .select("id, tournament_id, school_id")
      .eq("id", registrationId)
      .eq("tournament_id", tournamentId)
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found for this tournament" },
        { status: 404 }
      );
    }

    const { data: roster, error } = await supabase
      .from("tournament_rosters")
      .select("*")
      .eq("registration_id", registrationId)
      .order("jersey_number", { ascending: true });

    if (error) {
      console.error("Roster fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ roster: roster || [] });
  } catch (error) {
    console.error("Roster error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const playerSchema = z.object({
  player_name: z.string().min(1).max(200),
  jersey_number: z.string().max(10).optional(),
  position: z.string().max(50).optional(),
  class_year: z.number().int().min(2020).max(2035).optional(),
});

const rosterSubmitSchema = z.object({
  registration_id: z.string().uuid(),
  players: z.array(playerSchema).min(1).max(75),
});

// POST: Add/update roster players for a registration
export async function POST(
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

    const body = await request.json();
    const parsed = rosterSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verify registration belongs to this tournament
    const { data: registration } = await supabase
      .from("tournament_registrations")
      .select("id, tournament_id, school_id, payment_status, amount_cents")
      .eq("id", parsed.data.registration_id)
      .eq("tournament_id", tournamentId)
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found for this tournament" },
        { status: 404 }
      );
    }

    // Check payment status if an entry fee was required
    if (registration.amount_cents > 0 && registration.payment_status !== 'approved') {
      return NextResponse.json(
        { error: "Payment required before submitting roster" },
        { status: 402 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // Check school membership (authorization)
    if (profile) {
      const { data: membership } = await supabase
        .from("school_members")
        .select("id")
        .eq("school_id", (registration as any).school_id)
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json(
          { error: "Unauthorized: You do not belong to this school" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Clear existing roster and insert new
    await supabase
      .from("tournament_rosters")
      .delete()
      .eq("registration_id", parsed.data.registration_id);

    const rosterRows = parsed.data.players.map((p) => ({
      registration_id: parsed.data.registration_id,
      player_name: p.player_name,
      jersey_number: p.jersey_number ?? null,
      position: p.position ?? null,
      class_year: p.class_year ?? null,
    }));

    const { data: roster, error } = await supabase
      .from("tournament_rosters")
      .insert(rosterRows)
      .select();

    if (error) {
      console.error("Roster insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ roster: roster || [] }, { status: 201 });
  } catch (error) {
    console.error("Roster submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const deleteSchema = z.object({
  player_id: z.string().uuid(),
});

// DELETE: Remove a roster player
export async function DELETE(
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

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verify the player's registration belongs to this tournament
    const { data: player } = await supabase
      .from("tournament_rosters")
      .select("id, registration_id")
      .eq("id", parsed.data.player_id)
      .single();

    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const { data: registration } = await supabase
      .from("tournament_registrations")
      .select("id, tournament_id, school_id")
      .eq("id", player.registration_id)
      .eq("tournament_id", tournamentId)
      .single();

    if (!registration) {
      return NextResponse.json(
        { error: "Player does not belong to this tournament" },
        { status: 403 }
      );
    }

    // Get user profile and check school membership (authorization)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const { data: membership } = await supabase
        .from("school_members")
        .select("id")
        .eq("school_id", (registration as any).school_id)
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json(
          { error: "Unauthorized: You do not belong to this school" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("tournament_rosters")
      .delete()
      .eq("id", parsed.data.player_id);

    if (error) {
      console.error("Roster delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Roster delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

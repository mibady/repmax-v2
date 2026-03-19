import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const registerSchema = z.object({
  school_id: z.string().uuid().optional(),
  team_name: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(200),
  contact_email: z.string().email(),
  contact_phone: z.string().max(20).optional(),
  waiver_accepted: z.boolean().optional(),
});

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
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verify tournament exists and is public
    const { data: tournament, error: tError } = await supabase
      .from("off_season_events")
      .select(
        "id, is_public, registration_deadline, teams_capacity, teams_registered, entry_fee_cents, platform_fee_rate, waiver_text"
      )
      .eq("id", tournamentId)
      .single();

    if (tError || !tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (!tournament.is_public) {
      return NextResponse.json(
        { error: "Tournament is not open for public registration" },
        { status: 403 }
      );
    }

    // Check registration deadline
    if (tournament.registration_deadline) {
      const deadline = new Date(tournament.registration_deadline);
      if (deadline < new Date()) {
        return NextResponse.json(
          { error: "Registration deadline has passed" },
          { status: 400 }
        );
      }
    }

    // Validate waiver acceptance if tournament has waiver
    if (tournament.waiver_text && !parsed.data.waiver_accepted) {
      return NextResponse.json(
        { error: "Waiver must be accepted to register" },
        { status: 400 }
      );
    }

    // Check if school is already registered (only if school_id provided)
    if (parsed.data.school_id) {
      const { data: existingReg } = await supabase
        .from("tournament_registrations")
        .select("id")
        .eq("tournament_id", tournamentId)
        .eq("school_id", parsed.data.school_id)
        .maybeSingle();

      if (existingReg) {
        return NextResponse.json(
          { error: "School is already registered for this tournament" },
          { status: 409 }
        );
      }
    }

    // Atomic increment and capacity check
    const { data: canRegister, error: incError } = await supabase
      .rpc('increment_tournament_registration', { t_id: tournamentId });

    if (incError) {
      console.error("Increment error:", incError);
      return NextResponse.json({ error: incError.message }, { status: 500 });
    }

    if (!canRegister) {
      return NextResponse.json(
        { error: "Tournament is at full capacity" },
        { status: 400 }
      );
    }

    // Calculate fees
    const entryFeeCents = tournament.entry_fee_cents || 0;
    const platformFeeRate = tournament.platform_fee_rate ?? 0.05;
    const platformFeeCents = Math.round(entryFeeCents * platformFeeRate);

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from("tournament_registrations")
      .insert({
        tournament_id: tournamentId,
        school_id: parsed.data.school_id ?? null,
        team_name: parsed.data.team_name,
        contact_name: parsed.data.contact_name,
        contact_email: parsed.data.contact_email,
        contact_phone: parsed.data.contact_phone ?? null,
        amount_cents: entryFeeCents,
        platform_fee_cents: platformFeeCents,
        payment_status: entryFeeCents > 0 ? "pending" : "approved",
        ...(parsed.data.waiver_accepted ? {
          waiver_accepted: true,
          waiver_accepted_at: new Date().toISOString(),
          waiver_accepted_by: parsed.data.contact_name,
        } : {}),
      })
      .select()
      .single();

    if (regError) {
      console.error("Registration insert error:", regError);
      // Rollback the increment if possible (optional, but good for data integrity)
      // For now, we'll just log it.
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Tournament registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

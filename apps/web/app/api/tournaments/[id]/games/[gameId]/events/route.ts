import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const scoreEventSchema = z.object({
  event_type: z.enum(['touchdown', 'field_goal', 'safety', 'extra_point', 'two_point_conversion']),
  registration_id: z.string().uuid().nullable(),
  player_name: z.string().optional(),
  quarter: z.number().int().min(1).max(4),
  game_clock: z.string().optional(),
  description: z.string().optional(),
});

const EVENT_POINTS: Record<string, number> = {
  'touchdown': 6,
  'field_goal': 3,
  'safety': 2,
  'extra_point': 1,
  'two_point_conversion': 2,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string }> }
): Promise<NextResponse> {
  try {
    const { id: tournamentId, gameId } = await params;
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

    if (!tournament || tournament.organizer_id !== user.id) {
      return NextResponse.json(
        { error: "Only the tournament organizer can record scores" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = scoreEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const points = EVENT_POINTS[parsed.data.event_type];

    // Get the profile ID for the current user
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Insert the score event
    const { data: event, error: eventError } = await supabase
      .from("game_score_events")
      .insert({
        game_id: gameId,
        event_type: parsed.data.event_type,
        registration_id: parsed.data.registration_id,
        player_name: parsed.data.player_name || null,
        quarter: parsed.data.quarter,
        game_clock: parsed.data.game_clock || null,
        points: points,
        description: parsed.data.description || null,
        created_by: profile.id,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Score event insert error:", eventError);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    // Update the game score
    if (parsed.data.registration_id) {
      const { data: game } = await supabase
        .from("tournament_games")
        .select("home_registration_id, away_registration_id, home_score, away_score")
        .eq("id", gameId)
        .single();

      if (game) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: any = {};
        if (game.home_registration_id === parsed.data.registration_id) {
          updates.home_score = (game.home_score || 0) + points;
        } else if (game.away_registration_id === parsed.data.registration_id) {
          updates.away_score = (game.away_score || 0) + points;
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from("tournament_games")
            .update(updates)
            .eq("id", gameId);
        }
      }
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Score event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string }> }
): Promise<NextResponse> {
  try {
    const { gameId } = await params;
    const supabase = await createClient();

    const { data: events, error } = await supabase
      .from("game_score_events")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

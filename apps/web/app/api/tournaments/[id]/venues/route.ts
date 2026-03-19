import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createVenueSchema = z.object({
  name: z.string().min(1).max(255),
  field_number: z.number().int().positive().nullable().optional(),
  surface_type: z.enum(["grass", "turf", "indoor"]).nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  location_notes: z.string().max(1000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  maps_url: z.string().url().max(2000).nullable().optional(),
});

const updateVenueSchema = z.object({
  venue_id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  field_number: z.number().int().positive().nullable().optional(),
  surface_type: z.enum(["grass", "turf", "indoor"]).nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  location_notes: z.string().max(1000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  maps_url: z.string().url().max(2000).nullable().optional(),
});

const deleteVenueSchema = z.object({
  venue_id: z.string().uuid(),
});

// GET: List venues for tournament
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

    const { data: venues, error } = await supabase
      .from("tournament_venues")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("field_number", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Venues fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ venues: venues || [] });
  } catch (error) {
    console.error("Venues GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create venue
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

    // Verify the user is the tournament organizer
    const { data: tournament } = await supabase
      .from("off_season_events")
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
        { error: "Only the tournament organizer can manage venues" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createVenueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data: venue, error } = await supabase
      .from("tournament_venues")
      .insert({
        tournament_id: tournamentId,
        name: parsed.data.name,
        field_number: parsed.data.field_number ?? null,
        surface_type: parsed.data.surface_type ?? null,
        capacity: parsed.data.capacity ?? null,
        location_notes: parsed.data.location_notes ?? null,
        address: parsed.data.address ?? null,
        maps_url: parsed.data.maps_url ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Venue insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error("Venue POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update venue
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

    const { data: tournament } = await supabase
      .from("off_season_events")
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
        { error: "Only the tournament organizer can manage venues" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateVenueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { venue_id, ...updateData } = parsed.data;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (updateData.name !== undefined) updates.name = updateData.name;
    if (updateData.field_number !== undefined)
      updates.field_number = updateData.field_number;
    if (updateData.surface_type !== undefined)
      updates.surface_type = updateData.surface_type;
    if (updateData.capacity !== undefined)
      updates.capacity = updateData.capacity;
    if (updateData.location_notes !== undefined)
      updates.location_notes = updateData.location_notes;
    if (updateData.address !== undefined)
      updates.address = updateData.address;
    if (updateData.maps_url !== undefined)
      updates.maps_url = updateData.maps_url;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: venue, error } = await supabase
      .from("tournament_venues")
      .update(updates)
      .eq("id", venue_id)
      .eq("tournament_id", tournamentId)
      .select()
      .single();

    if (error) {
      console.error("Venue update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!venue) {
      return NextResponse.json(
        { error: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Venue PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete venue
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

    const { data: tournament } = await supabase
      .from("off_season_events")
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
        { error: "Only the tournament organizer can manage venues" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = deleteVenueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tournament_venues")
      .delete()
      .eq("id", parsed.data.venue_id)
      .eq("tournament_id", tournamentId);

    if (error) {
      console.error("Venue delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Venue DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

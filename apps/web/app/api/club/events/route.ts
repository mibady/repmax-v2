import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  start_date: z.string().date(),
  end_date: z.string().date(),
  location: z.string().min(1).max(200),
  capacity: z.number().int().positive(),
  description: z.string().max(2000).optional(),
  entry_fee_cents: z.number().int().min(0).optional().default(0),
  registration_deadline: z.string().date().optional(),
  is_public: z.boolean().optional().default(false),
  event_tier: z.enum(["basic", "standard", "premium"]).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role verification
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!profile || (profile.role !== "club" && profile.role !== "admin")) {
      return NextResponse.json(
        { error: "Only users with the 'club' or 'admin' role can create tournaments" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Insert tournament
    const { data, error } = await supabase
      .from("tournaments")
      .insert({
        name: parsed.data.name,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
        location: parsed.data.location,
        teams_capacity: parsed.data.capacity,
        teams_registered: 0,
        total_collected: 0,
        status: "upcoming",
        organizer_id: user.id,
        description: parsed.data.description ?? null,
        entry_fee_cents: parsed.data.entry_fee_cents,
        is_public: parsed.data.is_public,
        event_tier: parsed.data.event_tier ?? null,
        registration_deadline: parsed.data.registration_deadline ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Tournament create error:", error);
      return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Tournament create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

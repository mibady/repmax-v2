import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("athletes")
      .select(
        `
        *,
        profile:profiles(id, full_name, avatar_url, role),
        highlights(*),
        offers(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Athlete not found" },
          { status: 404 }
        );
      }
      console.error("Athlete query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Athlete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check user is authenticated and owns this athlete profile
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership via profile
    const { data: athlete } = await supabase
      .from("athletes")
      .select("profile:profiles(user_id)")
      .eq("id", id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const athleteData = athlete as { profile?: { user_id: string } } | null;
    if (!athleteData || athleteData.profile?.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate body
    const updateSchema = z.object({
      primary_position: z.string().optional(),
      secondary_position: z.string().nullable().optional(),
      high_school: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      class_year: z.number().optional(),
      height_inches: z.number().nullable().optional(),
      weight_lbs: z.number().nullable().optional(),
      forty_yard_time: z.number().nullable().optional(),
      gpa: z.number().nullable().optional(),
      star_rating: z.number().min(1).max(5).nullable().optional(),
      zone: z.string().optional(),
      bio: z.string().nullable().optional(),
      verified: z.boolean().optional(),
    }).partial();

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
    }

    // Update athlete
    const { data, error } = await supabase
      .from("athletes")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Athlete update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Athlete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

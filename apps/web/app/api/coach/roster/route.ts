import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const AddSchema = z.object({ athlete_id: z.string().uuid() });

const PatchSchema = z.object({
  athlete_id: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "top"]).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("id, role").eq("user_id", user.id).single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: team } = await supabase
      .from("teams").select("id").eq("coach_profile_id", profile.id).single();

    if (!team) {
      return NextResponse.json({ error: "No team found. Complete setup first." }, { status: 400 });
    }

    const { athlete_id } = AddSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("team_rosters")
      .insert({ team_id: team.id, athlete_id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ entry: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("id, role").eq("user_id", user.id).single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: team } = await supabase
      .from("teams").select("id").eq("coach_profile_id", profile.id).single();

    if (!team) return NextResponse.json({ error: "No team found" }, { status: 400 });

    const athleteId = new URL(request.url).searchParams.get("athlete_id");
    if (!athleteId) return NextResponse.json({ error: "athlete_id required" }, { status: 400 });

    const { error } = await supabase
      .from("team_rosters")
      .delete()
      .eq("team_id", team.id)
      .eq("athlete_id", athleteId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("id, role").eq("user_id", user.id).single();

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: team } = await supabase
      .from("teams").select("id").eq("coach_profile_id", profile.id).single();

    if (!team) return NextResponse.json({ error: "No team found" }, { status: 400 });

    const { athlete_id, priority, notes } = PatchSchema.parse(await request.json());

    const updates: Record<string, string> = {};
    if (priority !== undefined) updates.priority = priority;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("team_rosters")
      .update(updates)
      .eq("team_id", team.id)
      .eq("athlete_id", athlete_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ entry: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

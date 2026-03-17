import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // College recruiters have a coaches record with school_type = 'college'
    const { data: coachRecord } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();
    if (!coachRecord) return NextResponse.json({ error: "Recruiter record not found" }, { status: 404 });

    const { data: pipeline } = await supabase
      .from("crm_pipeline")
      .select(`
        id, stage, priority, notes, last_touch, sort_order, tags,
        athlete:athletes(
          id, primary_position, class_year, zone, state, star_rating,
          repmax_score, offers_count, high_school,
          profile:profiles(full_name, avatar_url)
        )
      `)
      .eq("recruiter_id", coachRecord.id)
      .order("sort_order", { ascending: true })
      .order("last_touch", { ascending: false });

    return NextResponse.json({ pipeline: pipeline || [] });
  } catch (error) {
    console.error("Recruiter pipeline GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Move athlete to a new stage
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
    const { data: coachRecord } = await supabase.from("coaches").select("id").eq("profile_id", profile!.id).single();

    const body = await request.json();
    const { pipeline_id, stage, notes, priority, sort_order } = body;

    const updateFields: Record<string, unknown> = { last_touch: new Date().toISOString() };
    if (stage !== undefined) updateFields.stage = stage;
    if (notes !== undefined) updateFields.notes = notes;
    if (priority !== undefined) updateFields.priority = priority;
    if (sort_order !== undefined) updateFields.sort_order = sort_order;

    await supabase
      .from("crm_pipeline")
      .update(updateFields)
      .eq("id", pipeline_id)
      .eq("recruiter_id", coachRecord!.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add athlete to pipeline
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
    const { data: coachRecord } = await supabase.from("coaches").select("id").eq("profile_id", profile!.id).single();

    const body = await request.json();
    const { athlete_id, stage = "identified" } = body;

    const { data, error } = await supabase
      .from("crm_pipeline")
      .insert({
        recruiter_id: coachRecord!.id,
        athlete_id,
        stage,
        last_touch: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ entry: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

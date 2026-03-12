import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getCoachId(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return null;

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  return coach?.id || null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const coachId = await getCoachId(supabase);
    if (!coachId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: colleges, error } = await supabase
      .from("coach_college_tracking")
      .select("*")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = (colleges || []).map((c: any) => ({
      id: c.id,
      schoolName: c.school_name,
      temperature: c.temperature,
      prospectCount: c.prospect_count,
      scheduledVisits: c.scheduled_visits,
      notes: c.notes,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ colleges: formatted });
  } catch (error) {
    console.error("Coach colleges GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const coachId = await getCoachId(supabase);
    if (!coachId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { schoolName, temperature, notes } = body;

    if (!schoolName?.trim()) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("coach_college_tracking")
      .insert({
        coach_id: coachId,
        school_name: schoolName.trim(),
        temperature: temperature || "warm",
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ college: data }, { status: 201 });
  } catch (error) {
    console.error("Coach colleges POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.schoolName !== undefined) dbUpdates.school_name = updates.schoolName;
    if (updates.temperature !== undefined) dbUpdates.temperature = updates.temperature;
    if (updates.prospectCount !== undefined) dbUpdates.prospect_count = updates.prospectCount;
    if (updates.scheduledVisits !== undefined) dbUpdates.scheduled_visits = updates.scheduledVisits;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from("coach_college_tracking")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ college: data });
  } catch (error) {
    console.error("Coach colleges PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("coach_college_tracking")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Coach colleges DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

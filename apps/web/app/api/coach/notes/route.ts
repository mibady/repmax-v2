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

    const { data: notes, error } = await supabase
      .from("coach_structured_notes")
      .select(`
        id, content, category, is_pinned, athlete_id, created_at, updated_at,
        athlete:athletes(id, profile:profiles(full_name))
      `)
      .eq("coach_id", coachId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = (notes || []).map((n: any) => {
      const athlete = Array.isArray(n.athlete) ? n.athlete[0] : n.athlete;
      const profile = athlete ? (Array.isArray(athlete.profile) ? athlete.profile[0] : athlete.profile) : null;
      return {
        id: n.id,
        content: n.content,
        category: n.category,
        isPinned: n.is_pinned,
        athleteId: n.athlete_id,
        athleteName: profile?.full_name || null,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      };
    });

    return NextResponse.json({ notes: formatted });
  } catch (error) {
    console.error("Coach notes GET error:", error);
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
    const { content, category, athleteId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const validCategories = ["general", "urgent", "call_log", "strategy"];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Verify athleteId belongs to this coach's roster
    if (athleteId) {
      const { data: rosterEntry } = await supabase
        .from("team_rosters")
        .select("id")
        .eq("athlete_id", athleteId)
        .eq("team_id", (
          await supabase
            .from("teams")
            .select("id")
            .eq("coach_profile_id", (
              await supabase
                .from("coaches")
                .select("profile_id")
                .eq("id", coachId)
                .single()
            ).data?.profile_id)
            .single()
        ).data?.id)
        .single();

      if (!rosterEntry) {
        return NextResponse.json({ error: "Athlete not on your roster" }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("coach_structured_notes")
      .insert({
        coach_id: coachId,
        content: content.trim(),
        category: category || "general",
        athlete_id: athleteId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    console.error("Coach notes POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

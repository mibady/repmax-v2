import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get roster athletes linked to this coach
    const { data: rosterLinks } = await supabase
      .from("coach_roster")
      .select("athlete_id")
      .eq("coach_id", user.id);

    const athleteIds = rosterLinks?.map((r) => r.athlete_id) || [];

    // Get roster athlete details
    let roster: Array<{
      id: string;
      name: string;
      position: string;
      classYear: number;
      gpa: number | null;
      offers: number;
      status: string;
      avatarUrl: string | null;
    }> = [];

    if (athleteIds.length > 0) {
      const { data: athletes } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          athlete_profiles!inner (
            position,
            class_year,
            gpa
          )
        `
        )
        .in("id", athleteIds);

      if (athletes) {
        roster = athletes.map((a) => {
          const ap = Array.isArray(a.athlete_profiles)
            ? a.athlete_profiles[0]
            : a.athlete_profiles;
          return {
            id: a.id,
            name: a.full_name || "Unknown",
            position: ap?.position || "ATH",
            classYear: ap?.class_year || 2026,
            gpa: ap?.gpa || null,
            offers: 0, // TODO: Count from offers table
            status: "active",
            avatarUrl: null,
          };
        });
      }
    }

    // Get coach tasks
    const { data: tasksData } = await supabase
      .from("coach_tasks")
      .select(
        `
        id,
        title,
        description,
        due_date,
        priority,
        status,
        athlete_id,
        created_at,
        profiles:athlete_id (
          full_name
        )
      `
      )
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false });

    const tasks =
      tasksData?.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        priority: t.priority || "medium",
        status: t.status || "pending",
        athleteId: t.athlete_id,
        athleteName:
          (t.profiles as { full_name?: string } | null)?.full_name || null,
        createdAt: t.created_at,
      })) || [];

    // Get coach notes
    const { data: notesData } = await supabase
      .from("coach_notes")
      .select(
        `
        id,
        athlete_id,
        content,
        category,
        created_at,
        profiles:athlete_id (
          full_name
        )
      `
      )
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const notes =
      notesData?.map((n) => ({
        id: n.id,
        athleteId: n.athlete_id,
        athleteName:
          (n.profiles as { full_name?: string } | null)?.full_name ||
          "Unknown",
        content: n.content,
        category: n.category || "general",
        createdAt: n.created_at,
      })) || [];

    // Get coach activities
    const { data: activitiesData } = await supabase
      .from("coach_activities")
      .select(
        `
        id,
        type,
        description,
        athlete_id,
        created_at,
        profiles:athlete_id (
          full_name
        )
      `
      )
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const activity =
      activitiesData?.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        athleteId: a.athlete_id,
        athleteName:
          (a.profiles as { full_name?: string } | null)?.full_name ||
          "Unknown",
        timestamp: a.created_at,
      })) || [];

    // Calculate metrics
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const metrics = {
      totalAthletes: roster.length,
      activeAthletes: roster.filter((r) => r.status === "active").length,
      committedAthletes: roster.filter((r) => r.status === "committed").length,
      pendingTasks,
      totalOffers: roster.reduce((sum, r) => sum + r.offers, 0),
    };

    return NextResponse.json({
      roster,
      tasks,
      notes,
      activity,
      metrics,
    });
  } catch (error) {
    console.error("Coach dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get teams where this coach is the owner
    const { data: teams } = await supabase
      .from("teams")
      .select("id")
      .eq("coach_profile_id", profile.id);

    const teamIds = teams?.map((t) => t.id) || [];

    // Get roster athletes via team_rosters
    let athleteIds: string[] = [];
    if (teamIds.length > 0) {
      const { data: rosterLinks } = await supabase
        .from("team_rosters")
        .select("athlete_id")
        .in("team_id", teamIds);

      athleteIds = rosterLinks?.map((r) => r.athlete_id) || [];
    }

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
        .from("athletes")
        .select(
          `
          id,
          primary_position,
          class_year,
          gpa,
          offers_count,
          profile:profiles!inner(
            full_name,
            avatar_url
          )
        `
        )
        .in("id", athleteIds);

      if (athletes) {
        roster = athletes.map((a) => {
          const p = Array.isArray(a.profile) ? a.profile[0] : a.profile;
          return {
            id: a.id,
            name: (p as { full_name?: string })?.full_name || "Unknown",
            position: a.primary_position || "ATH",
            classYear: a.class_year || 2026,
            gpa: a.gpa ? Number(a.gpa) : null,
            offers: a.offers_count || 0,
            status: "active",
            avatarUrl: (p as { avatar_url?: string })?.avatar_url || null,
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
        text,
        due_date,
        priority,
        completed,
        athlete_id,
        created_at
      `
      )
      .eq("coach_id", profile.id)
      .order("created_at", { ascending: false });

    const tasks =
      tasksData?.map((t) => ({
        id: t.id,
        title: t.text,
        description: null,
        dueDate: t.due_date,
        priority: t.priority || "medium",
        status: t.completed ? "completed" : "pending",
        athleteId: t.athlete_id,
        athleteName: null,
        createdAt: t.created_at,
      })) || [];

    // Get coach notes
    const { data: notesData } = await supabase
      .from("coach_notes")
      .select(
        `
        id,
        athlete_id,
        text,
        pinned,
        created_at
      `
      )
      .eq("coach_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const notes =
      notesData?.map((n) => ({
        id: n.id,
        athleteId: n.athlete_id,
        athleteName: "Unknown",
        content: n.text,
        category: n.pinned ? "pinned" : "general",
        createdAt: n.created_at,
      })) || [];

    // Get activity log
    const { data: activitiesData } = await supabase
      .from("activity_log")
      .select(
        `
        id,
        activity_type,
        notes,
        athlete_id,
        school_name,
        activity_date,
        created_at
      `
      )
      .eq("coach_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const activity =
      activitiesData?.map((a) => ({
        id: a.id,
        type: a.activity_type,
        description: a.notes || `${a.activity_type} activity`,
        athleteId: a.athlete_id,
        athleteName: "Unknown",
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

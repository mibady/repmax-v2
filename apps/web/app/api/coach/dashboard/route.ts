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
      .select("id, full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Get coach record
    const { data: coach } = await supabase
      .from("coaches")
      .select("id, school_name, division, conference, title")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 }
      );
    }

    // Get shortlisted athletes (acts as the coach's "roster"/tracked athletes)
    const { data: shortlistData } = await supabase
      .from("shortlists")
      .select(
        `
        id,
        priority,
        notes,
        created_at,
        athlete:athletes(
          id,
          primary_position,
          class_year,
          gpa,
          offers_count,
          profile_id,
          profile:profiles!inner(
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq("coach_id", coach.id)
      .order("created_at", { ascending: false });

    // Get committed athlete IDs from offers table
    const athleteIds = (shortlistData || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((s: any) => s.athlete?.id)
      .filter(Boolean);

    let committedAthleteIds = new Set<string>();
    if (athleteIds.length > 0) {
      const { data: committedOffers } = await supabase
        .from("offers")
        .select("athlete_id")
        .in("athlete_id", athleteIds)
        .eq("committed", true);

      committedAthleteIds = new Set(
        (committedOffers || []).map((o) => o.athlete_id)
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roster = (shortlistData || []).map((s: any) => {
      const a = s.athlete;
      const p = Array.isArray(a?.profile) ? a.profile[0] : a?.profile;
      const athleteId = a?.id || s.id;
      return {
        id: athleteId,
        name: p?.full_name || "Unknown",
        position: a?.primary_position || "ATH",
        classYear: a?.class_year || 2026,
        gpa: a?.gpa ? Number(a.gpa) : null,
        offers: a?.offers_count || 0,
        status: committedAthleteIds.has(athleteId) ? "committed" : "active",
        avatarUrl: p?.avatar_url || null,
      };
    });

    // Get coach tasks
    const { data: taskData } = await supabase
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
        created_at
      `
      )
      .eq("coach_id", coach.id)
      .order("created_at", { ascending: false });

    // Resolve athlete names for tasks that reference an athlete
    const taskAthleteIds = (taskData || [])
      .map((t) => t.athlete_id)
      .filter(Boolean) as string[];

    let athleteNameMap: Record<string, string> = {};
    if (taskAthleteIds.length > 0) {
      const { data: taskAthletes } = await supabase
        .from("athletes")
        .select("id, profile:profiles!inner(full_name)")
        .in("id", taskAthleteIds);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      athleteNameMap = (taskAthletes || []).reduce((map: Record<string, string>, a: any) => {
        const p = Array.isArray(a.profile) ? a.profile[0] : a.profile;
        map[a.id] = p?.full_name || "Unknown";
        return map;
      }, {});
    }

    const tasks = (taskData || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      dueDate: t.due_date,
      priority: t.priority,
      status: t.status,
      athleteId: t.athlete_id,
      athleteName: t.athlete_id ? (athleteNameMap[t.athlete_id] || null) : null,
      createdAt: t.created_at,
    }));

    // Get recent messages as activity
    const { data: recentMessages } = await supabase
      .from("messages")
      .select(
        `
        id,
        subject,
        body,
        read,
        created_at,
        sender:profiles!sender_id(
          full_name,
          avatar_url
        )
      `
      )
      .eq("recipient_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activity = (recentMessages || []).map((m: any) => {
      const sender = Array.isArray(m.sender) ? m.sender[0] : m.sender;
      return {
        id: m.id,
        type: "message",
        description: m.subject || "New message",
        athleteName: sender?.full_name || "Unknown",
        timestamp: m.created_at,
      };
    });

    // Calculate metrics
    const committedCount = roster.filter((r) => r.status === "committed").length;
    const pendingTaskCount = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;

    const metrics = {
      totalAthletes: roster.length,
      activeAthletes: roster.length - committedCount,
      committedAthletes: committedCount,
      pendingTasks: pendingTaskCount,
      totalOffers: roster.reduce((sum, r) => sum + r.offers, 0),
    };

    return NextResponse.json({
      coach: {
        name: profile.full_name,
        school: coach.school_name,
        division: coach.division,
        conference: coach.conference,
        title: coach.title,
        avatarUrl: profile.avatar_url,
      },
      roster,
      tasks,
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

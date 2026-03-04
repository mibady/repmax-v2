import { NextResponse } from "next/server";
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
      .select("id, full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Find this coach's team via coach_profile_id
    const { data: team } = await supabase
      .from("teams")
      .select("id, name, school_name, city, state, zone")
      .eq("coach_profile_id", profile.id)
      .single();

    // Get roster from team_rosters if team exists
    let roster: object[] = [];
    if (team) {
      const { data: rosterRows } = await supabase
        .from("team_rosters")
        .select(`
          id,
          added_at,
          priority,
          notes,
          athlete:athletes(
            id,
            primary_position,
            class_year,
            gpa,
            offers_count,
            profile:profiles(full_name, avatar_url)
          )
        `)
        .eq("team_id", team.id)
        .order("added_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roster = (rosterRows || []).map((row: any) => {
        const a = row.athlete;
        const p = Array.isArray(a?.profile) ? a.profile[0] : a?.profile;
        return {
          id: a?.id || row.id,
          name: p?.full_name || "Unknown",
          position: a?.primary_position || "ATH",
          classYear: a?.class_year || 2026,
          gpa: a?.gpa ? Number(a.gpa) : null,
          offers: a?.offers_count || 0,
          avatarUrl: p?.avatar_url || null,
          rosterEntryId: row.id,
          priority: row.priority || "medium",
          notes: row.notes || "",
        };
      });
    }

    // Get tasks via coaches.id FK
    const { data: coachRecord } = await supabase
      .from("coaches")
      .select("id, school_name, division, conference, title")
      .eq("profile_id", profile.id)
      .single();

    let tasks: Array<{ status: string; [key: string]: unknown }> = [];
    if (coachRecord) {
      const { data: taskData } = await supabase
        .from("coach_tasks")
        .select("id, title, description, due_date, priority, status, athlete_id, created_at")
        .eq("coach_id", coachRecord.id)
        .order("created_at", { ascending: false });
      tasks = taskData || [];
    }

    // Get recent messages as activity feed (REQUIRED — coach page calls activity.slice())
    const { data: recentMessages } = await supabase
      .from("messages")
      .select(`
        id, subject, content, created_at, sender_id,
        sender:profiles!sender_id(full_name)
      `)
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false })
      .limit(10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activity = (recentMessages || []).map((m: any) => {
      const sender = Array.isArray(m.sender) ? m.sender[0] : m.sender;
      return {
        id: m.id,
        type: "message",
        description: m.subject || m.content?.substring(0, 80) || "New message",
        athleteName: sender?.full_name || "Unknown",
        timestamp: m.created_at,
      };
    });

    const metrics = {
      totalAthletes: roster.length,
      pendingTasks: tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length,
    };

    return NextResponse.json({
      coach: {
        name: profile.full_name,
        school: coachRecord?.school_name || team?.school_name || "",
        division: coachRecord?.division || null,
        conference: coachRecord?.conference || null,
        title: coachRecord?.title || "Head Coach",
        avatarUrl: profile.avatar_url,
        team: team ? {
          id: team.id,
          name: team.name,
          school: team.school_name,
          city: team.city,
          state: team.state,
          zone: team.zone,
        } : null,
      },
      roster,
      tasks,
      activity,
      metrics,
    });
  } catch (error) {
    console.error("Coach dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

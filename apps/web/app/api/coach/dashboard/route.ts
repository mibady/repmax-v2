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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roster = (shortlistData || []).map((s: any) => {
      const a = s.athlete;
      const p = Array.isArray(a?.profile) ? a.profile[0] : a?.profile;
      return {
        id: a?.id || s.id,
        name: p?.full_name || "Unknown",
        position: a?.primary_position || "ATH",
        classYear: a?.class_year || 2026,
        gpa: a?.gpa ? Number(a.gpa) : null,
        offers: a?.offers_count || 0,
        priority: s.priority || "medium",
        notes: s.notes,
        avatarUrl: p?.avatar_url || null,
        addedAt: s.created_at,
      };
    });

    // Get unread messages count
    const { count: messagesUnread } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("read", false);

    // Get recent messages (last 10)
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
    const metrics = {
      totalAthletes: roster.length,
      highPriority: roster.filter((r) => r.priority === "high" || r.priority === "top").length,
      totalOffers: roster.reduce((sum, r) => sum + r.offers, 0),
      messagesUnread: messagesUnread || 0,
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

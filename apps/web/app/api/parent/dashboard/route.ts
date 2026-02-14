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

    // Get linked athlete(s) for this parent
    const { data: links, error: linksError } = await supabase
      .from("parent_links")
      .select("athlete_profile_id")
      .eq("parent_profile_id", profile.id);

    if (linksError) {
      console.error("Error fetching parent links:", linksError);
    }

    let childProfile = null;
    let metrics = {
      profileViews: 0,
      profileViewsChange: 0,
      coachMessages: 0,
      schoolsTracking: 0,
      upcomingDeadlines: 0,
    };
    let schools: Array<{
      id: string;
      name: string;
      status: string;
      statusColor: string;
    }> = [];
    let activity: Array<{
      id: string;
      type: string;
      message: string;
      time: string;
      timestamp: string;
    }> = [];
    const calendarEvents: Array<{
      id: string;
      date: string;
      title: string;
      type: string;
    }> = [];

    if (links && links.length > 0) {
      const athleteProfileId = links[0].athlete_profile_id;

      // Get athlete data with profile info
      const { data: athlete } = await supabase
        .from("athletes")
        .select(
          `
          id,
          primary_position,
          class_year,
          gpa,
          high_school,
          profile:profiles!inner(
            full_name,
            avatar_url
          )
        `
        )
        .eq("profile_id", athleteProfileId)
        .single();

      if (athlete) {
        const p = Array.isArray(athlete.profile)
          ? athlete.profile[0]
          : athlete.profile;
        childProfile = {
          id: athlete.id,
          name:
            (p as { full_name?: string })?.full_name?.split(" ")[0] ||
            "Athlete",
          position: athlete.primary_position || "ATH",
          classYear: athlete.class_year || 2026,
          gpa: athlete.gpa ? Number(athlete.gpa) : null,
          school: athlete.high_school || "High School",
          avatarUrl: (p as { avatar_url?: string })?.avatar_url || null,
        };

        // Get profile views count
        const { count: viewsCount } = await supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("athlete_id", athlete.id);

        // Get shortlists (schools tracking this athlete)
        const { count: shortlistCount } = await supabase
          .from("shortlists")
          .select("*", { count: "exact", head: true })
          .eq("athlete_id", athlete.id);

        // Get unread messages for the athlete
        const { count: messagesCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", athleteProfileId)
          .eq("read", false);

        metrics = {
          profileViews: viewsCount || 0,
          profileViewsChange: 0,
          coachMessages: messagesCount || 0,
          schoolsTracking: shortlistCount || 0,
          upcomingDeadlines: 0,
        };

        // Get schools showing interest (from shortlists via coaches)
        const { data: shortlistData } = await supabase
          .from("shortlists")
          .select(
            `
            id,
            coach:coaches!inner(
              school_name
            )
          `
          )
          .eq("athlete_id", athlete.id)
          .limit(5);

        if (shortlistData) {
          schools = shortlistData.map((s, index) => {
            const coach = s.coach as { school_name?: string } | null;
            return {
              id: String(index),
              name: coach?.school_name || "Unknown School",
              status: "Following",
              statusColor: "text-blue-400 bg-blue-400/10",
            };
          });
        }

        // Get recent activity (profile views)
        const { data: recentViews } = await supabase
          .from("profile_views")
          .select("id, viewer_school, created_at, section_viewed")
          .eq("athlete_id", athlete.id)
          .order("created_at", { ascending: false })
          .limit(4);

        if (recentViews) {
          activity = recentViews.map((v) => {
            const viewedAt = new Date(v.created_at);
            const now = new Date();
            const diffHours = Math.floor(
              (now.getTime() - viewedAt.getTime()) / (1000 * 60 * 60)
            );
            const time =
              diffHours < 24
                ? `${diffHours} hours ago`
                : `${Math.floor(diffHours / 24)} days ago`;

            return {
              id: v.id,
              type: "view" as const,
              message: `${v.viewer_school || "A coach"} viewed ${v.section_viewed || "profile"}`,
              time,
              timestamp: v.created_at,
            };
          });
        }
      }
    }

    return NextResponse.json({
      childProfile,
      metrics,
      schools,
      activity,
      calendarEvents,
    });
  } catch (error) {
    console.error("Parent dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get linked athlete(s) for this parent
    const { data: links, error: linksError } = await supabase
      .from("parent_athlete_links")
      .select("athlete_id")
      .eq("parent_id", user.id)
      .eq("status", "active");

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
    let calendarEvents: Array<{
      id: string;
      date: string;
      title: string;
      type: string;
    }> = [];

    if (links && links.length > 0) {
      const athleteId = links[0].athlete_id;

      // Get athlete profile
      const { data: athlete } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          athlete_profiles!inner (
            position,
            class_year,
            gpa,
            school
          )
        `
        )
        .eq("id", athleteId)
        .single();

      if (athlete && athlete.athlete_profiles) {
        const ap = Array.isArray(athlete.athlete_profiles)
          ? athlete.athlete_profiles[0]
          : athlete.athlete_profiles;
        childProfile = {
          id: athlete.id,
          name: athlete.full_name?.split(" ")[0] || "Athlete",
          position: ap.position || "ATH",
          classYear: ap.class_year || 2026,
          gpa: ap.gpa,
          school: ap.school || "High School",
          avatarUrl: null,
        };
      }

      // Get profile views count
      const { count: viewsCount } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("athlete_id", athleteId);

      // Get shortlists (schools tracking)
      const { count: shortlistCount } = await supabase
        .from("shortlist_athletes")
        .select("*", { count: "exact", head: true })
        .eq("athlete_id", athleteId);

      // Get unread messages
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", athleteId)
        .eq("read", false);

      metrics = {
        profileViews: viewsCount || 0,
        profileViewsChange: 12, // TODO: Calculate actual change
        coachMessages: messagesCount || 0,
        schoolsTracking: shortlistCount || 0,
        upcomingDeadlines: 2, // TODO: Calculate from calendar
      };

      // Get schools showing interest (from shortlists)
      const { data: shortlists } = await supabase
        .from("shortlist_athletes")
        .select(
          `
          shortlist_id,
          shortlists!inner (
            recruiter_id,
            name,
            profiles!recruiter_id (
              recruiter_profiles!inner (
                school
              )
            )
          )
        `
        )
        .eq("athlete_id", athleteId)
        .limit(5);

      if (shortlists) {
        schools = shortlists.map((s, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const shortlistData = s.shortlists as any;
          const school =
            shortlistData?.profiles?.recruiter_profiles?.[0]?.school ||
            "Unknown School";
          return {
            id: String(index),
            name: school,
            status: "Following" as const,
            statusColor: "text-blue-400 bg-blue-400/10",
          };
        });
      }

      // Get recent activity (profile views + messages)
      const { data: recentViews } = await supabase
        .from("profile_views")
        .select("id, viewer_school, viewed_at, section_viewed")
        .eq("athlete_id", athleteId)
        .order("viewed_at", { ascending: false })
        .limit(4);

      if (recentViews) {
        activity = recentViews.map((v) => {
          const viewedAt = new Date(v.viewed_at);
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
            timestamp: v.viewed_at,
          };
        });
      }

      // Get calendar events (recruiting events for athlete's zone)
      const { data: events } = await supabase
        .from("recruiting_events")
        .select("id, title, event_date, event_type")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);

      if (events) {
        calendarEvents = events.map((e) => ({
          id: e.id,
          date: e.event_date,
          title: e.title,
          type: (e.event_type || "other") as "visit" | "deadline" | "camp",
        }));
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

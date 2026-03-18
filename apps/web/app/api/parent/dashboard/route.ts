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
    let academic = {
      gpa: null as number | null,
      satScore: null as number | null,
      actScore: null as number | null,
      coreCourses: { completed: 0, required: 16 },
      clearinghouseStatus: "not_started" as string,
    };
    const alerts: Array<{
      id: string;
      type: "urgent" | "warning" | "info";
      message: string;
      action?: string;
      actionUrl?: string;
    }> = [];

    if (links && links.length > 0) {
      const athleteProfileId = links[0].athlete_profile_id;

      // Get athlete data with profile info — include sat_score and act_score
      const { data: athlete } = await supabase
        .from("athletes")
        .select(
          `
          id,
          primary_position,
          class_year,
          gpa,
          sat_score,
          act_score,
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
          fullName: (p as { full_name?: string })?.full_name || "Athlete",
          position: athlete.primary_position || "ATH",
          classYear: athlete.class_year || 2026,
          gpa: athlete.gpa ? Number(athlete.gpa) : null,
          school: athlete.high_school || "High School",
          avatarUrl: (p as { avatar_url?: string })?.avatar_url || null,
        };

        // Academic health
        academic = {
          gpa: athlete.gpa ? Number(athlete.gpa) : null,
          satScore: athlete.sat_score ? Number(athlete.sat_score) : null,
          actScore: athlete.act_score ? Number(athlete.act_score) : null,
          coreCourses: { completed: 0, required: 16 },
          clearinghouseStatus: "not_started",
        };

        // Generate alerts based on profile gaps
        if (!athlete.gpa) {
          alerts.push({
            id: "alert-gpa",
            type: "urgent",
            message: "GPA not set — NCAA eligibility requires a minimum core GPA",
            action: "Update Profile",
            actionUrl: "/athlete/profile",
          });
        }
        if (!athlete.sat_score && !athlete.act_score) {
          alerts.push({
            id: "alert-test",
            type: "warning",
            message: "No SAT/ACT score on file — required for D1/D2 official visits",
            action: "Add Score",
            actionUrl: "/athlete/profile",
          });
        }
        if (!athlete.primary_position || athlete.primary_position === "ATH") {
          alerts.push({
            id: "alert-position",
            type: "info",
            message: "Primary position not specified — coaches filter by position",
            action: "Update Profile",
            actionUrl: "/athlete/profile",
          });
        }

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

        // Get schools showing interest with status from crm_pipeline
        const { data: shortlistData } = await supabase
          .from("shortlists")
          .select(
            `
            id,
            coach:coaches!inner(
              id,
              school_name
            )
          `
          )
          .eq("athlete_id", athlete.id)
          .limit(8);

        if (shortlistData) {
          // Check crm_pipeline for status on each school's coach
          const coachIds = shortlistData
            .map((s) => {
              const coach = s.coach as { id?: string } | null;
              return coach?.id;
            })
            .filter(Boolean) as string[];

          let pipelineMap: Record<string, string> = {};
          if (coachIds.length > 0) {
            const { data: pipelineData } = await supabase
              .from("crm_pipeline")
              .select("recruiter_profile_id, stage")
              .eq("athlete_id", athlete.id)
              .in("recruiter_profile_id", coachIds);

            if (pipelineData) {
              pipelineMap = Object.fromEntries(
                pipelineData.map((p) => [p.recruiter_profile_id, p.stage])
              );
            }
          }

          schools = shortlistData.map((s, index) => {
            const coach = s.coach as { id?: string; school_name?: string } | null;
            const stage = coach?.id ? pipelineMap[coach.id] : undefined;

            let status = "Evaluating";
            let statusColor = "text-slate-400 bg-slate-400/10";

            if (stage === "offer" || stage === "committed") {
              status = "Offered";
              statusColor = "text-green-400 bg-green-400/10";
            } else if (stage === "contact" || stage === "visited") {
              status = "In Contact";
              statusColor = "text-blue-400 bg-blue-400/10";
            } else if (stage === "evaluation" || stage === "prospect") {
              status = "Evaluating";
              statusColor = "text-yellow-400 bg-yellow-400/10";
            }

            return {
              id: String(index),
              name: coach?.school_name || "Unknown School",
              status,
              statusColor,
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

        // Add alerts for low activity
        if ((viewsCount || 0) === 0) {
          alerts.push({
            id: "alert-views",
            type: "info",
            message: "No profile views yet — make sure the profile is complete and shared with coaches",
          });
        }
      }
    } else {
      alerts.push({
        id: "alert-no-link",
        type: "urgent",
        message: "No athlete linked to your account — link your child's profile to see their recruiting data",
        action: "Link Athlete",
        actionUrl: "/parent/link",
      });
    }

    return NextResponse.json({
      childProfile,
      metrics,
      schools,
      activity,
      calendarEvents,
      academic,
      alerts,
    });
  } catch (error) {
    console.error("Parent dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FBS_PERIODS } from "@/lib/data/ncaa-calendar";

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
    let offers: Array<{
      id: string;
      schoolName: string;
      division: string;
      scholarshipType: string;
      offerDate: string;
      committed: boolean;
    }> = [];
    let athleteEvents: Array<{
      id: string;
      title: string;
      eventType: string;
      eventDate: string;
      eventTime: string | null;
      location: string | null;
      priority: string;
      description: string | null;
    }> = [];
    let metrics = {
      profileViews: 0,
      profileViewsChange: 0,
      coachMessages: 0,
      schoolsTracking: 0,
      upcomingDeadlines: 0,
      offersCount: 0,
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

        // Academic health — derive core courses from GPA, clearinghouse from data presence
        const gpaNum = athlete.gpa ? Number(athlete.gpa) : null;
        const hasTestScores = !!(athlete.sat_score || athlete.act_score);
        academic = {
          gpa: gpaNum,
          satScore: athlete.sat_score ? Number(athlete.sat_score) : null,
          actScore: athlete.act_score ? Number(athlete.act_score) : null,
          coreCourses: {
            completed: gpaNum && gpaNum >= 3.5 ? 12 : gpaNum && gpaNum >= 2.5 ? 8 : 0,
            required: 16,
          },
          clearinghouseStatus: (gpaNum || hasTestScores) ? "in_progress" : "not_started",
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

        // Parallelize independent count queries
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [
          { count: viewsCount },
          { count: recentViewCount },
          { count: prevViewCount },
          { count: shortlistCount },
          { count: messagesCount },
        ] = await Promise.all([
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", athlete.id),
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", athlete.id)
            .gte("created_at", thirtyDaysAgo.toISOString()),
          supabase
            .from("profile_views")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", athlete.id)
            .gte("created_at", sixtyDaysAgo.toISOString())
            .lt("created_at", thirtyDaysAgo.toISOString()),
          supabase
            .from("shortlists")
            .select("*", { count: "exact", head: true })
            .eq("athlete_id", athlete.id),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", athleteProfileId)
            .eq("read", false),
        ]);

        const profileViewsChange =
          prevViewCount && prevViewCount > 0
            ? Math.round(
                (((recentViewCount || 0) - prevViewCount) / prevViewCount) * 100
              )
            : (recentViewCount || 0) > 0
              ? 100
              : 0;

        // Upcoming NCAA deadlines (dead periods starting in next 90 days)
        const todayStr = new Date().toISOString().split("T")[0];
        const ninetyDaysOut = new Date();
        ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);
        const ninetyStr = ninetyDaysOut.toISOString().split("T")[0];
        const upcomingDeadlineCount = FBS_PERIODS.filter(
          (p) =>
            p.type === "dead" &&
            p.start >= todayStr &&
            p.start <= ninetyStr
        ).length;

        metrics = {
          profileViews: viewsCount || 0,
          profileViewsChange,
          coachMessages: messagesCount || 0,
          schoolsTracking: shortlistCount || 0,
          upcomingDeadlines: upcomingDeadlineCount,
          offersCount: 0,
        };

        // Get schools + recent activity + offers + athlete events in parallel
        const todayDate = new Date().toISOString().split("T")[0];
        const [
          { data: shortlistData },
          { data: recentViews },
          { data: recentShortlists },
          { data: recentMessages },
          { data: offersData },
          { data: athleteEventsData },
        ] = await Promise.all([
          supabase
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
            .limit(8),
          supabase
            .from("profile_views")
            .select("id, viewer_school, created_at, section_viewed")
            .eq("athlete_id", athlete.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("shortlists")
            .select("id, created_at, coach:coaches!inner(school_name)")
            .eq("athlete_id", athlete.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("messages")
            .select("id, created_at, subject, body")
            .eq("recipient_id", athleteProfileId)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("offers")
            .select("id, school_name, division, scholarship_type, offer_date, committed")
            .eq("athlete_id", athlete.id)
            .order("offer_date", { ascending: false }),
          supabase
            .from("athlete_events")
            .select("id, title, event_type, event_date, event_time, location, priority, description")
            .eq("athlete_id", athlete.id)
            .gte("event_date", todayDate)
            .order("event_date", { ascending: true })
            .limit(10),
        ]);

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
              .select("recruiter_id, stage")
              .eq("athlete_id", athlete.id)
              .in("recruiter_id", coachIds);

            if (pipelineData) {
              pipelineMap = Object.fromEntries(
                pipelineData.map((p) => [p.recruiter_id, p.stage])
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
            } else if (stage === "contact" || stage === "visited" || stage === "visit_scheduled") {
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

        // Helper: relative time display
        function relativeTime(dateStr: string): string {
          const d = new Date(dateStr);
          const diffMs = Date.now() - d.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours < 1) return "just now";
          if (diffHours < 24) return `${diffHours} hours ago`;
          const diffDays = Math.floor(diffHours / 24);
          if (diffDays === 1) return "yesterday";
          if (diffDays < 7) return `${diffDays} days ago`;
          return `${Math.floor(diffDays / 7)} weeks ago`;
        }

        // Merge all activity types
        const allActivity: typeof activity = [];

        if (recentViews) {
          for (const v of recentViews) {
            allActivity.push({
              id: v.id,
              type: "view",
              message: `${v.viewer_school || "A coach"} viewed ${v.section_viewed || "profile"}`,
              time: relativeTime(v.created_at),
              timestamp: v.created_at,
            });
          }
        }

        if (recentShortlists) {
          for (const s of recentShortlists) {
            const coach = s.coach as { school_name?: string } | null;
            allActivity.push({
              id: s.id,
              type: "shortlist",
              message: `${coach?.school_name || "A program"} added to shortlist`,
              time: relativeTime(s.created_at),
              timestamp: s.created_at,
            });
          }
        }

        if (recentMessages) {
          for (const m of recentMessages) {
            const text = m.subject || m.body || "";
            const preview = text
              ? String(text).slice(0, 50) +
                (String(text).length > 50 ? "…" : "")
              : "New message";
            allActivity.push({
              id: m.id,
              type: "message",
              message: preview,
              time: relativeTime(m.created_at),
              timestamp: m.created_at,
            });
          }
        }

        // Sort by most recent, take top 10
        activity = allActivity
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          .slice(0, 10);

        // Populate calendar events from NCAA periods
        const calClassYear = athlete.class_year || 2026;
        for (const period of FBS_PERIODS) {
          if (period.end >= todayStr) {
            calendarEvents.push({
              id: `ncaa-${period.start}`,
              date: period.start,
              title: period.label,
              type:
                period.type === "dead"
                  ? "deadline"
                  : period.type === "contact"
                    ? "visit"
                    : "camp",
            });
          }
        }
        calendarEvents.push(
          {
            id: "signing-early",
            date: `${calClassYear - 1}-12-18`,
            title: "Early Signing Period Opens",
            type: "deadline",
          },
          {
            id: "signing-regular",
            date: `${calClassYear}-02-04`,
            title: "National Signing Day",
            type: "deadline",
          }
        );
        calendarEvents.sort((a, b) => a.date.localeCompare(b.date));

        // Map offers — deduplicate by school_name (keep most recent per school)
        const offersBySchool = new Map<string, typeof offers[0]>();
        for (const o of offersData || []) {
          const rec = o as Record<string, unknown>;
          const schoolName = rec.school_name as string;
          if (!offersBySchool.has(schoolName)) {
            offersBySchool.set(schoolName, {
              id: rec.id as string,
              schoolName,
              division: rec.division as string,
              scholarshipType: rec.scholarship_type as string,
              offerDate: rec.offer_date as string,
              committed: rec.committed as boolean,
            });
          }
        }
        offers = Array.from(offersBySchool.values());

        // Map athlete events
        athleteEvents = (athleteEventsData || []).map((e: Record<string, unknown>) => ({
          id: e.id as string,
          title: e.title as string,
          eventType: e.event_type as string,
          eventDate: e.event_date as string,
          eventTime: e.event_time as string | null,
          location: e.location as string | null,
          priority: e.priority as string,
          description: e.description as string | null,
        }));

        metrics.offersCount = offers.length;

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
      offers,
      athleteEvents,
    });
  } catch (error) {
    console.error("Parent dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

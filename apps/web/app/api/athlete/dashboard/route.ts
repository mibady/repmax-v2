import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get athlete data
    const { data: athlete } = await supabase
      .from("athletes")
      .select(`
        id,
        high_school,
        city,
        state,
        class_year,
        primary_position,
        height_inches,
        weight_lbs,
        forty_yard_time,
        gpa,
        zone
      `)
      .eq("profile_id", profile.id)
      .single();

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    // Parse name
    const nameParts = (profile.full_name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Build profile response
    const athleteProfile = {
      id: athlete.id,
      name: profile.full_name || "Unknown",
      firstName,
      lastName,
      classYear: athlete.class_year || new Date().getFullYear() + 1,
      position: athlete.primary_position || "ATH",
      school: athlete.high_school || "",
      city: athlete.city || "",
      state: athlete.state || "",
      zone: athlete.zone || "Unknown",
      heightInches: athlete.height_inches,
      weightLbs: athlete.weight_lbs,
      fortyYardDash: athlete.forty_yard_time,
      gpa: athlete.gpa,
      avatarUrl: profile.avatar_url,
      starRating: 3, // Default - would come from rankings table
    };

    // Get profile views (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: viewsThisWeek } = await supabase
      .from("profile_views")
      .select("*", { count: "exact", head: true })
      .eq("athlete_id", athlete.id)
      .gte("viewed_at", sevenDaysAgo.toISOString());

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { count: viewsLastWeek } = await supabase
      .from("profile_views")
      .select("*", { count: "exact", head: true })
      .eq("athlete_id", athlete.id)
      .gte("viewed_at", fourteenDaysAgo.toISOString())
      .lt("viewed_at", sevenDaysAgo.toISOString());

    const profileViewsChange =
      viewsLastWeek && viewsLastWeek > 0
        ? Math.round(
            (((viewsThisWeek || 0) - viewsLastWeek) / viewsLastWeek) * 100
          )
        : 0;

    // Get shortlist count (coaches who have this athlete on their shortlist)
    const { data: shortlists, count: shortlistCount } = await supabase
      .from("shortlists")
      .select(
        `
        id,
        coach:coaches(
          id,
          school_name,
          profile:profiles(
            full_name,
            avatar_url
          )
        )
      `,
        { count: "exact" }
      )
      .eq("athlete_id", athlete.id)
      .limit(5);

    // Get offers count
    const { count: offersCount } = await supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("athlete_id", athlete.id);

    // Get unread messages count
    const { count: messagesUnread } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("is_read", false);

    // Build stats
    const stats = {
      profileViews: viewsThisWeek || 0,
      profileViewsChange,
      shortlistCount: shortlistCount || 0,
      offersCount: offersCount || 0,
      messagesUnread: messagesUnread || 0,
    };

    // Build shortlist coaches list
    const shortlistCoaches = (shortlists || [])
      .filter((s) => s.coach)
      .map((s) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coach = s.coach as any;
        const profile = Array.isArray(coach.profile) ? coach.profile[0] : coach.profile;
        return {
          id: coach.id,
          name: profile?.full_name || "Unknown Coach",
          school: coach.school_name || "",
          avatarUrl: profile?.avatar_url || null,
        };
      });

    // Get upcoming calendar events (mock for now - would need events table)
    // These represent NCAA recruiting calendar events
    const now = new Date();
    const calendarEvents = [
      {
        id: "1",
        title: "National Signing Day",
        date: getNextDateForMonth(now, 2, 7), // February 7
        type: "signing" as const,
        priority: "high" as const,
      },
      {
        id: "2",
        title: "Spring Evaluation Period",
        date: getNextDateForMonth(now, 4, 15), // April 15
        type: "camp" as const,
      },
      {
        id: "3",
        title: "Dead Period Ends",
        date: getNextDateForMonth(now, 1, 15), // January 15
        type: "other" as const,
      },
    ]
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    return NextResponse.json({
      profile: athleteProfile,
      stats,
      shortlistCoaches,
      calendarEvents,
    });
  } catch (error) {
    console.error("Error in athlete dashboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to get next occurrence of a month/day
function getNextDateForMonth(
  from: Date,
  month: number,
  day: number
): string {
  const year = from.getFullYear();
  let date = new Date(year, month - 1, day);

  if (date < from) {
    date = new Date(year + 1, month - 1, day);
  }

  return date.toISOString().split("T")[0];
}

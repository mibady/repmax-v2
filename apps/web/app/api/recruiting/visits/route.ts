import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/recruiting/visits - Get campus visits for the current coach
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.role !== "coach" && profile.role !== "recruiter") {
      return NextResponse.json(
        { error: "Only coaches can view visits" },
        { status: 403 }
      );
    }

    // Get coach
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 }
      );
    }

    // Get shortlist entries with visit_scheduled status
    const { data: shortlistVisits, error: shortlistError } = await supabase
      .from("shortlists")
      .select(`
        id,
        notes,
        priority,
        pipeline_status,
        created_at,
        updated_at,
        athlete:athletes(
          id,
          primary_position,
          star_rating,
          class_year,
          high_school,
          state,
          height_inches,
          weight_lbs,
          profile:profiles(full_name, avatar_url)
        )
      `)
      .eq("coach_id", coach.id)
      .eq("pipeline_status", "visit_scheduled")
      .order("updated_at", { ascending: false });

    if (shortlistError) {
      console.error("Shortlist query error:", shortlistError);
      return NextResponse.json({ error: shortlistError.message }, { status: 500 });
    }

    // Transform shortlist data to visits format
    const visits = shortlistVisits?.map((entry, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const athlete = entry.athlete as any;
      // Generate mock dates for now (in a real app, this would come from a visits table)
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() + index * 2 + 1);

      return {
        id: entry.id,
        athleteId: athlete?.id,
        athleteName: athlete?.profile?.full_name || "Unknown",
        position: athlete?.primary_position || "ATH",
        stars: athlete?.star_rating || 0,
        avatar: athlete?.profile?.avatar_url,
        classYear: athlete?.class_year,
        highSchool: athlete?.high_school,
        state: athlete?.state,
        visitType: entry.priority === "top" ? "official" : "unofficial",
        status: index === 0 ? "confirmed" : "pending",
        date: visitDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: `${10 + (index % 6)}:00 ${(10 + (index % 6)) >= 12 ? "PM" : "AM"}`,
        details: entry.notes || "",
        rawDate: visitDate.toISOString(),
      };
    }) || [];

    // Calculate stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthVisits = visits.filter((v) => {
      const d = new Date(v.rawDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const stats = {
      totalVisits: monthVisits.length,
      officialVisits: monthVisits.filter((v) => v.visitType === "official").length,
      pendingVisits: monthVisits.filter((v) => v.status === "pending").length,
      winRate: monthVisits.length > 0 ? Math.round((monthVisits.filter((v) => v.status === "confirmed").length / monthVisits.length) * 100) : 0,
    };

    // Create calendar events from visits
    const calendarEvents = visits.map((v) => {
      const d = new Date(v.rawDate);
      return {
        day: d.getDate(),
        title: `${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(":00", "")} ${v.athleteName.split(" ").map((n: string) => n[0]).join(".")}`,
        type: v.visitType,
        time: v.time,
        athleteId: v.athleteId,
      };
    });

    return NextResponse.json({
      visits,
      stats,
      calendarEvents,
    });
  } catch (error) {
    console.error("Visits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

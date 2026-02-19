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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get coach info
    const { data: coach } = await supabase
      .from("coaches")
      .select("id, school_name")
      .eq("profile_id", profile.id)
      .single();

    if (!coach) {
      return NextResponse.json(
        { error: "Only coaches can view reports" },
        { status: 403 }
      );
    }

    // Get pipeline funnel data from shortlists
    const { data: shortlists } = await supabase
      .from("shortlists")
      .select("pipeline_status, athlete_id")
      .eq("coach_id", coach.id);

    // Count pipeline stages
    const pipelineCounts = {
      identified: 0,
      contacted: 0,
      evaluating: 0,
      visit_scheduled: 0,
      offered: 0,
      committed: 0,
    };

    (shortlists || []).forEach((item) => {
      const status = item.pipeline_status as keyof typeof pipelineCounts;
      if (status && pipelineCounts[status] !== undefined) {
        pipelineCounts[status]++;
      }
    });

    // Calculate conversion rates
    const totalPipeline = Object.values(pipelineCounts).reduce((a, b) => a + b, 0);
    const funnel = [
      {
        stage: "Identified",
        count: pipelineCounts.identified,
        conversionRate: totalPipeline > 0 ? Math.round((pipelineCounts.identified / totalPipeline) * 100) : 0,
      },
      {
        stage: "Contacted",
        count: pipelineCounts.contacted,
        conversionRate: pipelineCounts.identified > 0
          ? Math.round((pipelineCounts.contacted / pipelineCounts.identified) * 100)
          : 0,
      },
      {
        stage: "Evaluating",
        count: pipelineCounts.evaluating,
        conversionRate: pipelineCounts.contacted > 0
          ? Math.round((pipelineCounts.evaluating / pipelineCounts.contacted) * 100)
          : 0,
      },
      {
        stage: "Visited",
        count: pipelineCounts.visit_scheduled,
        conversionRate: pipelineCounts.evaluating > 0
          ? Math.round((pipelineCounts.visit_scheduled / pipelineCounts.evaluating) * 100)
          : 0,
      },
      {
        stage: "Offered",
        count: pipelineCounts.offered,
        conversionRate: pipelineCounts.visit_scheduled > 0
          ? Math.round((pipelineCounts.offered / pipelineCounts.visit_scheduled) * 100)
          : 0,
      },
      {
        stage: "Committed",
        count: pipelineCounts.committed,
        conversionRate: pipelineCounts.offered > 0
          ? Math.round((pipelineCounts.committed / pipelineCounts.offered) * 100)
          : 0,
      },
    ];

    // Get communication stats (messages sent/received this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: messagesThisWeek } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .gte("created_at", oneWeekAgo.toISOString());

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { count: messagesLastWeek } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", oneWeekAgo.toISOString());

    const communicationChange = messagesLastWeek && messagesLastWeek > 0
      ? Math.round(((messagesThisWeek || 0) - messagesLastWeek) / messagesLastWeek * 100)
      : 0;

    // Get visits this week (shortlists with visit_scheduled status)
    const visitsThisWeek = pipelineCounts.visit_scheduled;

    // Get zone coverage from athletes in shortlist
    const athleteIds = (shortlists || []).map((s) => s.athlete_id);

    let zoneCoverage: { zone: string; prospects: number }[] = [];

    if (athleteIds.length > 0) {
      const { data: athletes } = await supabase
        .from("athletes")
        .select("zone")
        .in("id", athleteIds);

      // Count by zone
      const zoneCounts: Record<string, number> = {};
      (athletes || []).forEach((athlete) => {
        const zone = athlete.zone || "Unknown";
        zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      });

      // Standard zones
      const standardZones = ["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"];
      zoneCoverage = standardZones.map((zone) => ({
        zone,
        prospects: zoneCounts[zone] || 0,
      }));
    } else {
      // Default empty zones
      zoneCoverage = ["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"].map((zone) => ({
        zone,
        prospects: 0,
      }));
    }

    // Calculate max for percentage heights
    const maxProspects = Math.max(...zoneCoverage.map((z) => z.prospects), 1);

    // Staff activity - for now just return the current user as staff
    // In a real app, this would query team members
    const staffActivity = [
      {
        id: profile.id,
        name: "You",
        region: "All Regions",
        rank: 1,
        calls: null, // Would need a calls table
        emails: messagesThisWeek || 0,
        visits: visitsThisWeek,
        commits: pipelineCounts.committed,
        imageUrl: "",
      },
    ];

    // Stats summary
    const stats = {
      communications: {
        value: messagesThisWeek || 0,
        change: communicationChange,
        changeType: communicationChange >= 0 ? "increase" : "decrease",
      },
      campusVisits: {
        value: visitsThisWeek,
        comparison: "this quarter",
      },
      avgTimeToCommit: {
        value: null, // Would need timestamps on status changes
        change: 0,
      },
    };

    return NextResponse.json({
      funnel,
      stats,
      staffActivity,
      zoneCoverage: zoneCoverage.map((z) => ({
        ...z,
        height: `${Math.round((z.prospects / maxProspects) * 100)}%`,
      })),
    });
  } catch (error) {
    console.error("Error in reports API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

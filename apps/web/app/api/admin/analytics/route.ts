import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total user count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get users by role
    const { data: roleData } = await supabase
      .from("profiles")
      .select("role");

    const roleCounts: Record<string, number> = {};
    roleData?.forEach((p) => {
      const role = p.role || "other";
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    // Calculate role distribution percentages
    const total = totalUsers || 1;
    const roleDistribution = [
      {
        role: "Athletes",
        percentage: Math.round(((roleCounts["athlete"] || 0) / total) * 100),
        color: "bg-[#ef4343]",
      },
      {
        role: "Parents",
        percentage: Math.round(((roleCounts["parent"] || 0) / total) * 100),
        color: "bg-amber-500",
      },
      {
        role: "Coaches",
        percentage: Math.round(((roleCounts["coach"] || 0) / total) * 100),
        color: "bg-blue-500",
      },
      {
        role: "Recruiters",
        percentage: Math.round(((roleCounts["recruiter"] || 0) / total) * 100),
        color: "bg-emerald-500",
      },
      {
        role: "Clubs",
        percentage: Math.round(((roleCounts["club"] || 0) / total) * 100),
        color: "bg-purple-500",
      },
      {
        role: "Admins",
        percentage: Math.round(((roleCounts["admin"] || 0) / total) * 100),
        color: "bg-slate-400",
      },
    ];

    // Get athletes with profile completeness
    const { data: athletes } = await supabase
      .from("athletes")
      .select("height_inches, weight_lbs, forty_yard_time, gpa, profile:profiles(avatar_url, full_name)");

    // Calculate profile completeness distribution
    const completenessRanges = {
      "75% - 100%": 0,
      "50% - 75%": 0,
      "25% - 50%": 0,
      "0% - 25%": 0,
    };

    athletes?.forEach((athlete) => {
      let filledFields = 0;
      const totalFields = 5; // height, weight, forty, gpa, avatar

      if (athlete.height_inches) filledFields++;
      if (athlete.weight_lbs) filledFields++;
      if (athlete.forty_yard_time) filledFields++;
      if (athlete.gpa) filledFields++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((athlete.profile as any)?.[0]?.avatar_url || (athlete.profile as any)?.avatar_url) filledFields++;

      const percentage = (filledFields / totalFields) * 100;

      if (percentage >= 75) completenessRanges["75% - 100%"]++;
      else if (percentage >= 50) completenessRanges["50% - 75%"]++;
      else if (percentage >= 25) completenessRanges["25% - 50%"]++;
      else completenessRanges["0% - 25%"]++;
    });

    const athleteCount = athletes?.length || 1;
    const profileCompleteness = Object.entries(completenessRanges).map(
      ([range, count]) => ({
        range,
        percentage: Math.round((count / athleteCount) * 100),
      })
    );

    // Get signups from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: weekSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    // Get signups from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todaySignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get message activity (as a proxy for DAU)
    const { count: recentMessages } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get profile views as another engagement metric
    const { count: recentViews } = await supabase
      .from("profile_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Calculate approximate DAU based on activity
    const estimatedDAU = Math.max(
      todaySignups || 0,
      Math.floor((recentMessages || 0) + (recentViews || 0) / 5)
    );

    // Build KPI data — all values from real DB counts; change is 0 when no historical comparison
    const kpiData = [
      {
        id: "1",
        label: "DAU",
        value: String(estimatedDAU),
        change: 0,
        isPositive: estimatedDAU > 0,
      },
      {
        id: "2",
        label: "WAU",
        value: String(weekSignups || 0),
        change: 0,
        isPositive: (weekSignups || 0) > 0,
      },
      {
        id: "3",
        label: "MAU",
        value: String(totalUsers || 0),
        change: 0,
        isPositive: (totalUsers || 0) > 0,
      },
      {
        id: "4",
        label: "Daily Signups",
        value: String(todaySignups || 0),
        change: 0,
        isPositive: (todaySignups || 0) > 0,
      },
    ];

    // Get monthly growth data for chart
    const { data: growthData } = await supabase
      .from("profiles")
      .select("created_at")
      .order("created_at", { ascending: true });

    // Group by month
    const monthlyGrowth: Record<string, number> = {};
    growthData?.forEach((p) => {
      const month = new Date(p.created_at).toLocaleString("default", {
        month: "short",
      });
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });

    return NextResponse.json({
      kpiData,
      roleDistribution,
      profileCompleteness,
      totalUsers: totalUsers || 0,
      monthlyGrowth,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

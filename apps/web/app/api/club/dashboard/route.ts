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

    // Get tournaments for this club organizer
    const { data: tournamentsData } = await supabase
      .from("off_season_events")
      .select("*")
      .eq("organizer_id", user.id)
      .order("start_date", { ascending: false });

    const now = new Date();
    const tournaments =
      tournamentsData?.map((t) => {
        const startDate = new Date(t.start_date);
        const endDate = new Date(t.end_date);
        let status: "upcoming" | "active" | "completed" = "upcoming";

        if (endDate < now) {
          status = "completed";
        } else if (startDate <= now && endDate >= now) {
          status = "active";
        }

        return {
          id: t.id,
          name: t.name,
          date: startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          startDate: t.start_date,
          endDate: t.end_date,
          location: t.location || "TBD",
          registrations: t.teams_registered || 0,
          capacity: t.teams_capacity || 32,
          revenue: t.total_collected || 0,
          status: t.status || status,
        };
      }) || [];

    // Get verifications queue (athletes associated with tournaments)
    const { data: verificationsData } = await supabase
      .from("athlete_verifications")
      .select(
        `
        id,
        athlete_id,
        type,
        status,
        created_at,
        profiles:athlete_id (
          full_name
        )
      `
      )
      .eq("club_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    const verifications =
      verificationsData?.map((v) => {
        const createdAt = new Date(v.created_at);
        const diffHours = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        );
        const submittedAt =
          diffHours < 24
            ? `${diffHours} hours ago`
            : `${Math.floor(diffHours / 24)} days ago`;

        return {
          id: v.id,
          athleteId: v.athlete_id,
          athleteName:
            (v.profiles as { full_name?: string } | null)?.full_name ||
            "Unknown",
          type: v.type as "identity" | "academic" | "athletic",
          submittedAt,
          status: v.status || "pending",
        };
      }) || [];

    // Get recent payments
    const { data: paymentsData } = await supabase
      .from("tournament_payments")
      .select(
        `
        id,
        description,
        amount,
        status,
        created_at,
        tournament_id
      `
      )
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const payments =
      paymentsData?.map((p) => {
        const createdAt = new Date(p.created_at);
        const diffDays = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const date =
          diffDays === 0
            ? "Today"
            : diffDays === 1
              ? "Yesterday"
              : `${diffDays} days ago`;

        return {
          id: p.id,
          description: p.description || "Tournament Registration",
          amount: p.amount || 0,
          status: p.status as "completed" | "pending" | "failed",
          date,
          tournamentId: p.tournament_id,
        };
      }) || [];

    // Calculate metrics
    const activeEvents = tournaments.filter(
      (t) => t.status === "active" || t.status === "upcoming"
    ).length;
    const totalRegistrations = tournaments.reduce(
      (sum, t) => sum + t.registrations,
      0
    );
    const totalRevenue = tournaments.reduce((sum, t) => sum + t.revenue, 0);

    const metrics = {
      activeEvents,
      totalRegistrations,
      totalRevenue,
      pendingVerifications: verifications.length,
    };

    return NextResponse.json({
      tournaments,
      verifications,
      payments,
      metrics,
    });
  } catch (error) {
    console.error("Club dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

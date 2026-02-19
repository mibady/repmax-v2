import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  division: z.enum(["D1", "D2", "D3", "NAIA", "JUCO"]).optional(),
  conference: z.string().optional(),
  metric: z.enum(["overall", "recruiting", "development", "nfl_draft"]).default("overall"),
  limit: z.coerce.number().min(1).max(100).default(25),
});

// GET /api/rankings/program
// Returns program rankings (overall program strength, not just current class)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      division: searchParams.get("division") as any || undefined,
      conference: searchParams.get("conference") || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metric: searchParams.get("metric") as any || "overall",
      limit: searchParams.get("limit") || 25,
    });

    // For now, aggregate from class rankings
    // In production, this would be a separate program_rankings table
    const currentYear = new Date().getFullYear();

    const { data: rankings, error } = await supabase
      .from("class_rankings")
      .select("school_name, division, conference, overall_rank, total_commits, points")
      .gte("class_year", currentYear - 3)
      .lte("class_year", currentYear);

    if (error) {
      console.error("Error fetching program rankings:", error);
    }

    // Aggregate by school
    const programScores: Record<string, {
      school_name: string;
      division: string;
      conference: string;
      total_points: number;
      avg_rank: number;
      total_commits: number;
      years_ranked: number;
    }> = {};

    rankings?.forEach(r => {
      if (!programScores[r.school_name]) {
        programScores[r.school_name] = {
          school_name: r.school_name,
          division: r.division,
          conference: r.conference || "Unknown",
          total_points: 0,
          avg_rank: 0,
          total_commits: 0,
          years_ranked: 0,
        };
      }
      programScores[r.school_name].total_points += parseFloat(r.points?.toString() || "0");
      programScores[r.school_name].avg_rank += r.overall_rank || 0;
      programScores[r.school_name].total_commits += r.total_commits || 0;
      programScores[r.school_name].years_ranked++;
    });

    // Calculate averages and sort
    let programList = Object.values(programScores).map(p => ({
      ...p,
      avg_rank: p.years_ranked > 0 ? Math.round(p.avg_rank / p.years_ranked) : 999,
      avg_points: p.years_ranked > 0 ? (p.total_points / p.years_ranked).toFixed(2) : "0",
    }));

    // Filter by division/conference if specified
    if (params.division) {
      programList = programList.filter(p => p.division === params.division);
    }
    if (params.conference) {
      programList = programList.filter(p => p.conference === params.conference);
    }

    // Sort by metric
    programList.sort((a, b) => {
      switch (params.metric) {
        case "recruiting":
          return parseFloat(b.avg_points) - parseFloat(a.avg_points);
        default:
          return a.avg_rank - b.avg_rank;
      }
    });

    // Add rank
    const rankedPrograms = programList.slice(0, params.limit).map((p, i) => ({
      rank: i + 1,
      ...p,
    }));

    return NextResponse.json({
      programs: rankedPrograms,
      metric: params.metric,
    });
  } catch (error) {
    console.error("Program rankings API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

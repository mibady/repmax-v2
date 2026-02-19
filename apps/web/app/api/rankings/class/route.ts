import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  year: z.coerce.number().min(2020).max(2035).optional(),
  division: z.enum(["D1", "D2", "D3", "NAIA", "JUCO"]).optional(),
  conference: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
});

// GET /api/rankings/class
// Returns college recruiting class rankings
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
      year: searchParams.get("year") || new Date().getFullYear(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      division: searchParams.get("division") as any || undefined,
      conference: searchParams.get("conference") || undefined,
      limit: searchParams.get("limit") || 25,
    });

    // Build query
    let query = supabase
      .from("class_rankings")
      .select("*")
      .eq("class_year", params.year || new Date().getFullYear())
      .order("overall_rank", { ascending: true, nullsFirst: false })
      .limit(params.limit);

    if (params.division) {
      query = query.eq("division", params.division);
    }

    if (params.conference) {
      query = query.eq("conference", params.conference);
    }

    const { data: rankings, error: rankingsError } = await query;

    if (rankingsError) {
      console.error("Error fetching class rankings:", rankingsError);
      return NextResponse.json({ error: "Failed to fetch rankings" }, { status: 500 });
    }

    return NextResponse.json({
      rankings: rankings || [],
      year: params.year || new Date().getFullYear(),
    });
  } catch (error) {
    console.error("Class rankings API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

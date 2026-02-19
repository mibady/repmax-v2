import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Query params schema for filtering
const QuerySchema = z.object({
  position: z.string().optional(),
  state: z.string().optional(),
  zone: z.string().optional(),
  class_year: z.coerce.number().optional(),
  min_stars: z.coerce.number().min(1).max(5).optional(),
  verified: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const params = QuerySchema.parse(Object.fromEntries(searchParams));

    // Build query
    let query = supabase
      .from("athletes")
      .select(
        `
        *,
        profile:profiles(id, full_name, avatar_url)
      `,
        { count: "exact" }
      )
      .order("repmax_score", { ascending: false, nullsFirst: false });

    // Apply filters
    if (params.position) {
      query = query.or(
        `primary_position.eq.${params.position},secondary_position.eq.${params.position}`
      );
    }
    if (params.state) {
      query = query.eq("state", params.state);
    }
    if (params.zone) {
      query = query.eq("zone", params.zone);
    }
    if (params.class_year) {
      query = query.eq("class_year", params.class_year);
    }
    if (params.min_stars) {
      query = query.gte("star_rating", params.min_stars);
    }
    if (params.verified === "true") {
      query = query.eq("verified", true);
    }

    // Apply pagination
    query = query.range(params.offset, params.offset + params.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Athletes query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      athletes: data,
      total: count,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Athletes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

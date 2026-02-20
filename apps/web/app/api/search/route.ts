import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await rateLimit(user.id);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    // Return empty results for short queries
    if (q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search athletes by name (via profiles join) or by position
    const searchPattern = `%${q}%`;

    // Query profiles that have an athlete record
    const { data: nameResults, error: nameError } = await supabase
      .from("athletes")
      .select("id, primary_position, class_year, state, profile_id, profiles!inner(id, full_name)")
      .ilike("profiles.full_name", searchPattern)
      .limit(20);

    if (nameError) {
      console.error("Search name query error:", nameError);
    }

    // Also search by position
    const { data: positionResults, error: positionError } = await supabase
      .from("athletes")
      .select("id, primary_position, class_year, state, profile_id, profiles!inner(id, full_name)")
      .ilike("primary_position", searchPattern)
      .limit(20);

    if (positionError) {
      console.error("Search position query error:", positionError);
    }

    // Merge and deduplicate results
    const seenIds = new Set<string>();
    const results: Array<{
      id: string;
      name: string;
      type: "athlete";
      position: string | null;
      classYear: string | null;
      state: string | null;
    }> = [];

    const allRows = [...(nameResults || []), ...(positionResults || [])];

    for (const row of allRows) {
      if (seenIds.has(row.id)) continue;
      seenIds.add(row.id);

      // profiles is returned as an object (inner join single)
      const profile = row.profiles as unknown as { id: string; full_name: string } | null;

      results.push({
        id: profile?.id || row.profile_id,
        name: profile?.full_name || "Unknown",
        type: "athlete",
        position: row.primary_position,
        classYear: row.class_year,
        state: row.state,
      });

      if (results.length >= 20) break;
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
